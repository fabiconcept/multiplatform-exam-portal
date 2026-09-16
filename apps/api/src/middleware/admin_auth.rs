use actix_web::body::EitherBody;
use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::Error;
use actix_web::HttpResponse;
use futures::future::{ok, LocalBoxFuture, Ready};

#[derive(Clone)]
pub struct AdminAuth {
    pub jwt_secret: String,
}

impl AdminAuth {
    pub fn new(jwt_secret: String) -> Self {
        Self { jwt_secret }
    }
}

impl<S, B> Transform<S, ServiceRequest> for AdminAuth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type InitError = ();
    type Transform = AdminAuthMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(AdminAuthMiddleware {
            service,
            jwt_secret: self.jwt_secret.clone(),
        })
    }
}

pub struct AdminAuthMiddleware<S> {
    service: S,
    jwt_secret: String,
}

impl<S, B> Service<ServiceRequest> for AdminAuthMiddleware<S>
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
        let path = req.path().to_string();

        if path.ends_with("/admin/login") {
            let fut = self.service.call(req);
            return Box::pin(async move {
                let res = fut.await?;
                Ok(res.map_into_left_body())
            });
        }

        let token = match req
            .headers()
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.strip_prefix("Bearer "))
        {
            Some(t) => t.to_string(),
            None => {
                let response = req.into_response(
                    HttpResponse::Unauthorized()
                        .json(serde_json::json!({"error": "Missing authorization token"})),
                );
                return Box::pin(async { Ok(response.map_into_right_body()) });
            }
        };

        let secret = self.jwt_secret.clone();

        let token_data = jsonwebtoken::decode::<crate::models::Claims>(
            &token,
            &jsonwebtoken::DecodingKey::from_secret(secret.as_bytes()),
            &crate::middleware::auth::hs256_validation(),
        );

        let _user_id = match token_data {
            Ok(td) => td.claims.sub,
            Err(_) => {
                let response = req.into_response(
                    HttpResponse::Unauthorized()
                        .json(serde_json::json!({"error": "Invalid or expired token"})),
                );
                return Box::pin(async { Ok(response.map_into_right_body()) });
            }
        };

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            Ok(res.map_into_left_body())
        })
    }
}
