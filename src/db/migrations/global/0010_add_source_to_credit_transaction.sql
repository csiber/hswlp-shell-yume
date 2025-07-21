ALTER TABLE `credit_transaction` ADD `source` text;
CREATE INDEX `credit_transaction_source_idx` ON `credit_transaction` (`source`);
