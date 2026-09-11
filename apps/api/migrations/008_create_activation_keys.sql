CREATE TABLE IF NOT EXISTS activation_keys (
    id TEXT PRIMARY KEY NOT NULL,
    key_code TEXT NOT NULL UNIQUE,
    exam_type TEXT NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1,
    used_count INTEGER NOT NULL DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_activation_keys_code ON activation_keys(key_code);
CREATE INDEX IF NOT EXISTS idx_activation_keys_exam ON activation_keys(exam_type);
CREATE INDEX IF NOT EXISTS idx_activation_keys_active ON activation_keys(is_active);
