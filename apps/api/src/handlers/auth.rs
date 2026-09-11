use actix_web::{web, HttpResponse, HttpRequest};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use uuid::Uuid;
use chrono::Utc;

use crate::AppState;
use crate::models::{RegisterRequest, LoginRequest, AuthResponse, UserResponse, User, Claims, ForgotPasswordRequest, ResetPasswordRequest, PasswordReset, EmailVerification, VerifyEmailRequest, SendVerificationRequest, TrackUsageRequest, UsageStatusResponse, UpdateProfileRequest, UpdatePasswordRequest, UpdateSettingsRequest, UserSettings, ExamWithCounts, Subject, Topic};

pub async fn register(
    data: web::Data<AppState>,
    body: web::Json<RegisterRequest>,
) -> HttpResponse {
    let existing = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = ?")
        .bind(&body.email)
        .fetch_optional(&data.db)
        .await;

    if let Ok(Some(_)) = existing {
        return HttpResponse::Conflict().json(serde_json::json!({
            "error": "Email already registered"
        }));
    }

    let password_hash = match hash(&body.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to hash password"
        })),
    };

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();

    let result = sqlx::query(
        "INSERT INTO users (id, name, email, password_hash, phone, school, target_exam, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)"
    )
    .bind(&id)
    .bind(&body.name)
    .bind(&body.email)
    .bind(&password_hash)
    .bind(&body.phone)
    .bind(&body.school)
    .bind(&body.target_exam)
    .bind(now)
    .bind(now)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
                .bind(&id)
                .fetch_one(&data.db)
                .await
                .unwrap();

            let token = create_token(&id, &data.config.jwt_secret, data.config.jwt_expires_in);

            let verification_token = Uuid::new_v4().to_string();
            let verification_id = Uuid::new_v4().to_string();
            let expires_at = Utc::now().naive_utc() + chrono::Duration::hours(24);

            let _ = sqlx::query(
                "INSERT INTO email_verifications (id, user_id, email, token, expires_at, verified, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)"
            )
            .bind(&verification_id)
            .bind(&id)
            .bind(&body.email)
            .bind(&verification_token)
            .bind(expires_at)
            .bind(now)
            .execute(&data.db)
            .await;

            if let Err(e) = send_verification_email(&data.config, &body.email, &verification_token, &body.name).await {
                log::error!("Failed to send verification email: {}", e);
            }

            HttpResponse::Created().json(AuthResponse {
                token,
                user: UserResponse::from(user),
            })
        }
        Err(e) => {
            log::error!("Registration error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create user"
            }))
        }
    }
}

pub async fn login(
    data: web::Data<AppState>,
    body: web::Json<LoginRequest>,
) -> HttpResponse {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = ?")
        .bind(&body.email)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(user)) => {
            if verify(&body.password, &user.password_hash).unwrap_or(false) {
                let token = create_token(&user.id, &data.config.jwt_secret, data.config.jwt_expires_in);
                if let Some(ref device_info) = body.device_info {
                    log::info!("Login from user {} - Device: {}", user.email, device_info);
                }
                HttpResponse::Ok().json(AuthResponse {
                    token,
                    user: UserResponse::from(user),
                })
            } else {
                HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "Invalid email or password"
                }))
            }
        }
        Ok(None) => HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Invalid email or password"
        })),
        Err(e) => {
            log::error!("Login error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn me(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized"
        })),
    };

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(user)) => HttpResponse::Ok().json(UserResponse::from(user)),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "User not found"
        })),
        Err(e) => {
            log::error!("Fetch user error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

fn create_token(user_id: &str, secret: &str, expires_in: i64) -> String {
    let claims = Claims {
        sub: user_id.to_string(),
        exp: (Utc::now().timestamp() + expires_in) as usize,
    };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_bytes()))
        .unwrap()
}

fn extract_user_id(req: &HttpRequest, secret: &str) -> Option<String> {
    let auth_header = req.headers().get("Authorization")?;
    let token = auth_header.to_str().ok()?.strip_prefix("Bearer ")?;
    
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    ).ok()?;

    Some(token_data.claims.sub)
}

