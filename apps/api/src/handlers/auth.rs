use actix_web::{web, HttpResponse, HttpRequest};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use uuid::Uuid;
use chrono::Utc;
use sqlx::FromRow;

use crate::AppState;
use crate::models::{RegisterRequest, LoginRequest, AuthResponse, UserResponse, User, Claims, ForgotPasswordRequest, ResetPasswordRequest, PasswordReset, EmailVerification, VerifyEmailRequest, SendVerificationRequest, TrackUsageRequest, UsageStatusResponse, UpdateProfileRequest, UpdatePasswordRequest, UpdateSettingsRequest, UserSettings, ExamWithCounts, Subject, Topic, ExamSession, CreateSessionRequest, SessionResponse, SessionQuestion, SubmitAnswerRequest, SubmitAllRequest, SessionResult, SubjectResult, DifficultyResult, ExamAnswer, Bookmark, CreateBookmarkRequest, BookmarkedQuestion, UserStats, ActivateRequest, ActivationResponse, ActivationKey};
use crate::middleware::auth::require_active_user;

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
                user: UserResponse::from_user_with_verification(user, &data.db).await,
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
            // Check if user is banned
            if user.is_banned {
                let reason = user.ban_reason.unwrap_or_else(|| "Your account has been banned. Please contact support.".to_string());
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "error": "Account banned",
                    "message": reason
                }));
            }

            if verify(&body.password, &user.password_hash).unwrap_or(false) {
                let token = create_token(&user.id, &data.config.jwt_secret, data.config.jwt_expires_in);
                if let Some(ref device_info) = body.device_info {
                    log::info!("Login from user {} - Device: {}", user.email, device_info);
                }
                HttpResponse::Ok().json(AuthResponse {
                    token,
                    user: UserResponse::from_user_with_verification(user, &data.db).await,
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
        Ok(Some(user)) => {
            let resp = UserResponse::from_user_with_verification(user, &data.db).await;
            HttpResponse::Ok().json(resp)
        }
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
        <p style="color: #645646; text-align: center; margin-bottom: 32px;">Hi {}, welcome to Examinery! Please verify your email address to get started.</p>
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

    let email = CreateEmailBaseOptions::new(&config.email_from, [to_email], "Verify your Examinery email")
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

    let email = CreateEmailBaseOptions::new(&config.email_from, [to_email], "Reset your Examinery password")
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
            let _ = sqlx::query("UPDATE email_verifications SET verified = 1 WHERE id = ?")
                .bind(&verification_record.id)
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

            HttpResponse::Ok().json(UserResponse::from_user_with_verification(user, &data.db).await)
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

    if let Err(e) = require_active_user(&data.db, &user_id).await {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Account deactivated",
            "message": "Your account has been deactivated."
        }));
    }

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

    if let Err(e) = require_active_user(&data.db, &user_id).await {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Account deactivated",
            "message": "Your account has been deactivated."
        }));
    }

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
        "SELECT e.id, e.name, e.slug, e.description, e.total_questions, e.time_limit_minutes, e.min_subjects, e.max_subjects, e.is_active, e.icon_url, e.created_at, (SELECT COUNT(*) FROM subjects WHERE exam_id = e.id AND is_active = 1) AS subject_count, (SELECT COUNT(*) FROM questions WHERE exam_type = e.slug AND is_active = 1) AS question_count FROM exams e WHERE e.is_active = 1 ORDER BY e.created_at DESC",
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

// ---------------------------------------------------------------------------
// Helper: extract user ID from JWT
// ---------------------------------------------------------------------------

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
// Activation
// ---------------------------------------------------------------------------

