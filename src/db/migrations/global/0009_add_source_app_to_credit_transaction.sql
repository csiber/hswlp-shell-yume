ALTER TABLE `credit_transaction` ADD `sourceApp` text;--> statement-breakpoint
CREATE INDEX `credit_transaction_source_app_idx` ON `credit_transaction` (`sourceApp`);
