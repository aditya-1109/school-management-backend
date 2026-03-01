ALTER TABLE "course" DROP COLUMN "solution";

ALTER TABLE "course"
ADD COLUMN "solution" jsonb[] DEFAULT '{}';


