CREATE TABLE IF NOT EXISTS exam_answers (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES questions(id),
    selected_answer TEXT,
    is_correct BOOLEAN DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_answers_session ON exam_answers(session_id);
CREATE UNIQUE INDEX idx_exam_answers_session_question ON exam_answers(session_id, question_id);
