CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  upload_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (upload_id) REFERENCES uploads(id),
  FOREIGN KEY (user_id) REFERENCES user(id)
);
