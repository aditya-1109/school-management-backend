CREATE TABLE "schoolInfo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "schoolInfo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"social" jsonb[] DEFAULT '{}',
	"news" jsonb[] DEFAULT '{}',
	"champ" jsonb[] DEFAULT '{}',
	"gallery" jsonb[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
