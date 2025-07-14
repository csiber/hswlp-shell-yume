-- Fix comments table to use upload_id and content columns
ALTER TABLE comments RENAME COLUMN post_id TO upload_id;
ALTER TABLE comments RENAME COLUMN text TO content;
