CREATE TABLE deleted_comments_log (
  id TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL,
  deleted_by TEXT NOT NULL,
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  FOREIGN KEY (comment_id) REFERENCES comments(id),
  FOREIGN KEY (deleted_by) REFERENCES user(id)
);
