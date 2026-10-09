CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`phone_hash` text NOT NULL,
	`display_name` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_session_expiry` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `otp_challenges` (
	`phone_hash` text PRIMARY KEY NOT NULL,
	`challenge_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`last_sent_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`resends` integer DEFAULT 0 NOT NULL,
	`consumed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `otp_challenges_challenge_id_unique` ON `otp_challenges` (`challenge_id`);