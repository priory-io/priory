CREATE TABLE IF NOT EXISTS "shortlink" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"short_code" text NOT NULL,
	"original_url" text NOT NULL,
	"title" text,
	"description" text,
	"password" text,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shortlink_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shortlink_click" (
	"id" text PRIMARY KEY NOT NULL,
	"shortlink_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"referer" text,
	"country" text,
	"city" text,
	"clicked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shortlink" ADD CONSTRAINT "shortlink_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shortlink_click" ADD CONSTRAINT "shortlink_click_shortlink_id_shortlink_id_fk" FOREIGN KEY ("shortlink_id") REFERENCES "public"."shortlink"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;