pub async fn forgot_password(
    data: web::Data<AppState>,
    body: web::Json<ForgotPasswordRequest>,
) -> HttpResponse {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = ?")
        .bind(&body.email)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(_user)) => {
            let token = Uuid::new_v4().to_string();
            let id = Uuid::new_v4().to_string();
            let now = Utc::now().naive_utc();
            let expires_at = Utc::now().naive_utc() + chrono::Duration::hours(1);

            let _ = sqlx::query(
                "INSERT INTO password_resets (id, user_id, token, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, ?)"
            )
            .bind(&id)
            .bind(&_user.id)
            .bind(&token)
            .bind(expires_at)
            .bind(now)
            .execute(&data.db)
            .await;

            if let Err(e) = send_password_reset_email(&data.config, &body.email, &token, &_user.name).await {
                log::error!("Failed to send password reset email: {}", e);
            }

            HttpResponse::Ok().json(serde_json::json!({
                "message": "If an account exists with this email, you will receive a password reset link."
            }))
        }
        Ok(None) => HttpResponse::Ok().json(serde_json::json!({
            "message": "If an account exists with this email, you will receive a password reset link."
        })),
        Err(e) => {
            log::error!("Forgot password error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn reset_password(
    data: web::Data<AppState>,
    body: web::Json<ResetPasswordRequest>,
) -> HttpResponse {
    let reset = sqlx::query_as::<_, PasswordReset>(
        "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > datetime('now')"
    )
    .bind(&body.token)
    .fetch_optional(&data.db)
    .await;

    match reset {
        Ok(Some(reset_record)) => {
            let password_hash = match hash(&body.password, DEFAULT_COST) {
                Ok(h) => h,
                Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to hash password"
                })),
            };

            let now = Utc::now().naive_utc();

            let _ = sqlx::query("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
                .bind(&password_hash)
                .bind(now)
                .bind(&reset_record.user_id)
                .execute(&data.db)
                .await;

            let _ = sqlx::query("UPDATE password_resets SET used = 1 WHERE id = ?")
                .bind(&reset_record.id)
                .execute(&data.db)
                .await;

            HttpResponse::Ok().json(serde_json::json!({
                "message": "Password has been reset successfully"
            }))
        }
        Ok(None) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid or expired reset token"
        })),
        Err(e) => {
            log::error!("Reset password error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

async fn send_verification_email(
    config: &crate::config::Config,
    to_email: &str,
    token: &str,
    user_name: &str,
) -> Result<(), String> {
    use resend_rs::{Resend, types::CreateEmailBaseOptions};

    let resend = Resend::new(&config.resend_api_key);
    
    let verify_url = format!("{}/verify-email?token={}", config.frontend_url, token);
    
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
        <h1 style="color: #2A241E; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px;">Verify your email address</h1>
        <p style="color: #645646; text-align: center; margin-bottom: 32px;">Hi {}, welcome to ExamScholars! Please verify your email address to get started.</p>
        <div style="text-align: center; margin-bottom: 32px;">
            <a href="{}" style="display: inline-block; background: #2A241E; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600;">Verify Email Address</a>
        </div>
        <p style="color: #645646; font-size: 14px; text-align: center;">Or copy this link: <a href="{}" style="color: #F5C518;">{}</a></p>
        <hr style="border: none; border-top: 1px solid #E1D9D0; margin: 32px 0;">
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    </div>
</body>
</html>"#,
        user_name, verify_url, verify_url, verify_url
    );

    let email = CreateEmailBaseOptions::new(&config.email_from, [to_email], "Verify your ExamScholars email")
        .with_html(&html);

    match resend.emails.send(email).await {
        Ok(_) => {
            log::info!("Verification email sent to {}", to_email);
            Ok(())
        }
        Err(e) => {
            log::error!("Failed to send verification email: {}", e);
            Err(e.to_string())
        }
    }
}

async fn send_password_reset_email(
    config: &crate::config::Config,
    to_email: &str,
    token: &str,
    user_name: &str,
) -> Result<(), String> {
    use resend_rs::{Resend, types::CreateEmailBaseOptions};

    let resend = Resend::new(&config.resend_api_key);

    let reset_url = format!("{}/reset-password?token={}", config.frontend_url, token);

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
        <h1 style="color: #2A241E; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px;">Reset your password</h1>
        <p style="color: #645646; text-align: center; margin-bottom: 32px;">Hi {}, we received a request to reset your password. Click the button below to create a new password.</p>
        <div style="text-align: center; margin-bottom: 32px;">
            <a href="{}" style="display: inline-block; background: #2A241E; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </div>
        <p style="color: #645646; font-size: 14px; text-align: center;">Or copy this link: <a href="{}" style="color: #F5C518;">{}</a></p>
        <hr style="border: none; border-top: 1px solid #E1D9D0; margin: 32px 0;">
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
    </div>
</body>
</html>"#,
        user_name, reset_url, reset_url, reset_url
    );

    let email = CreateEmailBaseOptions::new(&config.email_from, [to_email], "Reset your ExamScholars password")
        .with_html(&html);

    match resend.emails.send(email).await {
        Ok(_) => {
            log::info!("Password reset email sent to {}", to_email);
            Ok(())
        }
        Err(e) => {
            log::error!("Failed to send password reset email: {}", e);
            Err(e.to_string())
        }
    }
}