pub async fn activate_account(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<ActivateRequest>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let key_code = body.key_code.trim().to_uppercase();

    // Find the activation key
    let key = sqlx::query_as::<_, ActivationKey>(
        "SELECT * FROM activation_keys WHERE key_code = ? AND is_active = 1",
    )
    .bind(&key_code)
    .fetch_optional(&data.db)
    .await;

    match key {
        Ok(Some(key)) => {
            // Check if key is expired
            if let Some(expires_at) = key.expires_at {
                if expires_at < Utc::now().naive_utc() {
                    return HttpResponse::BadRequest().json(serde_json::json!({
                        "error": "Activation key has expired"
                    }));
                }
            }

            // Check if key has remaining uses
            if key.used_count >= key.max_uses {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "Activation key has no remaining uses"
                }));
            }

            // Activate user
            let now = Utc::now().naive_utc();
            let result = sqlx::query(
                "UPDATE users SET is_active = 1, updated_at = ? WHERE id = ?",
            )
            .bind(now)
            .bind(&user_id)
            .execute(&data.db)
            .await;

            match result {
                Ok(_) => {
                    // Increment used_count on the key
                    let _ = sqlx::query(
                        "UPDATE activation_keys SET used_count = used_count + 1 WHERE id = ?",
                    )
                    .bind(&key.id)
                    .execute(&data.db)
                    .await;

                    // Fetch updated user
                    if let Ok(updated_user) = sqlx::query_as::<_, User>(
                        "SELECT * FROM users WHERE id = ?",
                    )
                    .bind(&user_id)
                    .fetch_one(&data.db)
                    .await
                    {
                        let resp = UserResponse::from_user_with_verification(updated_user, &data.db).await;
                        HttpResponse::Ok().json(serde_json::json!({
                            "message": "Account activated successfully",
                            "user": resp,
                            "exam_type": key.exam_type,
                            "activated_at": now.to_string(),
                        }))
                    } else {
                        HttpResponse::Ok().json(serde_json::json!({
                            "message": "Account activated successfully",
                            "exam_type": key.exam_type,
                            "activated_at": now.to_string(),
                        }))
                    }
                }
                Err(e) => {
                    log::error!("Activate account error: {}", e);
                    HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Failed to activate account"
                    }))
                }
            }
        }
        Ok(None) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid activation key"
        })),
        Err(e) => {
            log::error!("Activate account lookup error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

pub async fn check_activation_status(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE id = ?",
    )
    .bind(&user_id)
    .fetch_one(&data.db)
    .await;

    match user {
        Ok(user) => HttpResponse::Ok().json(serde_json::json!({
            "is_active": user.is_active,
        })),
        Err(e) => {
            log::error!("Check activation status error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// Get user's activation key
// ---------------------------------------------------------------------------

pub async fn get_activation_key(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let key = sqlx::query_as::<_, ActivationKey>(
        "SELECT * FROM activation_keys WHERE created_by = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
    )
    .bind(&user_id)
    .fetch_optional(&data.db)
    .await;

    match key {
        Ok(Some(k)) => HttpResponse::Ok().json(serde_json::json!({
            "key_code": k.key_code,
            "exam_type": k.exam_type,
            "is_used": k.used_count >= k.max_uses,
            "created_at": k.created_at,
        })),
        Ok(None) => HttpResponse::Ok().json(serde_json::json!({
            "key_code": Option::<String>::None,
            "message": "No activation key found",
        })),
        Err(e) => {
            log::error!("Get activation key error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// Exam Sessions
// ---------------------------------------------------------------------------

pub async fn create_exam_session(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<CreateSessionRequest>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    if let Err(e) = require_active_user(&data.db, &user_id).await {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Account deactivated",
            "message": "Your account has been deactivated. Please contact support or activate your account."
        }));
    }

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();
    let mode = body.mode.as_deref().unwrap_or("study");
    let mut question_count = body.question_count.unwrap_or(30);
    let duration = body.duration_minutes.unwrap_or(60);
    let expires_at = now + chrono::Duration::minutes(duration as i64);
    let subjects_json = serde_json::to_string(&body.subjects.as_ref().unwrap_or(&vec![])).unwrap_or_else(|_| "[]".into());

    // Cap questions for non-activated users
    let is_active: (i32,) = sqlx::query_as("SELECT is_active FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_one(&data.db)
        .await
        .unwrap_or((0,));
    if is_active.0 == 0 {
        let free_limit: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM question_usage WHERE user_id = ? AND DATE(created_at) = DATE('now')",
        )
        .bind(&user_id)
        .fetch_one(&data.db)
        .await
        .unwrap_or((0,));
        let remaining = (FREE_QUESTION_LIMIT - free_limit.0).max(0);
        if remaining < question_count as i64 {
            question_count = remaining as i32;
        }
    }

    let result = sqlx::query(
        "INSERT INTO exam_sessions (id, user_id, exam_type, mode, subjects, question_count, duration_minutes, status, started_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress', ?, ?)",
    )
    .bind(&id)
    .bind(&user_id)
    .bind(&body.exam_type)
    .bind(mode)
    .bind(&subjects_json)
    .bind(question_count)
    .bind(duration)
    .bind(now)
    .bind(expires_at)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let session = sqlx::query_as::<_, ExamSession>("SELECT * FROM exam_sessions WHERE id = ?")
                .bind(&id)
                .fetch_one(&data.db)
                .await
                .unwrap();

            HttpResponse::Created().json(session)
        }
        Err(e) => {
            log::error!("Create exam session error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to create session"}))
        }
    }
}

pub async fn get_exam_session(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    if let Err(e) = require_active_user(&data.db, &user_id).await {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Account deactivated",
            "message": "Your account has been deactivated."
        }));
    }

    let session_id = path.into_inner();

    let session = sqlx::query_as::<_, ExamSession>(
        "SELECT * FROM exam_sessions WHERE id = ? AND user_id = ?",
    )
    .bind(&session_id)
    .bind(&user_id)
    .fetch_optional(&data.db)
    .await;

    match session {
        Ok(Some(session)) => {
            let subject_ids: Vec<String> = serde_json::from_str(&session.subjects).unwrap_or_default();
            let stored_order: Vec<String> = serde_json::from_str(session.question_order.as_deref().unwrap_or("[]")).unwrap_or_default();

            let questions = if subject_ids.is_empty() {
                sqlx::query_as::<_, ExamSessionQuestion>(
                    "SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.explanation, q.correct_answer, s.name as subject_name, t.name as topic_name, q.difficulty
                     FROM questions q
                     LEFT JOIN subjects s ON q.subject_id = s.id
                     LEFT JOIN topics t ON q.topic_id = t.id
                     WHERE q.exam_type = ? AND q.is_active = 1
                     ORDER BY RANDOM() LIMIT ?",
                )
                .bind(&session.exam_type)
                .bind(session.question_count)
                .fetch_all(&data.db)
                .await
                .unwrap_or_default()
            } else {
                let mut all_questions = Vec::new();
                for sid in &subject_ids {
                    let qs = sqlx::query_as::<_, ExamSessionQuestion>(
                        "SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.explanation, q.correct_answer, s.name as subject_name, t.name as topic_name, q.difficulty
                         FROM questions q
                         LEFT JOIN subjects s ON q.subject_id = s.id
                         LEFT JOIN topics t ON q.topic_id = t.id
                         WHERE q.subject_id = ? AND q.is_active = 1
                         ORDER BY RANDOM() LIMIT ?",
                    )
                    .bind(sid)
                    .bind(session.question_count / subject_ids.len() as i32 + 1)
                    .fetch_all(&data.db)
                    .await
                    .unwrap_or_default();
                    all_questions.extend(qs);
                }
                all_questions
            };

            // If no stored order, save the current random order
            if stored_order.is_empty() && !questions.is_empty() {
                let order_ids: Vec<&str> = questions.iter().map(|q| q.id.as_str()).collect();
                let order_json = serde_json::to_string(&order_ids).unwrap_or_else(|_| "[]".into());
                let _ = sqlx::query("UPDATE exam_sessions SET question_order = ? WHERE id = ?")
                    .bind(&order_json)
                    .bind(&session_id)
                    .execute(&data.db)
                    .await;
            }

            // Sort questions by stored order if available
            let mut sorted_questions = questions;
            if !stored_order.is_empty() {
                sorted_questions.sort_by(|a, b| {
                    let pos_a = stored_order.iter().position(|id| id == &a.id).unwrap_or(usize::MAX);
                    let pos_b = stored_order.iter().position(|id| id == &b.id).unwrap_or(usize::MAX);
                    pos_a.cmp(&pos_b)
                });
            }

            // Fetch existing answers
            let existing_answers = sqlx::query_as::<_, ExamAnswer>(
                "SELECT * FROM exam_answers WHERE session_id = ?",
            )
            .bind(&session_id)
            .fetch_all(&data.db)
            .await
            .unwrap_or_default();

            let answers_map: std::collections::HashMap<String, ExamAnswer> = existing_answers
                .into_iter()
                .map(|a| (a.question_id.clone(), a))
                .collect();

            let session_questions: Vec<SessionQuestion> = sorted_questions
                .into_iter()
                .map(|q| {
                    let answer = answers_map.get(&q.id);
                    SessionQuestion {
                        id: q.id,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        explanation: q.explanation,
                        correct_answer: q.correct_answer,
                        subject_name: q.subject_name,
                        topic_name: q.topic_name,
                        difficulty: q.difficulty,
                        user_answer: answer.and_then(|a| a.selected_answer.clone()),
                        is_correct: answer.and_then(|a| a.is_correct),
                    }
                })
                .collect();

            HttpResponse::Ok().json(SessionResponse {
                session,
                questions: session_questions,
            })
        }
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({"error": "Session not found"})),
        Err(e) => {
            log::error!("Get exam session error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}))
        }
    }
}

