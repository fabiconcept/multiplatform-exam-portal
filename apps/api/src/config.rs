use std::env;

#[derive(Clone)]
pub struct Config {
    pub jwt_secret: String,
    pub jwt_expires_in: i64,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            jwt_secret: env::var("JWT_SECRET").unwrap_or_else(|_| "exam-scholars-secret-key-change-in-production".to_string()),
            jwt_expires_in: env::var("JWT_EXPIRES_IN")
                .unwrap_or_else(|_| "86400".to_string())
                .parse()
                .unwrap_or(86400),
        }
    }
}