pub async fn send_verification(
    data: web::Data<AppState>,
    body: web::Json<SendVerificationRequest>,
) -> HttpResponse {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = ?")
        .bind(&body.email)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(user)) => {
            let token = Uuid::new_v4().to_string();
            let id = Uuid::new_v4().to_string();
            let now = Utc::now().naive_utc();
            let expires_at = Utc::now().naive_utc() + chrono::Duration::hours(24);

            let _ = sqlx::query(
                "INSERT INTO email_verifications (id, user_id, email, token, expires_at, verified, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)"
            )
            .bind(&id)
            .bind(&user.id)
            .bind(&user.email)
            .bind(&token)
            .bind(expires_at)
            .bind(now)
            .execute(&data.db)
            .await;

            if let Err(e) = send_verification_email(&data.config, &user.email, &token, &user.name).await {
                log::error!("Send verification email error: {}", e);
            }

            HttpResponse::Ok().json(serde_json::json!({
                "message": "If an account exists with this email, a verification link has been sent."
            }))
        }
        Ok(None) => HttpResponse::Ok().json(serde_json::json!({
            "message": "If an account exists with this email, a verification link has been sent."
        })),
        Err(e) => {
            log::error!("Send verification error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn verify_email(
    data: web::Data<AppState>,
    body: web::Json<VerifyEmailRequest>,
) -> HttpResponse {
    let verification = sqlx::query_as::<_, EmailVerification>(
        "SELECT * FROM email_verifications WHERE token = ? AND verified = 0 AND expires_at > datetime('now')"
    )
    .bind(&body.token)
    .fetch_optional(&data.db)
    .await;

    match verification {
        Ok(Some(verification_record)) => {
            let now = Utc::now().naive_utc();

            let _ = sqlx::query("UPDATE email_verifications SET verified = 1 WHERE id = ?")
                .bind(&verification_record.id)
                .execute(&data.db)
                .await;

            let _ = sqlx::query("UPDATE users SET is_active = 1, updated_at = ? WHERE id = ?")
                .bind(now)
                .bind(&verification_record.user_id)
                .execute(&data.db)
                .await;

            HttpResponse::Ok().json(serde_json::json!({
                "message": "Email verified successfully"
            }))
        }
        Ok(None) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid or expired verification token"
        })),
        Err(e) => {
            log::error!("Verify email error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn check_verification_status(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized"
        })),
    };

    let verification = sqlx::query_as::<_, EmailVerification>(
        "SELECT * FROM email_verifications WHERE user_id = ? AND verified = 1 ORDER BY created_at DESC LIMIT 1"
    )
    .bind(&user_id)
    .fetch_optional(&data.db)
    .await;

    match verification {
        Ok(Some(_)) => HttpResponse::Ok().json(serde_json::json!({
            "verified": true
        })),
        Ok(None) => HttpResponse::Ok().json(serde_json::json!({
            "verified": false
        })),
        Err(e) => {
            log::error!("Check verification status error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

const FREE_QUESTION_LIMIT: i64 = 5;

pub async fn track_usage(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<TrackUsageRequest>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized"
        })),
    };

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(u)) if u.is_active => {
            let id = Uuid::new_v4().to_string();
            let now = Utc::now().naive_utc();
            let _ = sqlx::query(
                "INSERT INTO question_usage (id, user_id, question_key, exam_type, accessed_at) VALUES (?, ?, ?, ?, ?)"
            )
            .bind(&id)
            .bind(&user_id)
            .bind(&body.question_key)
            .bind(&body.exam_type)
            .bind(now)
            .execute(&data.db)
            .await;

            HttpResponse::Ok().json(serde_json::json!({
                "allowed": true,
                "is_activated": true,
            }))
        }
        Ok(Some(_)) => {
            let count = sqlx::query_scalar::<_, i64>(
                "SELECT COUNT(*) FROM question_usage WHERE user_id = ?"
            )
            .bind(&user_id)
            .fetch_one(&data.db)
            .await
            .unwrap_or(0);

            if count >= FREE_QUESTION_LIMIT {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "allowed": false,
                    "error": "Question limit reached",
                    "total_used": count,
                    "limit": FREE_QUESTION_LIMIT,
                    "is_activated": false,
                }));
            }

            let id = Uuid::new_v4().to_string();
            let now = Utc::now().naive_utc();
            let _ = sqlx::query(
                "INSERT INTO question_usage (id, user_id, question_key, exam_type, accessed_at) VALUES (?, ?, ?, ?, ?)"
            )
            .bind(&id)
            .bind(&user_id)
            .bind(&body.question_key)
            .bind(&body.exam_type)
            .bind(now)
            .execute(&data.db)
            .await;

            HttpResponse::Ok().json(serde_json::json!({
                "allowed": true,
                "is_activated": false,
                "total_used": count + 1,
                "limit": FREE_QUESTION_LIMIT,
                "remaining": FREE_QUESTION_LIMIT - count - 1,
            }))
        }
        Ok(None) => HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "User not found"
        })),
        Err(e) => {
            log::error!("Track usage error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn usage_status(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized"
        })),
    };

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(u)) if u.is_active => {
            HttpResponse::Ok().json(UsageStatusResponse {
                total_used: 0,
                limit: 0,
                remaining: 0,
                is_activated: true,
            })
        }
        Ok(Some(_)) => {
            let count = sqlx::query_scalar::<_, i64>(
                "SELECT COUNT(*) FROM question_usage WHERE user_id = ?"
            )
            .bind(&user_id)
            .fetch_one(&data.db)
            .await
            .unwrap_or(0);

            HttpResponse::Ok().json(UsageStatusResponse {
                total_used: count,
                limit: FREE_QUESTION_LIMIT,
                remaining: (FREE_QUESTION_LIMIT - count).max(0),
                is_activated: false,
            })
        }
        Ok(None) => HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "User not found"
        })),
        Err(e) => {
            log::error!("Usage status error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn update_profile(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<UpdateProfileRequest>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized"
        })),
    };

    let now = Utc::now().naive_utc();

    let result = sqlx::query(
        "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), school = COALESCE(?, school), target_exam = COALESCE(?, target_exam), target_score = COALESCE(?, target_score), updated_at = ? WHERE id = ?"
    )
    .bind(&body.name)
    .bind(&body.phone)
    .bind(&body.school)
    .bind(&body.target_exam)
    .bind(&body.target_score)
    .bind(now)
    .bind(&user_id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
                .bind(&user_id)
                .fetch_one(&data.db)
                .await
                .unwrap();

            HttpResponse::Ok().json(UserResponse::from(user))
        }
        Err(e) => {
            log::error!("Update profile error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update profile"
            }))
        }
    }
}

