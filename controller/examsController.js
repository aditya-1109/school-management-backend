import { and, eq, inArray } from "drizzle-orm";
import { db } from "../index.js";
import { classTable, examsTable } from "../model/schema.js";


export const createExams = async (req, res) => {
    const { data } = req.body;

    if (!data?.date || !data?.time || !data?.title || !data?.class || !data?.section) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }

    try {
        // 1️⃣ Check if Exam Already Exists
        const existingExam = await db
            .select()
            .from(examsTable)
            .where(
                and(
                    eq(examsTable.date, data.date),
                    eq(examsTable.time, data.time),
                    eq(examsTable.title, data.title),
                    eq(examsTable.class, data.class),
                    eq(examsTable.section, data.section)
                )
            );

        if (existingExam.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Exam Already Present",
            });
        }

        // 2️⃣ Insert Exam
        const exam = await db
            .insert(examsTable)
            .values(data)
            .returning();

        if (exam.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Exam could not be created",
            });
        }

        // 3️⃣ Find Class
        const classData = await db
            .select()
            .from(classTable)
            .where(
                and(
                    eq(classTable.className, data.class),
                    eq(classTable.section, data.section)
                )
            );

        if (classData.length > 0) {
            const studentsIds = Array.isArray(classData[0].students)
                ? classData[0].students
                : [];

            if (studentsIds.length > 0) {
                const students = await db
                    .select()
                    .from(userTable)
                    .where(inArray(userTable.id, studentsIds));

                const notification = {
                    title: "New Exam Scheduled",
                    message: `Exam "${data.title}" scheduled on ${data.date} at ${data.time}`,
                    type: "exam",
                    read: false,
                    date: new Date().toISOString(),
                };

                for (const student of students) {
                    const existingNotifications = Array.isArray(student.notification)
                        ? student.notification
                        : [];

                    await db
                        .update(userTable)
                        .set({
                            notification: [...existingNotifications, notification],
                        })
                        .where(eq(userTable.id, student.id));
                }
            }
        }

        // 4️⃣ Add Activity for Principals
        const principals = await db
            .select()
            .from(userTable)
            .where(eq(userTable.type, "principal"));

        for (const prince of principals) {
            const updatedActivity = [
                ...(prince.activity || []),
                {
                    title: "Exam Created",
                    message: `Exam "${data.title}" scheduled for Class ${data.class}-${data.section} on ${data.date} at ${data.time}`,
                    type: "exam",
                    read: false,
                    date: new Date().toISOString(),
                },
            ];

            await db
                .update(userTable)
                .set({ activity: updatedActivity })
                .where(eq(userTable.id, prince.id));
        }

        return res.status(201).json({
            success: true,
            message: "Exam Created Successfully",
            data: exam[0],
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};
export const getExam = async (req, res) => {
    try {
        const exam = await db.select().from(examsTable)
        if (exam.length > 0) {
            return res.status(201).json({
                success: true,
                message: "Exam get Successfully",
                exams: exam
            });
        }

        return res.status(400).json({
            success: false,
            message: "Exam could not fetched",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
}

export const updateExam = async (req, res) => {
    const { data } = req.body;
    const { id } = req.params;

    try {
        const updatedExam = await db
            .update(examsTable)
            .set(data)
            .where(eq(examsTable.id, id))
            .returning();

        if (updatedExam.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Exam Updated Successfully",
            exam: updatedExam[0],
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};



export const deleteExam = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedExam = await db
            .delete(examsTable)
            .where(eq(examsTable.id, id))
            .returning();

        if (deletedExam.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Exam Deleted Successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};