#[derive(FromRow)]
struct ExamSessionQuestion {
    id: String,
    question_text: String,
    option_a: String,
    option_b: String,
    option_c: String,
    option_d: String,
    explanation: Option<String>,
    correct_answer: String,
    subject_name: Option<String>,
    topic_name: Option<String>,
    difficulty: String,
}

pub async fn submit_answer(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<SubmitAnswerRequest>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };
    let session_id = path.into_inner();

    // Verify session belongs to user and is in progress
    let session = sqlx::query_as::<_, ExamSession>(
        "SELECT * FROM exam_sessions WHERE id = ? AND user_id = ? AND status = 'in_progress'",
    )
    .bind(&session_id)
    .bind(&user_id)
    .fetch_optional(&data.db)
    .await;

    match session {
        Ok(Some(_)) => {}
        Ok(None) => return HttpResponse::NotFound().json(serde_json::json!({"error": "Session not found or already completed"})),
        Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"})),
    }

    // Get correct answer
    let question = sqlx::query_scalar::<_, String>(
        "SELECT correct_answer FROM questions WHERE id = ?",
    )
    .bind(&body.question_id)
    .fetch_optional(&data.db)
    .await;

    let correct_answer = match question {
        Ok(Some(ca)) => ca,
        _ => return HttpResponse::NotFound().json(serde_json::json!({"error": "Question not found"})),
    };

    let is_correct = body.selected_answer.to_uppercase() == correct_answer;
    let answer_id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();

    let result = sqlx::query(
        "INSERT INTO exam_answers (id, session_id, question_id, selected_answer, is_correct, time_spent_seconds, answered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(session_id, question_id) DO UPDATE SET selected_answer = excluded.selected_answer, is_correct = excluded.is_correct, time_spent_seconds = excluded.time_spent_seconds, answered_at = excluded.answered_at",
    )
    .bind(&answer_id)
    .bind(&session_id)
    .bind(&body.question_id)
    .bind(&body.selected_answer.to_uppercase())
    .bind(is_correct)
    .bind(body.time_spent_seconds.unwrap_or(0))
    .bind(now)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "correct": is_correct,
            "correct_answer": correct_answer,
        })),
        Err(e) => {
            log::error!("Submit answer error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to save answer"}))
        }
    }
}

