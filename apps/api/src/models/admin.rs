use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// Admin login
#[derive(Debug, Deserialize)]
pub struct AdminLoginRequest {
    pub email: String,
    pub password: String,
}

// Admin response (without password hash)
#[derive(Debug, Serialize)]
pub struct AdminResponse {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub is_active: bool,
}

impl From<super::user::User> for AdminResponse {
    fn from(user: super::user::User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
        }
    }
}

// Pagination
#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub search: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListUsersParams {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub search: Option<String>,
    pub role: Option<String>,
    pub is_active: Option<String>,
}

// User management
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub school: Option<String>,
    pub target_exam: Option<String>,
    pub target_score: Option<String>,
    pub role: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct UserListResponse {
    pub users: Vec<super::user::UserResponse>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}

// Activation keys
#[derive(Debug, Deserialize)]
pub struct GenerateKeysRequest {
    pub exam_type: String,
    pub count: Option<u32>,
    pub expires_at: Option<String>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct ActivationKey {
    pub id: String,
    pub key_code: String,
    pub exam_type: String,
    pub max_uses: i32,
    pub used_count: i32,
    pub created_by: String,
    pub created_at: NaiveDateTime,
    pub expires_at: Option<NaiveDateTime>,
    pub is_active: bool,
}

#[derive(Debug, Serialize)]
pub struct KeyListResponse {
    pub keys: Vec<ActivationKey>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}

#[derive(Debug, Serialize)]
pub struct KeyStatsResponse {
    pub total: i64,
    pub used: i64,
    pub unused: i64,
    pub expired: i64,
}

// Exams
#[derive(Debug, Deserialize)]
pub struct CreateExamRequest {
    pub name: String,
    pub description: Option<String>,
    pub total_questions: Option<i32>,
    pub time_limit_minutes: Option<i32>,
    pub min_subjects: Option<i32>,
    pub max_subjects: Option<i32>,
    pub icon_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateExamRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub total_questions: Option<i32>,
    pub time_limit_minutes: Option<i32>,
    pub min_subjects: Option<i32>,
    pub max_subjects: Option<i32>,
    pub is_active: Option<bool>,
    pub icon_url: Option<String>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Exam {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub total_questions: i32,
    pub time_limit_minutes: i32,
    pub min_subjects: i32,
    pub max_subjects: i32,
    pub is_active: bool,
    pub icon_url: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Serialize, FromRow)]
pub struct ExamWithCounts {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub total_questions: i32,
    pub time_limit_minutes: i32,
    pub min_subjects: i32,
    pub max_subjects: i32,
    pub is_active: bool,
    pub icon_url: Option<String>,
    pub created_at: NaiveDateTime,
    pub subject_count: i64,
    pub question_count: i64,
}

// Subjects
#[derive(Debug, Deserialize)]
pub struct CreateSubjectRequest {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Subject {
    pub id: String,
    pub exam_id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: NaiveDateTime,
}

// Topics
#[derive(Debug, Deserialize)]
pub struct CreateTopicRequest {
    pub name: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Topic {
    pub id: String,
    pub subject_id: String,
    pub name: String,
    pub slug: String,
    pub is_active: bool,
    pub created_at: NaiveDateTime,
}

// Questions
#[derive(Debug, Deserialize)]
pub struct CreateQuestionRequest {
    pub subject_id: String,
    pub topic_id: Option<String>,
    pub exam_type: String,
    pub question_text: String,
    pub option_a: String,
    pub option_b: String,
    pub option_c: String,
    pub option_d: String,
    pub correct_answer: String,
    pub explanation: Option<String>,
    pub difficulty: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateQuestionRequest {
    pub subject_id: Option<String>,
    pub topic_id: Option<String>,
    pub exam_type: Option<String>,
    pub question_text: Option<String>,
    pub option_a: Option<String>,
    pub option_b: Option<String>,
    pub option_c: Option<String>,
    pub option_d: Option<String>,
    pub correct_answer: Option<String>,
    pub explanation: Option<String>,
    pub difficulty: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Question {
    pub id: String,
    pub subject_id: String,
    pub topic_id: Option<String>,
    pub exam_type: String,
    pub question_text: String,
    pub option_a: String,
    pub option_b: String,
    pub option_c: String,
    pub option_d: String,
    pub correct_answer: String,
    pub explanation: Option<String>,
    pub difficulty: String,
    pub is_active: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Serialize)]
pub struct QuestionListResponse {
    pub questions: Vec<Question>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}

#[derive(Debug, Serialize)]
pub struct ImportResult {
    pub total: u32,
    pub success: u32,
    pub failed: u32,
    pub errors: Vec<ImportError>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportError {
    pub row: u32,
    pub reason: String,
}

// Strict DTO for question import
#[derive(Debug, Deserialize)]
pub struct ImportQuestionsRequest {
    pub questions: Vec<ImportQuestionItem>,
}

#[derive(Debug, Deserialize)]
pub struct ImportQuestionItem {
    pub exam_type: String,
    #[serde(default)]
    pub subject: String,
    #[serde(default)]
    pub topic: Option<String>,
    pub question_text: String,
    pub option_a: String,
    pub option_b: String,
    pub option_c: String,
    pub option_d: String,
    pub correct_answer: String,
    #[serde(default)]
    pub explanation: Option<String>,
    #[serde(default = "default_difficulty")]
    pub difficulty: String,
}

fn default_difficulty() -> String {
    "medium".to_string()
}

impl ImportQuestionItem {
    pub fn validate(&self, row: usize) -> Result<(), String> {
        if self.exam_type.trim().is_empty() {
            return Err(format!("Row {}: exam_type is required", row));
        }
        if self.question_text.trim().is_empty() {
            return Err(format!("Row {}: question_text is required", row));
        }
        if self.option_a.trim().is_empty() || self.option_b.trim().is_empty() ||
           self.option_c.trim().is_empty() || self.option_d.trim().is_empty() {
            return Err(format!("Row {}: all four options (a, b, c, d) are required", row));
        }
        let ca = self.correct_answer.trim().to_uppercase();
        if ca != "A" && ca != "B" && ca != "C" && ca != "D" {
            return Err(format!("Row {}: correct_answer must be A, B, C, or D (got '{}')", row, self.correct_answer));
        }
        let diff = self.difficulty.trim().to_lowercase();
        if diff != "easy" && diff != "medium" && diff != "hard" {
            return Err(format!("Row {}: difficulty must be easy, medium, or hard (got '{}')", row, self.difficulty));
        }
        Ok(())
    }
}

#[derive(Debug, Deserialize)]
pub struct ImportCsvRequest {
    pub csv: String,
}

// Dashboard
#[derive(Debug, Serialize)]
pub struct DashboardStats {
    pub total_users: i64,
    pub new_users_today: i64,
    pub new_users_week: i64,
    pub total_questions: i64,
    pub total_exams: i64,
    pub total_keys: i64,
    pub used_keys: i64,
    pub active_users: i64,
}

// Audit log
#[derive(Debug, Serialize, FromRow)]
pub struct AuditLogEntry {
    pub id: String,
    pub admin_id: String,
    pub admin_email: String,
    pub action: String,
    pub target_type: String,
    pub target_id: Option<String>,
    pub details: Option<String>,
    pub ip_address: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize)]
pub struct AuditLogResponse {
    pub entries: Vec<AuditLogEntry>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}

#[derive(Debug, Deserialize)]
pub struct AuditLogParams {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub admin_id: Option<String>,
    pub action: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

// Question filter params
#[derive(Debug, Deserialize)]
pub struct QuestionParams {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub exam_type: Option<String>,
    pub subject_id: Option<String>,
    pub difficulty: Option<String>,
    pub search: Option<String>,
}

// Question stats
#[derive(Debug, Serialize)]
pub struct QuestionStats {
    pub total: i64,
    pub by_exam: Vec<ExamQuestionCount>,
    pub by_difficulty: Vec<DifficultyCount>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct ExamQuestionCount {
    pub exam_type: String,
    pub count: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct DifficultyCount {
    pub difficulty: String,
    pub count: i64,
}
