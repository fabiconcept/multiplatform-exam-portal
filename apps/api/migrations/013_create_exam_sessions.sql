CREATE TABLE IF NOT EXISTS exam_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    exam_type TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'study',
    subjects TEXT NOT NULL DEFAULT '[]',
    question_count INTEGER NOT NULL DEFAULT 30,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'in_progress',
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    expires_at DATETIME,
    score REAL,
    total_correct INTEGER DEFAULT 0,
    total_answered INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0
);

CREATE INDEX idx_exam_sessions_user ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(status);
