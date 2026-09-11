use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub phone: Option<String>,
    pub school: Option<String>,
    pub target_exam: Option<String>,
    pub target_score: Option<String>,
    pub is_active: bool,
    pub role: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    pub phone: Option<String>,
    pub school: Option<String>,
    pub target_exam: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
    pub device_info: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: String,
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub school: Option<String>,
    pub target_exam: Option<String>,
    pub target_score: Option<String>,
    pub is_active: bool,
    pub role: String,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            school: user.school,
            target_exam: user.target_exam,
            target_score: user.target_score,
            is_active: user.is_active,
            role: user.role,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

#[derive(Debug, Deserialize)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ResetPasswordRequest {
    pub token: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PasswordReset {
    pub id: String,
    pub user_id: String,
    pub token: String,
    pub expires_at: NaiveDateTime,
    pub used: bool,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct EmailVerification {
    pub id: String,
    pub user_id: String,
    pub email: String,
    pub token: String,
    pub expires_at: NaiveDateTime,
    pub verified: bool,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct VerifyEmailRequest {
    pub token: String,
}

#[derive(Debug, Deserialize)]
pub struct SendVerificationRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct TrackUsageRequest {
    pub question_key: String,
    pub exam_type: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub name: Option<String>,
    pub phone: Option<String>,
    pub school: Option<String>,
    pub target_exam: Option<String>,
    pub target_score: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSettingsRequest {
    pub notifications: Option<bool>,
    pub email_updates: Option<bool>,
    pub sound_effects: Option<bool>,
    pub dark_mode: Option<bool>,
    pub auto_save: Option<bool>,
    pub show_explanations: Option<bool>,
    pub timer_warning: Option<bool>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct UserSettings {
    pub user_id: String,
    pub notifications: bool,
    pub email_updates: bool,
    pub sound_effects: bool,
    pub dark_mode: bool,
    pub auto_save: bool,
    pub show_explanations: bool,
    pub timer_warning: bool,
}

#[derive(Debug, Serialize, FromRow)]
pub struct QuestionUsage {
    pub id: String,
    pub user_id: String,
    pub question_key: String,
    pub exam_type: String,
    pub accessed_at: NaiveDateTime,
}

#[derive(Debug, Serialize)]
pub struct UsageStatusResponse {
    pub total_used: i64,
    pub limit: i64,
    pub remaining: i64,
    pub is_activated: bool,
}
