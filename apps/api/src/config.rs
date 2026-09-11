use std::env;

#[derive(Clone)]
pub struct Config {
    pub jwt_secret: String,
    pub jwt_expires_in: i64,
    pub resend_api_key: String,
    pub email_from: String,
    pub frontend_url: String,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            jwt_secret: env::var("JWT_SECRET").unwrap_or_else(|_| "exam-scholars-secret-key-change-in-production".to_string()),
            jwt_expires_in: env::var("JWT_EXPIRES_IN")
                .unwrap_or_else(|_| "86400".to_string())
                .parse()
                .unwrap_or(86400),
            resend_api_key: env::var("RESEND_API_KEY").unwrap_or_default(),
            email_from: env::var("EMAIL_FROM").unwrap_or_else(|_| "ExamScholars <onboarding@resend.dev>".to_string()),
            frontend_url: env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3001".to_string()),
        }
    }
}
