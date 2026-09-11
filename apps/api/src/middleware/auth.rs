use actix_web::{dev::ServiceRequest, Error};
use actix_web::error::ErrorUnauthorized;
use jsonwebtoken::{decode, DecodingKey, Validation};

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