pub async fn submit_exam_session(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<SubmitAllRequest>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };
    let session_id = path.into_inner();

    // Verify session belongs to user
    let session = sqlx::query_as::<_, ExamSession>(
        "SELECT * FROM exam_sessions WHERE id = ? AND user_id = ?",
    )
    .bind(&session_id)
    .bind(&user_id)
    .fetch_optional(&data.db)
    .await;

    let session = match session {
        Ok(Some(s)) => s,
        Ok(None) => return HttpResponse::NotFound().json(serde_json::json!({"error": "Session not found"})),
        Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"})),
    };

    // Save all answers
    for answer in &body.answers {
        let question = sqlx::query_scalar::<_, String>(
            "SELECT correct_answer FROM questions WHERE id = ?",
        )
        .bind(&answer.question_id)
        .fetch_optional(&data.db)
        .await;

        if let Ok(Some(correct)) = question {
            let is_correct = answer.selected_answer.to_uppercase() == correct;
            let answer_id = Uuid::new_v4().to_string();
            let now = Utc::now().naive_utc();

            let _ = sqlx::query(
                "INSERT INTO exam_answers (id, session_id, question_id, selected_answer, is_correct, time_spent_seconds, answered_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(session_id, question_id) DO UPDATE SET selected_answer = excluded.selected_answer, is_correct = excluded.is_correct, time_spent_seconds = excluded.time_spent_seconds, answered_at = excluded.answered_at",
            )
            .bind(&answer_id)
            .bind(&session_id)
            .bind(&answer.question_id)
            .bind(&answer.selected_answer.to_uppercase())
            .bind(is_correct)
            .bind(answer.time_spent_seconds.unwrap_or(0))
            .bind(now)
            .execute(&data.db)
            .await;
        }
    }

    // Calculate results
    let stats = sqlx::query_as::<_, (i64, Option<i64>)>(
        "SELECT COUNT(*) as total, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct FROM exam_answers WHERE session_id = ?",
    )
    .bind(&session_id)
    .fetch_one(&data.db)
    .await
    .unwrap_or((0, Some(0)));

    let total_answered = stats.0 as i32;
    let total_correct = stats.1.unwrap_or(0) as i32;
    let score = if total_answered > 0 { ((total_correct as f64 / total_answered as f64) * 100.0).round() } else { 0.0 };
    let now = Utc::now().naive_utc();

    // Update session
    let _ = sqlx::query(
        "UPDATE exam_sessions SET status = 'completed', completed_at = ?, score = ?, total_correct = ?, total_answered = ?, time_spent_seconds = ? WHERE id = ?",
    )
    .bind(now)
    .bind(score)
    .bind(total_correct)
    .bind(total_answered)
    .bind(body.time_spent_seconds.unwrap_or(0))
    .bind(&session_id)
    .execute(&data.db)
    .await;

    // Fetch updated session
    let updated_session = sqlx::query_as::<_, ExamSession>(
        "SELECT * FROM exam_sessions WHERE id = ?",
    )
    .bind(&session_id)
    .fetch_one(&data.db)
    .await
    .unwrap();

    // Get results by subject
    let by_subject = sqlx::query_as::<_, (String, i64, i64)>(
        "SELECT COALESCE(s.name, 'Unknown') as subject_name,
                COUNT(*) as total,
                SUM(CASE WHEN ea.is_correct = 1 THEN 1 ELSE 0 END) as correct
         FROM exam_answers ea
         JOIN questions q ON ea.question_id = q.id
         LEFT JOIN subjects s ON q.subject_id = s.id
         WHERE ea.session_id = ?
         GROUP BY s.name",
    )
    .bind(&session_id)
    .fetch_all(&data.db)
    .await
    .unwrap_or_default()
    .into_iter()
    .map(|(name, total, correct)| SubjectResult {
        subject_name: name,
        correct,
        total,
        percentage: if total > 0 { ((correct as f64 / total as f64) * 100.0).round() } else { 0.0 },
    })
    .collect();

    let by_difficulty = sqlx::query_as::<_, (String, i64, i64)>(
        "SELECT COALESCE(q.difficulty, 'medium') as difficulty,
                COUNT(*) as total,
                SUM(CASE WHEN ea.is_correct = 1 THEN 1 ELSE 0 END) as correct
         FROM exam_answers ea
         JOIN questions q ON ea.question_id = q.id
         WHERE ea.session_id = ?
         GROUP BY q.difficulty",
    )
    .bind(&session_id)
    .fetch_all(&data.db)
    .await
    .unwrap_or_default()
    .into_iter()
    .map(|(diff, total, correct)| DifficultyResult {
        difficulty: diff,
        correct,
        total,
        percentage: if total > 0 { ((correct as f64 / total as f64) * 100.0).round() } else { 0.0 },
    })
    .collect();

    HttpResponse::Ok().json(SessionResult {
        session: updated_session,
        total_correct,
        total_answered,
        score,
        by_subject,
        by_difficulty,
    })
}

