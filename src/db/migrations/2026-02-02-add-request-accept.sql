ALTER TABLE requests ADD COLUMN accepted_user_id TEXT REFERENCES user(id);
CREATE INDEX IF NOT EXISTS requests_accepted_user_idx ON requests (accepted_user_id);
