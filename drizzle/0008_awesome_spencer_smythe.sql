ALTER TABLE "course" ALTER COLUMN "content" SET DATA TYPE varchar(255)[] USING ARRAY[content];;--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "content" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "solution" SET DATA TYPE varchar(255)[] USING ARRAY[course];;--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "solution" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "solution" DROP NOT NULL;