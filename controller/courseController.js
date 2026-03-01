import { and, eq, inArray } from "drizzle-orm";
import { db } from "../index.js";
import { classTable, courseTable, userTable } from "../model/schema.js";


export const createCourse = async (req, res) => {
    const { data } = req.body;

    if (!data.title || !data.subject || !data.class || !data.section) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }

    try {
        // 1️⃣ Check Existing Course
        const existingcourse = await db
            .select()
            .from(courseTable)
            .where(
                and(
                    eq(courseTable.dueDate, data.dueDate),
                    eq(courseTable.chapter, data.chapter),
                    eq(courseTable.title, data.title),
                    eq(courseTable.class, data.class),
                    eq(courseTable.section, data.section)
                )
            );

        if (existingcourse.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Course Already Present",
            });
        }

        // 2️⃣ Create Course
        const [course] = await db
            .insert(courseTable)
            .values(data)
            .returning();

        if (!course) {
            return res.status(400).json({
                success: false,
                message: "Course could not be created",
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
            const studentsIds = Array.isArray(classData[0].student)
                ? classData[0].student
                : [];

            if (studentsIds.length > 0) {
                const students = await db
                    .select()
                    .from(userTable)
                    .where(inArray(userTable.id, studentsIds));

                const notification = {
                    title: data.title,
                    message: `New assignment/material "${data.title}" uploaded`,
                    date: new Date().toISOString(),
                    read: false,
                    type: "course",
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
                    title: "Course Created",
                    message: `New course/assignment "${data.title}" added for Class ${data.class}-${data.section}`,
                    type: "course",
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
            message: "Course Created Successfully",
            data: course,
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};


export const getcourse = async (req, res) => {
    try {
        const course = await db.select().from(courseTable)
        if (course.length > 0) {
            return res.status(201).json({
                success: true,
                message: "course get Successfully",
                courses: course
            });
        }

        return res.status(400).json({
            success: false,
            message: "course could not fetched",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
}

export const updatecourse = async (req, res) => {
    const { data } = req.body;
    const { id } = req.params;

    try {
        const updatedcourse = await db
            .update(courseTable)
            .set(data)
            .where(eq(courseTable.id, id))
            .returning();

        if (updatedcourse.length === 0) {
            return res.status(404).json({
                success: false,
                message: "course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "course Updated Successfully",
            course: updatedcourse[0],
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};



export const deletecourse = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedcourse = await db
            .delete(courseTable)
            .where(eq(courseTable.id, id))
            .returning();

        if (deletedcourse.length === 0) {
            return res.status(404).json({
                success: false,
                message: "course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "course Deleted Successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};



export const submitAnswer = async (req, res) => {
    try {
        const { data } = req.body;
        const { content, studentId, id } = data;


        if (!content || !studentId || !id) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required information.",
            });
        }

        // 1️⃣ Get course
        const selectedCourse = await db
            .select()
            .from(courseTable)
            .where(eq(courseTable.id, id));

        if (!selectedCourse.length) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        const course = selectedCourse[0];

        // 2️⃣ Ensure solution array exists
        const existingSolutions = course.solution || [];

        // 3️⃣ Prevent duplicate submission
        const alreadySubmitted = existingSolutions.find(
            (item) => item.studentId === studentId
        );

        if (alreadySubmitted) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted.",
            });
        }

        // 4️⃣ Add new submission
        const updatedSolutions = [
            ...existingSolutions,
            { content, studentId, submittedAt: new Date() },
        ];

        // 5️⃣ Update DB
        await db
            .update(courseTable)
            .set({ solution: updatedSolutions })
            .where(eq(courseTable.id, id));

        return res.status(200).json({
            success: true,
            message: "Successfully submitted.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error occurred: ${error.message}`,
        });
    }
};
