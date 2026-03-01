ALTER TABLE "communication" ALTER COLUMN "firstPerson" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "communication" ALTER COLUMN "secondPerson" SET DATA TYPE varchar(255)[];--> statement-breakpoint
ALTER TABLE "communication" ALTER COLUMN "secondPerson" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "communication" DROP COLUMN "conversation";--> statement-breakpoint
ALTER TABLE "communication" DROP COLUMN "userType";