ALTER TABLE "timeTable" ALTER COLUMN "classId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "timeTable" ALTER COLUMN "classId" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "timeTable" ALTER COLUMN "classId" SET NOT NULL;