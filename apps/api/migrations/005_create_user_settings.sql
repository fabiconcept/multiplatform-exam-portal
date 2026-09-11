CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY NOT NULL,
    notifications INTEGER NOT NULL DEFAULT 1,
    email_updates INTEGER NOT NULL DEFAULT 0,
    sound_effects INTEGER NOT NULL DEFAULT 1,
    dark_mode INTEGER NOT NULL DEFAULT 0,
    auto_save INTEGER NOT NULL DEFAULT 1,
    show_explanations INTEGER NOT NULL DEFAULT 1,
    timer_warning INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
