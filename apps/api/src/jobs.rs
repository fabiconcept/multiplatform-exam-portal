use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use sqlx::SqlitePool;
use chrono::{Utc, NaiveDateTime};
use serde_json;

pub struct JobManager {
    jobs: Arc<Mutex<HashMap<String, JoinHandle<()>>>>,
}

impl Clone for JobManager {
    fn clone(&self) -> Self {
        Self {
            jobs: Arc::clone(&self.jobs),
        }
    }
}

impl JobManager {
    pub fn new() -> Self {
        Self {
            jobs: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Register a delayed auto-submit job for a session.
    /// The job fires at `expires_at + 5 minutes` to give a grace period.
    pub async fn register_auto_submit(
        &self,
        session_id: String,
        expires_at: NaiveDateTime,
        db: SqlitePool,
    ) {
        let now = Utc::now().naive_utc();
        let grace_period_secs = 300u64; // 5 minutes
        let expires_at_with_grace = expires_at + chrono::Duration::seconds(grace_period_secs as i64);

        let delay = if expires_at_with_grace > now {
            let dur = expires_at_with_grace.signed_duration_since(now);
            dur.num_seconds().max(1) as u64
        } else {
            1 // fire immediately if already past
        };

        let sid = session_id.clone();
        let handle = tokio::spawn(async move {
            log::info!("[JobManager] Auto-submit job for session {} scheduled in {}s", sid, delay);
            tokio::time::sleep(tokio::time::Duration::from_secs(delay)).await;
            log::info!("[JobManager] Executing auto-submit for session {}", sid);
            auto_submit_session(&sid, &db).await;
        });

        let mut jobs = self.jobs.lock().await;
        // Cancel any existing job for this session (shouldn't happen, but safe)
        if let Some(old) = jobs.insert(session_id.clone(), handle) {
            old.abort();
        }
    }

    /// Cancel a pending auto-submit job (called when user submits manually).
    pub async fn cancel_auto_submit(&self, session_id: &str) {
        let mut jobs = self.jobs.lock().await;
        if let Some(handle) = jobs.remove(session_id) {
            handle.abort();
            log::info!("[JobManager] Cancelled auto-submit for session {}", session_id);
        }
    }
}

/// Background function that auto-submits a session by saving all pending answers
/// and marking the session as completed.
async fn auto_submit_session(session_id: &str, db: &SqlitePool) {
    // Check session still exists and is in_progress
    let session: Option<(String, String)> = sqlx::query_as(
        "SELECT id, status FROM exam_sessions WHERE id = ? AND status = 'in_progress'",
    )
    .bind(session_id)
    .fetch_optional(db)
    .await
    .ok()
    .flatten();

    if session.is_none() {
        log::info!("[JobManager] Session {} already completed or not found, skipping", session_id);
        return;
    }

    // Get questions from this session's question_order that weren't answered
    let session_data: Option<(Option<String>,)> = sqlx::query_as(
        "SELECT question_order FROM exam_sessions WHERE id = ?",
    )
    .bind(session_id)
    .fetch_optional(db)
    .await
    .ok()
    .flatten();

    let unanswered: Vec<(String, String)> = if let Some((Some(order_json),)) = session_data {
        let question_ids: Vec<String> = serde_json::from_str(&order_json).unwrap_or_default();
        if question_ids.is_empty() {
            vec![]
        } else {
            let placeholders: Vec<String> = question_ids.iter().map(|_| "?".to_string()).collect();
            let query_str = format!(
                "SELECT q.id, q.correct_answer
                 FROM questions q
                 WHERE q.id IN ({}) AND q.is_active = 1
                   AND q.id NOT IN (
                       SELECT question_id FROM exam_answers WHERE session_id = ?
                   )",
                placeholders.join(",")
            );
            let mut query = sqlx::query_as::<_, (String, String)>(&query_str);
            for qid in &question_ids {
                query = query.bind(qid);
            }
            query = query.bind(session_id);
            query.fetch_all(db).await.unwrap_or_default()
        }
    } else {
        vec![]
    };

    // Insert answers for unanswered questions (blank/empty answers)
    let now = Utc::now().naive_utc();
    for (question_id, _correct_answer) in &unanswered {
        let answer_id = uuid::Uuid::new_v4().to_string();
        let _ = sqlx::query(
            "INSERT INTO exam_answers (id, session_id, question_id, selected_answer, is_correct, time_spent_seconds, answered_at)
             VALUES (?, ?, ?, '', 0, 0, ?)
             ON CONFLICT(session_id, question_id) DO NOTHING",
        )
        .bind(&answer_id)
        .bind(session_id)
        .bind(question_id)
        .bind(now)
        .execute(db)
        .await;
    }

    // Calculate results
    let stats: (i64, Option<i64>) = sqlx::query_as(
        "SELECT COUNT(*) as total, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct FROM exam_answers WHERE session_id = ?",
    )
    .bind(session_id)
    .fetch_one(db)
    .await
    .unwrap_or((0, Some(0)));

    let total_answered = stats.0 as i32;
    let total_correct = stats.1.unwrap_or(0) as i32;
    let score = if total_answered > 0 {
        ((total_correct as f64 / total_answered as f64) * 100.0).round()
    } else {
        0.0
    };

    // Mark session as expired (auto-submitted due to timeout)
    let _ = sqlx::query(
        "UPDATE exam_sessions SET status = 'expired', completed_at = ?, score = ?, total_correct = ?, total_answered = ?, time_spent_seconds = 0 WHERE id = ? AND status = 'in_progress'",
    )
    .bind(now)
    .bind(score)
    .bind(total_correct)
    .bind(total_answered)
    .bind(session_id)
    .execute(db)
    .await;

    log::info!(
        "[JobManager] Session {} auto-submitted (expired). Score: {}%, {}/{} correct",
        session_id, score, total_correct, total_answered
    );
}