pub async fn list_exam_sessions(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    if let Err(e) = require_active_user(&data.db, &user_id).await {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Account deactivated",
            "message": "Your account has been deactivated."
        }));
    }

    let sessions = sqlx::query_as::<_, ExamSession>(
        "SELECT * FROM exam_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 50",
    )
    .bind(&user_id)
    .fetch_all(&data.db)
    .await;

    match sessions {
        Ok(sessions) => HttpResponse::Ok().json(serde_json::json!({
            "sessions": sessions,
            "total": sessions.len(),
        })),
        Err(e) => {
            log::error!("List exam sessions error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}))
        }
    }
}

pub async fn get_session_results(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };
    let session_id = path.into_inner();

    let session = sqlx::query_as::<_, ExamSession>(
        "SELECT * FROM exam_sessions WHERE id = ? AND user_id = ?",
    )
    .bind(&session_id)
    .bind(&user_id)
    .fetch_optional(&data.db)
    .await;

    match session {
        Ok(Some(session)) => {
            let by_subject = sqlx::query_as::<_, (String, i64, i64)>(
                "SELECT COALESCE(s.name, 'Unknown') as subject_name,
                        COUNT(*) as total,
                        SUM(CASE WHEN ea.is_correct = 1 THEN 1 ELSE 0 END) as correct
                 FROM exam_answers ea
                 JOIN questions q ON ea.question_id = q.id
                 LEFT JOIN subjects s ON q.subject_id = s.id
                 WHERE ea.session_id = ?
                 GROUP BY s.name",
            )
            .bind(&session_id)
            .fetch_all(&data.db)
            .await
            .unwrap_or_default()
            .into_iter()
            .map(|(name, total, correct)| SubjectResult {
                subject_name: name,
                correct,
                total,
                percentage: if total > 0 { ((correct as f64 / total as f64) * 100.0).round() } else { 0.0 },
            })
            .collect();

            let by_difficulty = sqlx::query_as::<_, (String, i64, i64)>(
                "SELECT COALESCE(q.difficulty, 'medium') as difficulty,
                        COUNT(*) as total,
                        SUM(CASE WHEN ea.is_correct = 1 THEN 1 ELSE 0 END) as correct
                 FROM exam_answers ea
                 JOIN questions q ON ea.question_id = q.id
                 WHERE ea.session_id = ?
                 GROUP BY q.difficulty",
            )
            .bind(&session_id)
            .fetch_all(&data.db)
            .await
            .unwrap_or_default()
            .into_iter()
            .map(|(diff, total, correct)| DifficultyResult {
                difficulty: diff,
                correct,
                total,
                percentage: if total > 0 { ((correct as f64 / total as f64) * 100.0).round() } else { 0.0 },
            })
            .collect();

            let total_correct = session.total_correct.unwrap_or(0);
            let total_answered = session.total_answered.unwrap_or(0);
            let score = session.score.unwrap_or(0.0);

            HttpResponse::Ok().json(SessionResult {
                session,
                total_correct,
                total_answered,
                score,
                by_subject,
                by_difficulty,
            })
        }
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({"error": "Session not found"})),
        Err(e) => {
            log::error!("Get session results error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}))
        }
    }
}

