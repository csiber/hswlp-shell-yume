-- Deduplicate historical rows before adding unique constraints
DELETE FROM downloads
WHERE rowid NOT IN (
  SELECT MIN(rowid)
  FROM downloads
  GROUP BY user_id, upload_id
);

DELETE FROM request_submissions
WHERE rowid NOT IN (
  SELECT MIN(rowid)
  FROM request_submissions
  GROUP BY request_id, user_id
);

DELETE FROM credit_transaction
WHERE paymentIntentId IS NOT NULL
  AND rowid NOT IN (
    SELECT MIN(rowid)
    FROM credit_transaction
    WHERE paymentIntentId IS NOT NULL
    GROUP BY paymentIntentId
  );

CREATE UNIQUE INDEX IF NOT EXISTS downloads_user_upload_unique
  ON downloads (user_id, upload_id);

CREATE UNIQUE INDEX IF NOT EXISTS request_submissions_request_user_unique
  ON request_submissions (request_id, user_id);

CREATE UNIQUE INDEX IF NOT EXISTS credit_transaction_payment_intent_unique
  ON credit_transaction (paymentIntentId)
  WHERE paymentIntentId IS NOT NULL;
