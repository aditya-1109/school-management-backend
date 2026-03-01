ALTER TABLE "newUsers" ADD COLUMN "dob" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "newUsers" ADD COLUMN "gender" varchar(55) NOT NULL;--> statement-breakpoint
ALTER TABLE "newUsers" ADD COLUMN "documents" jsonb[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "newUsers" DROP COLUMN "grade";