import { db } from "../index.js";
import { timeTable, userTable } from "../model/schema.js";
import { eq } from "drizzle-orm"


export const createTimeTable = async (req, res) => {
    const { data } = req.body;

    if (!data?.classId || !data?.day || !data?.timeTables?.length) {
        return res.status(400).json({
            success: false,
            message: "Class, Day and TimeTable are required",
        });
    }





    try {



        for (const timeT of data.timeTables) {



            const teacher = await db
                .select()
                .from(userTable)
                .where(eq(userTable.id, timeT.teacher))
                .limit(1);

            if (!teacher.length) {
                return res.status(400).json({
                    success: false,
                    message: "Teacher not found",
                });
            }

            const existingClassTime = teacher[0].classTime || [];

            // 2️⃣ Append new timetable
            const updatedTeacher = await db
                .update(userTable)
                .set({
                    classTime: [...existingClassTime, {classId: data.classId, day: data.day, time: timeT.time}],
                })
                .where(eq(userTable.id, timeT.teacher))
                .returning();




            if (!updatedTeacher.length) {
                return res.status(400).json({
                    success: false,
                    message: "Could not find teacher",
                });
            }
        }



        const existing = await db
            .select()
            .from(timeTable)
            .where(eq(timeTable.classId, data.classId));

        if (existing.length > 0) {

            await db
                .update(timeTable)
                .set({
                    [data.day]: data.timeTables,
                })
                .where(eq(timeTable.classId, data.classId));

            return res.status(200).json({
                success: true,
                message: `${data.day} updated successfully`,
            });
        }



        await db.insert(timeTable).values({
            classId: data.classId,
            [data.day]: data.timeTables,
        });

        return res.status(201).json({
            success: true,
            message: "TimeTable created successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};


export const getTimeTable = async (req, res) => {
    try {
        const timetables = await db.select().from(timeTable)
        if (timetables) {
            return res.status(200).json({
                success: true,
                message: "TimeTable get successfully",
                timeTables: timetables
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Couldn't get timetable",
            });
        }
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error occured: ${e.message}`,
        });
    }
}