CREATE TABLE IF NOT EXISTS first_post_email (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id),
  post_id TEXT NOT NULL REFERENCES uploads(id),
  send_after DATETIME NOT NULL,
  sent_at DATETIME
);
CREATE INDEX IF NOT EXISTS first_post_email_user_idx ON first_post_email(user_id);
CREATE INDEX IF NOT EXISTS first_post_email_send_after_idx ON first_post_email(send_after);
