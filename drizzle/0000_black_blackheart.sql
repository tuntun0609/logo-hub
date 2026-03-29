CREATE TABLE `curated_sites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`href` text NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`notes` text,
	`tags` text,
	`visible` integer DEFAULT true NOT NULL,
	`order` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`order` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
