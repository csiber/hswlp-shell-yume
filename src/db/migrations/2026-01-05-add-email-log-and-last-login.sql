ALTER TABLE `user` ADD COLUMN `lastLoginAt` integer;
ALTER TABLE `user` ADD COLUMN `emailNotificationsEnabled` integer DEFAULT 1;

CREATE TABLE IF NOT EXISTS email_log (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id),
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS email_log_user_type_idx ON email_log (user_id, email_type);
CREATE INDEX IF NOT EXISTS email_log_sent_idx ON email_log (sent_at);
