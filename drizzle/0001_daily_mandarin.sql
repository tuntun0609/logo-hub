CREATE TABLE `authors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`bio` text,
	`specialty` text,
	`website_url` text,
	`featured_works` text,
	`visible` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`order` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