pub async fn abandon_session(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };
    let session_id = path.into_inner();

    let result = sqlx::query(
        "UPDATE exam_sessions SET status = 'abandoned', completed_at = ? WHERE id = ? AND user_id = ? AND status = 'in_progress'",
    )
    .bind(Utc::now().naive_utc())
    .bind(&session_id)
    .bind(&user_id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"message": "Session abandoned"})),
        Err(e) => {
            log::error!("Abandon session error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}))
        }
    }
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

pub async fn list_bookmarks(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    if let Err(e) = require_active_user(&data.db, &user_id).await {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Account deactivated",
            "message": "Your account has been deactivated."
        }));
    }

    let bookmarks = sqlx::query_as::<_, BookmarkedQuestion>(
        "SELECT b.id, b.question_id, q.question_text, q.exam_type, s.name as subject_name, q.difficulty, b.created_at
         FROM bookmarks b
         JOIN questions q ON b.question_id = q.id
         LEFT JOIN subjects s ON q.subject_id = s.id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC",
    )
    .bind(&user_id)
    .fetch_all(&data.db)
    .await;

    match bookmarks {
        Ok(bookmarks) => HttpResponse::Ok().json(serde_json::json!({
            "bookmarks": bookmarks,
            "total": bookmarks.len(),
        })),
        Err(e) => {
            log::error!("List bookmarks error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}))
        }
    }
}

