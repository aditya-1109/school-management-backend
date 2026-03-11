-- 1️⃣ Drop old columns
ALTER TABLE "schoolInfo" DROP COLUMN IF EXISTS "social";
ALTER TABLE "schoolInfo" DROP COLUMN IF EXISTS "news";
ALTER TABLE "schoolInfo" DROP COLUMN IF EXISTS "champ";
ALTER TABLE "schoolInfo" DROP COLUMN IF EXISTS "gallery";

-- 2️⃣ Recreate with correct jsonb array defaults
ALTER TABLE "schoolInfo"
ADD COLUMN "social" jsonb DEFAULT '[]'::jsonb;

ALTER TABLE "schoolInfo"
ADD COLUMN "news" jsonb DEFAULT '[]'::jsonb;

ALTER TABLE "schoolInfo"
ADD COLUMN "champ" jsonb DEFAULT '[]'::jsonb;

ALTER TABLE "schoolInfo"
ADD COLUMN "gallery" jsonb DEFAULT '[]'::jsonb;