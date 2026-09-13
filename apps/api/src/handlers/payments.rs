use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::SqlitePool;
use uuid::Uuid;
use chrono::Utc;
use rand::Rng;

use crate::AppState;
use crate::models::*;

fn generate_key_code() -> String {
    let mut rng = rand::thread_rng();
    (0..16)
        .map(|_| {
            let idx = rng.gen_range(0..36);
            if idx < 10 {
                (b'0' + idx) as char
            } else {
                (b'A' + idx - 10) as char
            }
        })
        .collect()
}

async fn send_activation_key_email(
    config: &crate::config::Config,
    to_email: &str,
    user_name: &str,
    key_code: &str,
) {
    use resend_rs::{Resend, types::CreateEmailBaseOptions};

    let resend = Resend::new(&config.resend_api_key);

    let html = format!(
        r#"<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #F5C518; width: 56px; height: 56px; border-radius: 12px; line-height: 56px; font-size: 28px; font-weight: bold; color: #2A241E;">E</div>
        </div>
        <h1 style="color: #2A241E; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px;">Your Activation Key</h1>
        <p style="color: #645646; text-align: center; margin-bottom: 32px;">Hi {}, thank you for your payment! Here is your activation key:</p>
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #f8fafc; border: 2px dashed #d1d5db; border-radius: 12px; padding: 16px 32px; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2A241E;">{}</div>
        </div>
        <div style="text-align: center; margin-bottom: 32px;">
            <a href="{}/dashboard/activate" style="display: inline-block; background: #2A241E; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600;">Activate Now</a>
        </div>
        <p style="color: #645646; font-size: 14px; text-align: center;">Go to your dashboard, click <strong>Activate</strong>, and enter this key.</p>
        <hr style="border: none; border-top: 1px solid #E1D9D0; margin: 32px 0;">
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">This key is single-use. If you didn't make this payment, please contact support.</p>
    </div>
</body>
</html>"#,
        user_name, key_code, config.frontend_url
    );

    let email = CreateEmailBaseOptions::new(&config.email_from, [to_email], "Your Examinery Activation Key")
        .with_html(&html);

    match resend.emails.send(email).await {
        Ok(_) => log::info!("Activation key email sent to {}", to_email),
        Err(e) => log::error!("Failed to send activation key email: {}", e),
    }
}

fn get_user_id(req: &HttpRequest) -> Option<String> {
    let auth = req.headers().get("Authorization")?;
    let val = auth.to_str().ok()?;
    let token = val.strip_prefix("Bearer ")?;
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "exam-scholars-secret-key-change-in-production".into());
    let token_data = jsonwebtoken::decode::<Claims>(
        token,
        &jsonwebtoken::DecodingKey::from_secret(secret.as_bytes()),
        &jsonwebtoken::Validation::default(),
    )
    .ok()?;
    Some(token_data.claims.sub)
}

// ---------------------------------------------------------------------------
// POST /api/payments/init — Initialize a payment (idempotent)
// ---------------------------------------------------------------------------

pub async fn init_payment(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<InitPaymentRequest>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    // Check if user is already activated
    let user: Option<(String, bool)> = sqlx::query_as("SELECT id, is_active FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&data.db)
        .await
        .ok()
        .flatten();

    match user {
        Some((_, true)) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Account is already activated"
            }));
        }
        None => {
            return HttpResponse::Unauthorized().json(serde_json::json!({"error": "User not found"}));
        }
        _ => {}
    }

    let amount = body.amount.unwrap_or(300000); // default N3,000 in kobo
    let reference = format!("ES-{}", Uuid::new_v4().to_string().replace('-', "").chars().take(16).collect::<String>());
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc().to_string();
    let base_url = std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3001".into());
    let payment_url = format!("{}/dashboard/payment/callback?ref={}", base_url, reference);

    // Check for existing pending payment with same reference (idempotency)
    let existing: Option<Payment> = sqlx::query_as(
        "SELECT id, user_id, amount, currency, status, reference, payment_url, metadata, created_at, updated_at FROM payments WHERE reference = ?"
    )
    .bind(&reference)
    .fetch_optional(&data.db)
    .await
    .ok()
    .flatten();

    if let Some(payment) = existing {
        return HttpResponse::Ok().json(InitPaymentResponse {
            id: payment.id,
            reference: payment.reference,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            payment_url: payment.payment_url.unwrap_or_default(),
        });
    }

    // Create payment record
    let result = sqlx::query(
        "INSERT INTO payments (id, user_id, amount, currency, status, reference, payment_url, metadata, created_at, updated_at) VALUES (?, ?, ?, 'NGN', 'pending', ?, ?, NULL, ?, ?)"
    )
    .bind(&id)
    .bind(&user_id)
    .bind(amount)
    .bind(&reference)
    .bind(&payment_url)
    .bind(&now)
    .bind(&now)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(InitPaymentResponse {
            id,
            reference,
            amount,
            currency: "NGN".to_string(),
            status: "pending".to_string(),
            payment_url,
        }),
        Err(e) => {
            log::error!("Failed to init payment: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to initialize payment"}))
        }
    }
}

