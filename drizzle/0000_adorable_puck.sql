CREATE TABLE `daily_metrics` (
	`store_id` text NOT NULL,
	`date` text NOT NULL,
	`store_views` integer DEFAULT 0 NOT NULL,
	`product_views` integer DEFAULT 0 NOT NULL,
	`whatsapp_clicks` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`store_id`, `date`),
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`short_id` text NOT NULL,
	`store_id` text NOT NULL,
	`data` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_short_id_unique` ON `products` (`short_id`);--> statement-breakpoint
CREATE INDEX `products_store_status` ON `products` (`store_id`,`status`);--> statement-breakpoint
CREATE INDEX `products_created_at` ON `products` (`created_at`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`slug` text NOT NULL,
	`data` text NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_owner_unique` ON `stores` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `stores_slug_unique` ON `stores` (`slug`);