pub async fn create_bookmark(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<CreateBookmarkRequest>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    if let Err(e) = require_active_user(&data.db, &user_id).await {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Account deactivated",
            "message": "Your account has been deactivated."
        }));
    }

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();

    let result = sqlx::query(
        "INSERT OR IGNORE INTO bookmarks (id, user_id, question_id, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&user_id)
    .bind(&body.question_id)
    .bind(now)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => HttpResponse::Created().json(serde_json::json!({"id": id, "message": "Bookmarked"})),
        Err(e) => {
            log::error!("Create bookmark error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to bookmark"}))
        }
    }
}

pub async fn delete_bookmark(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };
    let question_id = path.into_inner();

    let result = sqlx::query(
        "DELETE FROM bookmarks WHERE user_id = ? AND question_id = ?",
    )
    .bind(&user_id)
    .bind(&question_id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"message": "Bookmark removed"})),
        Err(e) => {
            log::error!("Delete bookmark error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}))
        }
    }
}

// ---------------------------------------------------------------------------
// User Stats
// ---------------------------------------------------------------------------

pub async fn get_user_stats(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let user_id = match get_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    if let Err(e) = require_active_user(&data.db, &user_id).await {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Account deactivated",
            "message": "Your account has been deactivated."
        }));
    }

    let total_answered = sqlx::query_scalar::<_, i64>(
        "SELECT COALESCE(SUM(total_answered), 0) FROM exam_sessions WHERE user_id = ? AND status = 'completed'",
    )
    .bind(&user_id)
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let total_correct = sqlx::query_scalar::<_, i64>(
        "SELECT COALESCE(SUM(total_correct), 0) FROM exam_sessions WHERE user_id = ? AND status = 'completed'",
    )
    .bind(&user_id)
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let avg_score = sqlx::query_scalar::<_, Option<f64>>(
        "SELECT AVG(score) FROM exam_sessions WHERE user_id = ? AND status = 'completed'",
    )
    .bind(&user_id)
    .fetch_one(&data.db)
    .await
    .ok()
    .flatten()
    .unwrap_or(0.0);

    let total_sessions = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM exam_sessions WHERE user_id = ? AND status = 'completed'",
    )
    .bind(&user_id)
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let study_time = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT SUM(time_spent_seconds) FROM exam_sessions WHERE user_id = ? AND status = 'completed'",
    )
    .bind(&user_id)
    .fetch_one(&data.db)
    .await
    .ok()
    .flatten()
    .unwrap_or(0);

    let bookmark_count = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM bookmarks WHERE user_id = ?",
    )
    .bind(&user_id)
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    // Calculate streak (consecutive days with at least one answer submitted)
    // Uses exam_answers instead of exam_sessions so that in-progress / abandoned
    // sessions that still have saved answers also count toward the streak.
    let study_days = sqlx::query_scalar::<_, String>(
        "SELECT DISTINCT date(ea.answered_at) as day
         FROM exam_answers ea
         JOIN exam_sessions es ON ea.session_id = es.id
         WHERE es.user_id = ?
         ORDER BY day DESC",
    )
    .bind(&user_id)
    .fetch_all(&data.db)
    .await
    .unwrap_or_default();

    let mut streak = 0i64;
    let today = Utc::now().format("%Y-%m-%d").to_string();
    let mut expected_date = today;

    for day in &study_days {
        if *day == expected_date {
            streak += 1;
            if let Ok(date) = chrono::NaiveDate::parse_from_str(&expected_date, "%Y-%m-%d") {
                expected_date = (date - chrono::Duration::days(1)).format("%Y-%m-%d").to_string();
            }
        } else {
            break;
        }
    }

    HttpResponse::Ok().json(UserStats {
        total_answered,
        total_correct,
        avg_score,
        study_streak: streak,
        study_time_hours: study_time as f64 / 3600.0,
        total_sessions,
        bookmark_count,
    })
}
