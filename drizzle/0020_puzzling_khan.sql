ALTER TABLE "schoolInfo" DROP COLUMN "news";
ALTER TABLE "schoolInfo" ADD COLUMN "news" jsonb[] DEFAULT '{}';

ALTER TABLE "schoolInfo" DROP COLUMN "gallery";
ALTER TABLE "schoolInfo" ADD COLUMN "gallery" jsonb[] DEFAULT '{}';