pub async fn update_password(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<UpdatePasswordRequest>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized"
        })),
    };

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(u)) => {
            if !verify(&body.current_password, &u.password_hash).unwrap_or(false) {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "Current password is incorrect"
                }));
            }

            let password_hash = match hash(&body.new_password, DEFAULT_COST) {
                Ok(h) => h,
                Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to hash password"
                })),
            };

            let now = Utc::now().naive_utc();
            let _ = sqlx::query("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
                .bind(&password_hash)
                .bind(now)
                .bind(&user_id)
                .execute(&data.db)
                .await;

            HttpResponse::Ok().json(serde_json::json!({
                "message": "Password updated successfully"
            }))
        }
        Ok(None) => HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "User not found"
        })),
        Err(e) => {
            log::error!("Update password error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn get_settings(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized"
        })),
    };

    let settings = sqlx::query_as::<_, UserSettings>(
        "SELECT * FROM user_settings WHERE user_id = ?"
    )
    .bind(&user_id)
    .fetch_optional(&data.db)
    .await;

    match settings {
        Ok(Some(s)) => HttpResponse::Ok().json(s),
        Ok(None) => {
            let id = Uuid::new_v4().to_string();
            let _ = sqlx::query(
                "INSERT INTO user_settings (user_id, notifications, email_updates, sound_effects, dark_mode, auto_save, show_explanations, timer_warning) VALUES (?, 1, 0, 1, 0, 1, 1, 1)"
            )
            .bind(&user_id)
            .execute(&data.db)
            .await;

            let settings = sqlx::query_as::<_, UserSettings>(
                "SELECT * FROM user_settings WHERE user_id = ?"
            )
            .bind(&user_id)
            .fetch_one(&data.db)
            .await
            .unwrap();

            HttpResponse::Ok().json(settings)
        }
        Err(e) => {
            log::error!("Get settings error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn update_settings(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<UpdateSettingsRequest>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized"
        })),
    };

    let _ = sqlx::query(
        "INSERT INTO user_settings (user_id, notifications, email_updates, sound_effects, dark_mode, auto_save, show_explanations, timer_warning) VALUES (?, 1, 0, 1, 0, 1, 1, 1) ON CONFLICT(user_id) DO NOTHING"
    )
    .bind(&user_id)
    .execute(&data.db)
    .await;

    let result = sqlx::query(
        "UPDATE user_settings SET notifications = COALESCE(?, notifications), email_updates = COALESCE(?, email_updates), sound_effects = COALESCE(?, sound_effects), dark_mode = COALESCE(?, dark_mode), auto_save = COALESCE(?, auto_save), show_explanations = COALESCE(?, show_explanations), timer_warning = COALESCE(?, timer_warning) WHERE user_id = ?"
    )
    .bind(body.notifications)
    .bind(body.email_updates)
    .bind(body.sound_effects)
    .bind(body.dark_mode)
    .bind(body.auto_save)
    .bind(body.show_explanations)
    .bind(body.timer_warning)
    .bind(&user_id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let settings = sqlx::query_as::<_, UserSettings>(
                "SELECT * FROM user_settings WHERE user_id = ?"
            )
            .bind(&user_id)
            .fetch_one(&data.db)
            .await
            .unwrap();

            HttpResponse::Ok().json(settings)
        }
        Err(e) => {
            log::error!("Update settings error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update settings"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// Public exam endpoints (for students)
// ---------------------------------------------------------------------------

pub async fn list_public_exams(data: web::Data<AppState>) -> HttpResponse {
    let exams = sqlx::query_as::<_, ExamWithCounts>(
        "SELECT e.id, e.name, e.slug, e.description, e.total_questions, e.time_limit_minutes, e.is_active, e.icon_url, e.created_at, (SELECT COUNT(*) FROM subjects WHERE exam_id = e.id AND is_active = 1) AS subject_count, (SELECT COUNT(*) FROM questions WHERE exam_type = e.slug AND is_active = 1) AS question_count FROM exams e WHERE e.is_active = 1 ORDER BY e.created_at DESC",
    )
    .fetch_all(&data.db)
    .await;

    match exams {
        Ok(exams) => HttpResponse::Ok().json(serde_json::json!({
            "exams": exams,
            "total": exams.len(),
        })),
        Err(e) => {
            log::error!("List public exams error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn list_public_exam_subjects(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let exam_id = path.into_inner();

    let subjects = sqlx::query_as::<_, Subject>(
        "SELECT * FROM subjects WHERE exam_id = ? AND is_active = 1 ORDER BY name",
    )
    .bind(&exam_id)
    .fetch_all(&data.db)
    .await;

    match subjects {
        Ok(subjects) => HttpResponse::Ok().json(serde_json::json!({
            "subjects": subjects,
            "total": subjects.len(),
        })),
        Err(e) => {
            log::error!("List public exam subjects error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn list_public_subject_topics(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let subject_id = path.into_inner();

    let topics = sqlx::query_as::<_, Topic>(
        "SELECT * FROM topics WHERE subject_id = ? AND is_active = 1 ORDER BY name",
    )
    .bind(&subject_id)
    .fetch_all(&data.db)
    .await;

    match topics {
        Ok(topics) => HttpResponse::Ok().json(serde_json::json!({
            "topics": topics,
            "total": topics.len(),
        })),
        Err(e) => {
            log::error!("List public subject topics error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}
