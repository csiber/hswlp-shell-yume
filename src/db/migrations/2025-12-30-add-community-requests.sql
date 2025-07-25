CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id),
  prompt TEXT NOT NULL,
  type TEXT NOT NULL,
  style TEXT NOT NULL,
  offered_credits INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  is_flagged INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS requests_user_id_idx ON requests (user_id);
CREATE INDEX IF NOT EXISTS requests_status_idx ON requests (status);

CREATE TABLE IF NOT EXISTS request_submissions (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id),
  user_id TEXT NOT NULL REFERENCES user(id),
  file_url TEXT NOT NULL,
  is_approved INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS request_submissions_request_idx ON request_submissions (request_id);
CREATE INDEX IF NOT EXISTS request_submissions_user_idx ON request_submissions (user_id);

CREATE TABLE IF NOT EXISTS request_flagged_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user(id),
  prompt TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS request_flagged_attempts_user_idx ON request_flagged_attempts (user_id);
