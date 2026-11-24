CREATE TABLE "global_counters" (
	"id" text PRIMARY KEY,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "released_burdens" (
	"id" serial PRIMARY KEY,
	"category" text DEFAULT '일반' NOT NULL,
	"encouragement" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
