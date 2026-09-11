use actix_web::{web, HttpResponse, HttpRequest};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use uuid::Uuid;
use chrono::Utc;

use crate::AppState;
use crate::models::{RegisterRequest, LoginRequest, AuthResponse, UserResponse, User, Claims, ForgotPasswordRequest, ResetPasswordRequest, PasswordReset};

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
        "INSERT INTO users (id, name, email, password_hash, phone, school, target_exam, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)"
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

            log::info!("Password reset token for {}: {}", body.email, token);

            HttpResponse::Ok().json(serde_json::json!({
                "message": "If an account exists with this email, you will receive a password reset link.",
                "token": token
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
