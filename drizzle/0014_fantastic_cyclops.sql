ALTER TABLE "complaints" ALTER COLUMN "student" SET DATA TYPE varchar(255)[];--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "student" SET DEFAULT '{}';