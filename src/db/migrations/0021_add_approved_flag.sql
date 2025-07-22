ALTER TABLE uploads ADD COLUMN approved INTEGER DEFAULT 0;
-- ensure visibility column exists
ALTER TABLE uploads ADD COLUMN visibility TEXT DEFAULT 'public';
