import { sql } from "drizzle-orm";
import { date, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const newUsersTable = pgTable("newUsers", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    parent: varchar({ length: 255 }).notNull(),
    parentEmail: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 255 }).notNull(),
    dob: varchar({length: 255}).notNull(),
    gender: varchar({length: 55}).notNull(),
    documents: jsonb("documents").array().default([]),
});

export const userTable = pgTable("user", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    phone: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 55 }).notNull(),
    attendance: jsonb("attendance").array().default([]),
    grade: jsonb("grade").array().default([]),
    address: varchar({ length: 255 }).notNull(),
    links : jsonb("links"),
    notification: jsonb("notification").array().default([]),
    connections: text("connections").array().default([]),
    complaints: text("complaints").array().default([]),
    fees: jsonb("fees").array().default([]),
    documents: jsonb("documents"),
    classes: text("classes").array().default([]),
    classTime: jsonb("classTime").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    activity: jsonb("activity").array().default([])
})

export const gradeTable = pgTable("grade", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    subject : varchar({ length: 255 }).notNull(),
    type : varchar({ length: 255 }).notNull(),
    topic: varchar({ length: 255 }).notNull(),
    totalMarks : varchar({ length: 255 }).notNull(),
    marks : varchar({ length: 255 }).notNull(),
    candidate: varchar({ length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const timeTable = pgTable("timeTable", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    classId: varchar({length: 255}).notNull(),
    monday: jsonb("monday").array().default([]),
    tuesday: jsonb("tuesday").array().default([]),
    wednesday: jsonb("wednesday").array().default([]),
    thursday: jsonb("thursday").array().default([]),
    friday: jsonb("friday").array().default([]),
    saturday: jsonb("saturday").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const eventsTable = pgTable("events", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    date: varchar({length: 55}).notNull(),
    topic: varchar({length: 255}).notNull(),
    time: varchar({length: 255}).notNull(),
    attendees: integer("attendees").default(0).notNull(),
    status: varchar({length: 55}).default("pending").notNull(),
    approval: varchar({length: 55}).default("not").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const examsTable = pgTable("exams", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title : varchar({length: 255}).notNull(),
    date: date("date").notNull(),
    duration : integer("duration").notNull(),
    marks: integer("marks").notNull(),
    class: varchar({length: 255}).notNull(),
    section: varchar({length: 255}).notNull(),
    subject: varchar({length: 255}).notNull(),
    time: varchar({length: 255}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const classTable = pgTable("class", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    className: varchar({length: 55}).notNull(),
    section: varchar({length: 55}).notNull(),
    student: varchar({length: 255}).array().default([]),
    teacher: varchar({length: 255}).array().default([]),
    subject: text("subject").notNull(),
    teachersSubject: jsonb("teachersSubject").array().default([])
})

export const courseTable = pgTable("course", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    type: varchar({length: 55}).notNull(),
    class: varchar({length: 55}).notNull(),
    section: varchar({length: 55}).notNull(),
    subject: varchar({length: 55}).notNull(),
    chapter: varchar({length: 55}).notNull(),
    title: varchar({length: 255}).notNull(),
    points: integer("points"),
    dueDate: date("dueDate"),
    status: varchar({length: 55}).notNull(),
    content: varchar({length: 255}).array().default([]),
    solution: jsonb("solution").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const complaintsTable = pgTable("complaints", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    className: varchar({length: 55}).notNull(),
    section: varchar({length: 55}).notNull(),
    student: varchar({length: 255}).array().default([]),
    date: date("date"),
    type: varchar({length: 255}).notNull(),
    level: varchar({length: 255}).notNull(),
    status: varchar({length: 255}).notNull(),
    content: varchar({length: 255}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const feeTable = pgTable("fee", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    totalAmount: integer("totalAmount").notNull(),
    lastDate: date("lastDate").notNull(),
    title: varchar({length: 255}).notNull(),
    method: varchar({length: 255}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const communicationTable = pgTable("communication", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    firstPerson: varchar({length: 255}).notNull(),
    secondPerson: varchar({length: 255}).array().default([]),
    title: varchar({length: 255}).notNull(),
    type: varchar({length: 255}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const schoolInfoTable = pgTable("schoolInfo", {
    id:  integer().primaryKey().generatedAlwaysAsIdentity(),
    social: jsonb("social").default(sql`'[]'::jsonb`),
    news: jsonb("news").array().default([]),
    champ: jsonb("champ").default(sql`'[]'::jsonb`),
    gallery: jsonb("gallery").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})