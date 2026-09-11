CREATE TABLE IF NOT EXISTS question_usage (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    question_key TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_question_usage_user_id ON question_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_question_usage_user_exam ON question_usage(user_id, exam_type);