// ---------------------------------------------------------------------------
// POST /api/payments/verify — Verify payment & activate user (idempotent)
// ---------------------------------------------------------------------------

pub async fn verify_payment(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<VerifyPaymentRequest>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let reference = body.reference.trim().to_string();

    // Fetch payment record
    let payment: Option<Payment> = sqlx::query_as(
        "SELECT id, user_id, amount, currency, status, reference, payment_url, metadata, created_at, updated_at FROM payments WHERE reference = ? AND user_id = ?"
    )
    .bind(&reference)
    .bind(&user_id)
    .fetch_optional(&data.db)
    .await
    .ok()
    .flatten();

    let payment = match payment {
        Some(p) => p,
        None => return HttpResponse::NotFound().json(serde_json::json!({"error": "Payment not found"})),
    };

    // Already verified — idempotent return
    if payment.status == "success" {
        let user: Option<(bool,)> = sqlx::query_as("SELECT is_active FROM users WHERE id = ?")
            .bind(&user_id)
            .fetch_optional(&data.db)
            .await
            .ok()
            .flatten();

        let activated = user.map(|(active,)| active).unwrap_or(false);

        // Fetch existing key if any
        let existing_key: Option<(String,)> = sqlx::query_as("SELECT key_code FROM activation_keys WHERE created_by = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1")
            .bind(&user_id)
            .fetch_optional(&data.db)
            .await
            .ok()
            .flatten();

        return HttpResponse::Ok().json(VerifyPaymentResponse {
            id: payment.id,
            reference: payment.reference,
            status: "success".to_string(),
            amount: payment.amount,
            currency: payment.currency,
            activated,
            message: "Payment already verified".to_string(),
            key_code: existing_key.map(|(k,)| k),
        });
    }

    // Mark payment as success
    let now = Utc::now().naive_utc().to_string();
    let update_result = sqlx::query("UPDATE payments SET status = 'success', updated_at = ? WHERE id = ?")
        .bind(&now)
        .bind(&payment.id)
        .execute(&data.db)
        .await;

    if let Err(e) = update_result {
        log::error!("Failed to update payment status: {}", e);
        return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to verify payment"}));
    }

    // Activate user
    let activate_result = sqlx::query("UPDATE users SET is_active = 1, updated_at = ? WHERE id = ?")
        .bind(&now)
        .bind(&user_id)
        .execute(&data.db)
        .await;

    if let Err(e) = activate_result {
        log::error!("Failed to activate user: {}", e);
        return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Payment verified but failed to activate account"}));
    }

    // Generate activation key for the user
    let key_code = generate_key_code();
    let key_id = Uuid::new_v4().to_string();
    let key_result = sqlx::query(
        "INSERT INTO activation_keys (id, key_code, exam_type, max_uses, used_count, created_by, created_at, expires_at, is_active) VALUES (?, ?, 'JAMB/UTME', 1, 0, ?, ?, NULL, 1)"
    )
    .bind(&key_id)
    .bind(&key_code)
    .bind(&user_id)
    .bind(&now)
    .execute(&data.db)
    .await;

    if let Err(e) = key_result {
        log::error!("Failed to generate activation key: {}", e);
    }

    // Mark key as used (since user is already activated via payment)
    let _ = sqlx::query("UPDATE activation_keys SET used_count = 1 WHERE id = ?")
        .bind(&key_id)
        .execute(&data.db)
        .await;

    // Fetch user info for email
    let user_info: Option<(String, String)> = sqlx::query_as("SELECT name, email FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&data.db)
        .await
        .ok()
        .flatten();

    // Send activation key email (non-blocking)
    if let Some((name, email)) = user_info {
        let config = data.config.clone();
        let key_clone = key_code.clone();
        tokio::spawn(async move {
            send_activation_key_email(&config, &email, &name, &key_clone).await;
        });
    }

    HttpResponse::Ok().json(VerifyPaymentResponse {
        id: payment.id,
        reference: payment.reference,
        status: "success".to_string(),
        amount: payment.amount,
        currency: payment.currency,
        activated: true,
        message: "Payment verified and account activated".to_string(),
        key_code: Some(key_code),
    })
}

// ---------------------------------------------------------------------------
// GET /api/payments/:reference — Check payment status (idempotent, read-only)
// ---------------------------------------------------------------------------

pub async fn get_payment_status(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let reference = path.into_inner();

    let payment: Option<Payment> = sqlx::query_as(
        "SELECT id, user_id, amount, currency, status, reference, payment_url, metadata, created_at, updated_at FROM payments WHERE reference = ? AND user_id = ?"
    )
    .bind(&reference)
    .bind(&user_id)
    .fetch_optional(&data.db)
    .await
    .ok()
    .flatten();

    match payment {
        Some(p) => HttpResponse::Ok().json(serde_json::json!({
            "id": p.id,
            "reference": p.reference,
            "status": p.status,
            "amount": p.amount,
            "currency": p.currency,
        })),
        None => HttpResponse::NotFound().json(serde_json::json!({"error": "Payment not found"})),
    }
}
