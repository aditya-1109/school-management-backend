ALTER TABLE "user" DROP COLUMN IF EXISTS "fees";

ALTER TABLE "user"
ADD COLUMN "fees" jsonb[] DEFAULT ARRAY[]::jsonb[];
