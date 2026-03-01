CREATE TABLE "class" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "class_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"className" varchar(55) NOT NULL,
	"section" varchar(55) NOT NULL,
	"student" varchar(255)[] DEFAULT '{}',
	"teacher" varchar(255)[] DEFAULT '{}',
	"subject" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "communication_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"firstPerson" uuid NOT NULL,
	"secondPerson" uuid[] DEFAULT '{}',
	"title" varchar(255) NOT NULL,
	"conversation" jsonb[],
	"type" varchar(255) NOT NULL,
	"userType" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "complaints_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"className" varchar(55) NOT NULL,
	"section" varchar(55) NOT NULL,
	"student" uuid[],
	"date" date,
	"type" varchar(255) NOT NULL,
	"level" varchar(255) NOT NULL,
	"status" varchar(255) NOT NULL,
	"content" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "course_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" varchar(55) NOT NULL,
	"class" varchar(55) NOT NULL,
	"section" varchar(55) NOT NULL,
	"subject" varchar(55) NOT NULL,
	"chapter" varchar(55) NOT NULL,
	"title" varchar(255) NOT NULL,
	"points" integer,
	"dueDate" date,
	"status" varchar(55) NOT NULL,
	"content" varchar(255) NOT NULL,
	"solution" varchar(55) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"date" date NOT NULL,
	"topic" varchar(255) NOT NULL,
	"time" timestamp with time zone NOT NULL,
	"attendees" integer DEFAULT 0 NOT NULL,
	"status" varchar(55) DEFAULT 'pending' NOT NULL,
	"approval" varchar(55) DEFAULT 'not' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"duration" varchar(255) NOT NULL,
	"marks" integer NOT NULL,
	"class" varchar(255) NOT NULL,
	"section" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"content" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fee_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" varchar(255) NOT NULL,
	"totalAmount" integer NOT NULL,
	"paidAmount" integer NOT NULL,
	"lastDate" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" varchar(255) NOT NULL,
	"method" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "grade_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"subject" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"topic" varchar(255) NOT NULL,
	"totalMarks" varchar(255) NOT NULL,
	"marks" varchar(255) NOT NULL,
	"candidate" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newUsers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "newUsers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"grade" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"parent" varchar(255) NOT NULL,
	"parentEmail" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"status" varchar(255) NOT NULL,
	CONSTRAINT "newUsers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "timeTable" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "timeTable_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"classId" varchar(255)[] DEFAULT '{}',
	"monday" jsonb[] DEFAULT '{}',
	"tuesday" jsonb[] DEFAULT '{}',
	"wednesday" jsonb[] DEFAULT '{}',
	"thursday" jsonb[] DEFAULT '{}',
	"friday" jsonb[] DEFAULT '{}',
	"saturday" jsonb[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"type" varchar(55) NOT NULL,
	"attendance" jsonb[] DEFAULT '{}',
	"grade" jsonb[] DEFAULT '{}',
	"address" varchar(255) NOT NULL,
	"links" jsonb,
	"connections" text[] DEFAULT '{}',
	"complaints" text[] DEFAULT '{}',
	"fees" text[] DEFAULT '{}',
	"documents" jsonb,
	"classes" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
