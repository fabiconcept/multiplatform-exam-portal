use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use actix_web::body::EitherBody;
use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::Error;
use actix_web::HttpResponse;
use futures::future::{ok, LocalBoxFuture, Ready};

const MAX_BUCKET_ENTRIES: usize = 10_000;
const BUCKET_TTL: Duration = Duration::from_secs(300);

fn evict_buckets(buckets: &mut HashMap<String, TokenBucket>) {
    if buckets.len() <= MAX_BUCKET_ENTRIES {
        return;
    }
    let now = Instant::now();
    buckets.retain(|_, bucket| now.duration_since(bucket.last_seen) < BUCKET_TTL);
}

#[derive(Clone)]
pub struct TokenBucket {
    pub capacity: u32,
    pub tokens: f64,
    pub last_refill: Instant,
    pub refill_rate: f64,
    pub last_seen: Instant,
}

impl TokenBucket {
    pub fn new(capacity: u32, refill_rate: f64) -> Self {
        let now = Instant::now();
        Self {
            capacity,
            tokens: capacity as f64,
            last_refill: now,
            refill_rate,
            last_seen: now,
        }
    }

    pub fn consume(&mut self) -> bool {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last_refill).as_secs_f64();
        self.tokens = (self.tokens + elapsed * self.refill_rate).min(self.capacity as f64);
        self.last_refill = now;
        self.last_seen = now;

        if self.tokens >= 1.0 {
            self.tokens -= 1.0;
            true
        } else {
            false
        }
    }

    pub fn retry_after(&self) -> u64 {
        if self.tokens >= 1.0 {
            0
        } else {
            ((1.0 - self.tokens) / self.refill_rate).ceil() as u64
        }
    }
}

#[derive(Clone)]
pub struct RateLimitConfig {
    pub capacity: u32,
    pub refill_rate: f64,
}

impl RateLimitConfig {
    pub fn general() -> Self {
        Self {
            capacity: 300,
            refill_rate: 10.0,
        }
    }

    pub fn auth() -> Self {
        Self {
            capacity: 30,
            refill_rate: 2.0,
        }
    }

    pub fn strict() -> Self {
        Self {
            capacity: 10,
            refill_rate: 1.0,
        }
    }
}

#[derive(Clone)]
pub struct RateLimiter {
    pub state: Arc<Mutex<HashMap<String, TokenBucket>>>,
    pub config: RateLimitConfig,
}

impl RateLimiter {
    pub fn new(config: RateLimitConfig) -> Self {
        Self {
            state: Arc::new(Mutex::new(HashMap::new())),
            config,
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for RateLimiter
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type InitError = ();
    type Transform = RateLimiterMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(RateLimiterMiddleware {
            service,
            state: self.state.clone(),
            config: self.config.clone(),
        })
    }
}

pub struct RateLimiterMiddleware<S> {
    service: S,
    state: Arc<Mutex<HashMap<String, TokenBucket>>>,
    config: RateLimitConfig,
}

impl<S, B> Service<ServiceRequest> for RateLimiterMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(
        &self,
        ctx: &mut core::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        self.service.poll_ready(ctx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let key = req
            .peer_addr()
            .map(|addr| addr.ip().to_string())
            .unwrap_or_else(|| "unknown".to_string());

        let (allowed, retry_after, capacity) = {
            let mut buckets = self.state.lock().unwrap();
            evict_buckets(&mut buckets);
            let config = &self.config;
            let bucket = buckets
                .entry(key)
                .or_insert_with(|| TokenBucket::new(config.capacity, config.refill_rate));
            let allowed = bucket.consume();
            let retry_after = bucket.retry_after();
            let cap = config.capacity;
            (allowed, retry_after, cap)
        };

        if !allowed {
            let body = serde_json::json!({
                "error": "Rate limit exceeded",
                "message": format!("Too many requests. Try again in {} seconds.", retry_after),
                "retry_after": retry_after,
            })
            .to_string();

            let response = req.into_response(
                HttpResponse::TooManyRequests()
                    .insert_header(("Content-Type", "application/json"))
                    .insert_header(("Retry-After", retry_after.to_string()))
                    .insert_header(("X-RateLimit-Limit", capacity.to_string()))
                    .insert_header(("X-RateLimit-Remaining", "0"))
                    .body(body),
            );
            return Box::pin(async move { Ok(response.map_into_right_body()) });
        }

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            Ok(res.map_into_left_body())
        })
    }
}
