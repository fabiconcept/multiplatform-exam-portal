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
    pub is_banned: bool,
    pub ban_reason: Option<String>,
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
    pub is_banned: bool,
    pub ban_reason: Option<String>,
    pub role: String,
    pub email_verified: bool,
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
            is_banned: user.is_banned,
            ban_reason: user.ban_reason,
            role: user.role,
            email_verified: false,
        }
    }
}

impl UserResponse {
    pub async fn from_user_with_verification(user: User, db: &sqlx::SqlitePool) -> Self {
        let verified = sqlx::query_scalar::<_, bool>(
            "SELECT EXISTS(SELECT 1 FROM email_verifications WHERE user_id = ? AND verified = 1)"
        )
        .bind(&user.id)
        .fetch_one(db)
        .await
        .unwrap_or(false);

        let mut resp = Self::from(user);
        resp.email_verified = verified;
        resp
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

// ---------------------------------------------------------------------------
// Exam Sessions
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize, FromRow)]
pub struct ExamSession {
    pub id: String,
    pub user_id: String,
    pub exam_type: String,
    pub mode: String,
    pub subjects: String,
    pub question_count: i32,
    pub duration_minutes: i32,
    pub status: String,
    pub started_at: NaiveDateTime,
    pub completed_at: Option<NaiveDateTime>,
    pub expires_at: Option<NaiveDateTime>,
    pub score: Option<f64>,
    pub total_correct: Option<i32>,
    pub total_answered: Option<i32>,
    pub time_spent_seconds: Option<i32>,
    pub question_order: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSessionRequest {
    pub exam_type: String,
    pub mode: Option<String>,
    pub subjects: Option<Vec<String>>,
    pub question_count: Option<i32>,
    pub duration_minutes: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct SessionResponse {
    pub session: ExamSession,
    pub questions: Vec<SessionQuestion>,
}

#[derive(Debug, Serialize)]
pub struct SessionQuestion {
    pub id: String,
    pub question_text: String,
    pub option_a: String,
    pub option_b: String,
    pub option_c: String,
    pub option_d: String,
    pub explanation: Option<String>,
    pub correct_answer: String,
    pub subject_name: Option<String>,
    pub topic_name: Option<String>,
    pub difficulty: String,
    pub user_answer: Option<String>,
    pub is_correct: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct SubmitAnswerRequest {
    pub question_id: String,
    pub selected_answer: String,
    pub time_spent_seconds: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct SubmitAllRequest {
    pub answers: Vec<SubmitAnswerRequest>,
    pub time_spent_seconds: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct SessionResult {
    pub session: ExamSession,
    pub total_correct: i32,
    pub total_answered: i32,
    pub score: f64,
    pub by_subject: Vec<SubjectResult>,
    pub by_difficulty: Vec<DifficultyResult>,
}

#[derive(Debug, Serialize)]
pub struct SubjectResult {
    pub subject_name: String,
    pub correct: i64,
    pub total: i64,
    pub percentage: f64,
}

#[derive(Debug, Serialize)]
pub struct DifficultyResult {
    pub difficulty: String,
    pub correct: i64,
    pub total: i64,
    pub percentage: f64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct ExamAnswer {
    pub id: String,
    pub session_id: String,
    pub question_id: String,
    pub selected_answer: Option<String>,
    pub is_correct: Option<bool>,
    pub time_spent_seconds: Option<i32>,
    pub answered_at: NaiveDateTime,
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize, FromRow)]
pub struct Bookmark {
    pub id: String,
    pub user_id: String,
    pub question_id: String,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateBookmarkRequest {
    pub question_id: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct BookmarkedQuestion {
    pub id: String,
    pub question_id: String,
    pub question_text: String,
    pub exam_type: String,
    pub subject_name: Option<String>,
    pub difficulty: String,
    pub created_at: NaiveDateTime,
}

// ---------------------------------------------------------------------------
// User Stats
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct UserStats {
    pub total_answered: i64,
    pub total_correct: i64,
    pub avg_score: f64,
    pub study_streak: i64,
    pub study_time_hours: f64,
    pub total_sessions: i64,
    pub bookmark_count: i64,
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct ActivateRequest {
    pub key_code: String,
}

#[derive(Debug, Serialize)]
pub struct ActivationResponse {
    pub message: String,
    pub exam_type: Option<String>,
    pub activated_at: String,
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Payment {
    pub id: String,
    pub user_id: String,
    pub amount: i64,
    pub currency: String,
    pub status: String,
    pub reference: String,
    pub payment_url: Option<String>,
    pub metadata: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct InitPaymentRequest {
    pub amount: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct InitPaymentResponse {
    pub id: String,
    pub reference: String,
    pub amount: i64,
    pub currency: String,
    pub status: String,
    pub payment_url: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyPaymentRequest {
    pub reference: String,
}

#[derive(Debug, Serialize)]
pub struct VerifyPaymentResponse {
    pub id: String,
    pub reference: String,
    pub status: String,
    pub amount: i64,
    pub currency: String,
    pub activated: bool,
    pub message: String,
    pub key_code: Option<String>,
}
