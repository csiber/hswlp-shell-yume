CREATE TABLE IF NOT EXISTS email_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user(id),
  type TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS email_log_user_idx ON email_log(user_id);
CREATE INDEX IF NOT EXISTS email_log_type_idx ON email_log(type);
