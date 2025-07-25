CREATE TABLE IF NOT EXISTS credit_warning_email (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id),
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS credit_warning_email_user_idx ON credit_warning_email(user_id);
