ALTER TABLE "user" ADD COLUMN "notification" jsonb[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "fee" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "fee" DROP COLUMN "paidAmount";