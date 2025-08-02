ALTER TABLE "account" ADD COLUMN "account_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_account_id_unique" UNIQUE("account_id");