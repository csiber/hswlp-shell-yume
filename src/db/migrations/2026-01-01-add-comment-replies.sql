ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id);
