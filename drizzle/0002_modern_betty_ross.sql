ALTER TABLE "user" ADD COLUMN "upload_limit_bytes" bigint;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_uploaded_bytes" bigint DEFAULT 0 NOT NULL;