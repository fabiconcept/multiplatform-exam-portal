use actix_web::{dev::ServiceRequest, Error, HttpResponse};
use actix_web::error::ErrorUnauthorized;
use jsonwebtoken::{decode, DecodingKey, Validation};
use sqlx::SqlitePool;

use crate::models::Claims;

pub fn extract_claims(req: &ServiceRequest, secret: &str) -> Result<Claims, Error> {
    let auth_header = req.headers().get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "));

    let token = match auth_header {
        Some(t) => t,
        None => return Err(ErrorUnauthorized("Missing authorization header")),
    };

    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| ErrorUnauthorized("Invalid token"))?
    .claims;

    Ok(claims)
}

/// Check if user is not banned. Returns Ok(()) if allowed, Err with 403 if banned.
/// Deactivated users still have full platform access in free mode.
pub async fn require_active_user(pool: &SqlitePool, user_id: &str) -> Result<(), actix_web::Error> {
    let user = sqlx::query_as::<_, (i32, Option<String>)>(
        "SELECT is_banned, ban_reason FROM users WHERE id = ?",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Database error: {}", e)))?;

    match user {
        Some((is_banned, ban_reason)) => {
            if is_banned == 1 {
                let reason = ban_reason.unwrap_or_else(|| "Your account has been banned.".to_string());
                return Err(actix_web::error::ErrorForbidden(
                    serde_json::json!({
                        "error": "Account banned",
                        "message": reason
                    }).to_string()
                ));
            }
            Ok(())
        }
        None => Err(actix_web::error::ErrorForbidden(
            serde_json::json!({
                "error": "User not found",
                "message": "User account not found."
            }).to_string()
        )),
    }
}

/// Check if user is banned. Returns Ok(()) if not banned, Err with 403 if banned.
pub async fn check_banned_user(pool: &SqlitePool, user_id: &str) -> Result<(), actix_web::Error> {
    let user = sqlx::query_as::<_, (i32, Option<String>)>(
        "SELECT is_banned, ban_reason FROM users WHERE id = ?",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Database error: {}", e)))?;

    match user {
        Some((is_banned, ban_reason)) => {
            if is_banned == 1 {
                let reason = ban_reason.unwrap_or_else(|| "Your account has been banned.".to_string());
                return Err(actix_web::error::ErrorForbidden(
                    serde_json::json!({
                        "error": "Account banned",
                        "message": reason
                    }).to_string()
                ));
            }
            Ok(())
        }
        None => Ok(()),
    }
}
