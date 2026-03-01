ALTER TABLE "exams"
ALTER COLUMN "duration"
TYPE integer
USING duration::integer;