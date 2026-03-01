import { db } from "../index.js";
import { classTable, complaintsTable, feeTable, timeTable, userTable } from "../model/schema.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import bcrypt from "bcrypt";
import { eq, inArray, sql } from "drizzle-orm";

dotenv.config()

const generateToken = async (data, type) => {
    let token

    token = jwt.sign(data, process.env.JWT_SECRET_Admin);


    return token
}

const calculateStudentScore = async (student) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Attendance Score
    let attendanceCount = 0;

    if (Array.isArray(student?.attendance)) {
        attendanceCount = student.attendance.filter((a) =>
            new Date(a.date) >= sevenDaysAgo &&
            a.status === "present"
        ).length;
    }

    // Complaint Count
    let complaintCount = 0;

    if (Array.isArray(student?.complaints) && student.complaints.length > 0) {

        // Convert to numbers and remove invalid values
        const complaintIds = student.complaints
            .map(id => Number(id))
            .filter(id => !isNaN(id));

        if (complaintIds.length > 0) {

            const complaints = await db
                .select()
                .from(complaintsTable)
                .where(inArray(complaintsTable.id, complaintIds));

            complaintCount = complaints.filter(c =>
                new Date(c.date) >= sevenDaysAgo
            ).length;

        } else {
            complaintCount = 0;
        }

    } else {
        complaintCount = 0;
    }

    // Final Score Formula
    const score = (attendanceCount * 10) - (complaintCount * 5);

    return score;
};


export const createUser = async (req, res) => {
    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({
                success: false,
                message: "No data provided"
            });
        }

        // 🔍 Check email duplicate
        const existingUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, data.email));

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // 🔐 Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // ✅ Create user first
        const [newUser] = await db
            .insert(userTable)
            .values({
                ...data,
                password: hashedPassword,
                connections: data.connections || []
            })
            .returning();

        /**
         * ✅ If connections exist,
         * update the connected users to include this new user
         */
        if (data.connections?.length > 0) {
            for (const connectedUserId of data.connections) {
                await db
                    .update(userTable)
                    .set({
                        connections: sql`array_append(${userTable.connections}, ${newUser.id})`
                    })
                    .where(eq(userTable.id, connectedUserId));
            }
        }

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error occurred: ${e.message}`
        });
    }
};


export const loginUser = async (req, res) => {
    const { data } = req.body;
    console.log("Login attempt with data:", data)

    if (!data.email || !data.password) {
        return res.status(400).json({
            success: false,
            message: "Incomplete credentials"
        });
    }

    try {
        // Find user by email
        const user = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, data.email));

        if (!user.length) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const existingUser = user[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(data.password, existingUser.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Generate token WITHOUT password
        const token = await generateToken(
            { id: existingUser.id, email: existingUser.email },
            existingUser.type // admin or user
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: existingUser,
            token
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error occurred: ${e.message}`
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { data } = req.body;

        console.log(data)

        if (!data.id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // ✅ Check if user exists
        const existingUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, data.id));

        if (existingUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }




        // ✅ If password is being updated → hash it
        if (data.password !== "") {
            data.password = await bcrypt.hash(data.password, 10);
        } else {
            delete data.password
        }

        const userId = data.id

        delete data.id
        delete data.createdAt

        // ✅ Update user
        await db
            .update(userTable)
            .set(data)
            .where(eq(userTable.id, userId));

        return res.status(200).json({
            success: true,
            message: "User updated successfully"
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error occurred: ${e.message}`
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await db
            .select()
            .from(userTable);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }

        return res.status(200).json({
            success: true,
            count: users.length,
            users: users
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`
        });
    }
};


export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("id", id)

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, Number(id)));

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: user[0]
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`
        });
    }
}

export const uploadBulkUser = async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format",
            });
        }

        const createdUsers = [];

        for (let user of data) {
            if (!user.email || !user.password || !user.name || !user.type) {
                continue;
            }

            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Parse JSON safely
            let parsedLinks = {};
            let parsedDocuments = {};

            try {
                parsedLinks =
                    typeof user.links === "string"
                        ? JSON.parse(user.links)
                        : user.links || {};
            } catch (err) {
                parsedLinks = {};
            }

            try {
                parsedDocuments =
                    typeof user.documents === "string"
                        ? JSON.parse(user.documents)
                        : user.documents || {};
            } catch (err) {
                parsedDocuments = {};
            }

            // ✅ Spread user, NOT data
            const uploadedUser = {
                ...user,
                password: hashedPassword,
                links: parsedLinks,
                documents: parsedDocuments,
            };

            const newUser = await db.insert(userTable).values(uploadedUser);
            createdUsers.push(newUser);
        }

        return res.status(200).json({
            success: true,
            message: `${createdUsers.length} users created successfully`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getMySelf = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        const result = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, req.user.id))
            .limit(1);

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            mySelf: result[0],
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    const userId = Number(id);

    try {
        await db.transaction(async (tx) => {

            // 1️⃣ Get user
            const userResult = await tx
                .select()
                .from(userTable)
                .where(eq(userTable.id, userId));

            if (!userResult.length) {
                throw new Error("User not found");
            }

            const user = userResult[0];

            // =========================
            // 2️⃣ If Student
            // =========================
            if (user.type === "student") {
                const classes = await tx.select().from(classTable);

                for (let cls of classes) {
                    if (cls.student?.includes(userId)) {
                        const updatedStudents = cls.student.filter(
                            (sid) => sid !== userId
                        );

                        await tx
                            .update(classTable)
                            .set({ student: updatedStudents })
                            .where(eq(classTable.id, cls.id));
                    }
                }
            }

            // =========================
            // 3️⃣ If Teacher
            // =========================
            if (user.type === "teacher") {
                const classes = await tx.select().from(classTable);

                for (let cls of classes) {
                    if (cls.teacher?.includes(userId)) {
                        const updatedTeachers = cls.teacher.filter(
                            (tid) => tid !== userId
                        );

                        await tx
                            .update(classTable)
                            .set({ teacher: updatedTeachers })
                            .where(eq(classTable.id, cls.id));
                    }
                }

                const timetables = await tx.select().from(timeTable);

                for (let tt of timetables) {
                    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

                    let updated = {};

                    for (let day of days) {
                        if (tt[day]) {
                            updated[day] = tt[day].filter(
                                (entry) => entry.teacher !== userId
                            );
                        }
                    }

                    await tx
                        .update(timeTable)
                        .set(updated)
                        .where(eq(timeTable.id, tt.id));
                }
            }


            if (user.connections?.length > 0) {
                for (let connectionId of user.connections) {
                    const connectedUserResult = await tx
                        .select()
                        .from(userTable)
                        .where(eq(userTable.id, connectionId));

                    if (connectedUserResult.length) {
                        const connectedUser = connectedUserResult[0];

                        const updatedConnections =
                            connectedUser.connections?.filter(
                                (cid) => cid !== userId
                            ) || [];

                        await tx
                            .update(userTable)
                            .set({ connections: updatedConnections })
                            .where(eq(userTable.id, connectionId));
                    }
                }
            }


            await tx
                .delete(userTable)
                .where(eq(userTable.id, userId));
        });

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};

export const updateMarks = async (req, res) => {
    const { data } = req.body;

    if (!data?.id || !data?.type || !data?.typeId || data?.marks == null) {
        return res.status(400).json({
            success: false,
            message: "Student ID, Type, TypeId and Marks are required",
        });
    }

    try {
        // ✅ Get existing user
        const existingUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, data.id));

        if (!existingUser.length) {
            return res.status(400).json({
                success: false,
                message: "Could not find student",
            });
        }

        const user = existingUser[0];

        // ✅ Ensure grade is array
        const existingGrades = Array.isArray(user.grade) ? user.grade?.filter((usee) => usee.typeId != data.typeId && usee.type != data.type) : [];



        // ✅ Append new marks
        const updatedGrades = [
            ...existingGrades,
            {
                type: data.type,
                typeId: data.typeId,
                marks: data.marks,
            },
        ];

        // ✅ Update user
        const updatedUser = await db
            .update(userTable)
            .set({ grade: updatedGrades })
            .where(eq(userTable.id, data.id))
            .returning();

        if (!updatedUser.length) {
            return res.status(400).json({
                success: false,
                message: "Could not update marks",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Marks updated successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};

export const updateAttendance = async (req, res) => {
    const { data } = req.body;
    const { id } = req.params;

    // 🔥 Validate input
    if (!id || !data?.date || !data?.status) {
        return res.status(400).json({
            success: false,
            message: "User ID, date and status are required",
        });
    }

    try {
        // ✅ Get user (Drizzle returns array)
        const userResult = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, id));

        const user = userResult[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const currentAttendance = user.attendance || [];

        // ✅ Prevent duplicate entry for same date
        const alreadyMarked = currentAttendance.find(
            (a) => a.date === data.date
        );

        let updatedAttendance;

        if (alreadyMarked) {
            // Update existing date
            updatedAttendance = currentAttendance.map((a) =>
                a.date === data.date ? data : a
            );
        } else {
            // Add new date entry
            updatedAttendance = [...currentAttendance, data];
        }

        // ✅ Update DB
        const markAttend = await db
            .update(userTable)
            .set({ attendance: updatedAttendance })
            .where(eq(userTable.id, id));

        return res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};

export const addFee = async (req, res) => {
    try {
        const { data } = req.body;

        if (
            !data?.totalAmount ||
            !data?.lastDate ||
            !data?.title ||
            !Array.isArray(data?.studentId) ||
            data.studentId.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Incomplete fee data",
            });
        }

        const { studentId, ...feeData } = data;

        // Create fee
        const [newFee] = await db
            .insert(feeTable)
            .values(feeData)
            .returning();

        if (!newFee) {
            return res.status(400).json({
                success: false,
                message: "Fee creation failed",
            });
        }

        // Assign fee to students
        for (const id of studentId) {
            const student = await db
                .select()
                .from(userTable)
                .where(eq(userTable.id, id));

            if (!student.length) continue;

            const user = student[0];

            const updatedFees = [
                ...(user.fees || []),
                {
                    feeId: newFee.id,
                    status: "pending",
                    paidAmount: 0,
                    paidAt: null,
                },
            ];

            const updatedNotifications = [
                ...(user.notification || []),
                {
                    title: "Fee Pending",
                    message: `Your fee "${newFee.title}" of ₹${newFee.totalAmount} is pending.`,
                    date: new Date().toISOString(),
                    read: false,
                    type: "fee",
                },
            ];

            await db
                .update(userTable)
                .set({
                    fees: updatedFees,
                    notification: updatedNotifications,
                })
                .where(eq(userTable.id, id));
        }

        // Notify principals
        const principals = await db
            .select()
            .from(userTable)
            .where(eq(userTable.type, "principal"));

        for (const prince of principals) {
            const updatedActivity = [
                ...(prince.activity || []),
                {
                    title: "Fee Created",
                    message: `New Fee "${newFee.title}" of ₹${newFee.totalAmount} is created.`,
                    date: new Date().toISOString(),
                    read: false,
                    type: "fee",
                },
            ];

            await db
                .update(userTable)
                .set({ activity: updatedActivity })
                .where(eq(userTable.id, prince.id));
        }

        return res.status(200).json({
            success: true,
            message: "Fee created and assigned successfully",
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};

export const submitFees = async (req, res) => {
    try {
        const { data } = req.body;
        const { feeId, studentId } = req.params;

        const student = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, studentId));

        if (!student.length) {
            return res.status(400).json({
                success: false,
                message: "Could not find the student",
            });
        }

        const user = student[0];

        const updatedFees = (user.fees || []).map((fee) =>
            fee.feeId == feeId
                ? {
                    ...fee,
                    status: data.status,
                    paidAmount: data.paidAmount,
                    paidAt: new Date(),
                }
                : fee
        );

        await db
            .update(userTable)
            .set({ fees: updatedFees })
            .where(eq(userTable.id, studentId));

        return res.status(200).json({
            success: true,
            message: "Fee submitted successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};


export const getTopper = async (req, res) => {
    try {
        const allStudents = await db
            .select()
            .from(userTable)
            .where(eq(userTable.type, "student"));

        if (!allStudents.length) {
            return res.status(404).json({
                success: false,
                message: "No students found",
            });
        }

        let bestStudent = null;
        let highestScore = -Infinity;

        for (let student of allStudents) {
            const score = await calculateStudentScore(student);

            if (score > highestScore) {
                highestScore = score;
                bestStudent = student;
            }
        }

        return res.status(200).json({
            success: true,
            topper: bestStudent,
            score: highestScore,
        });

    } catch (error) {
        console.error("Topper error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};


export const updateNotification = async (req, res) => {
    const { id } = req.params;

    try {
        // 1️⃣ Get student
        const student = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, id));

        if (!student || student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        const user = student[0];

        const notifications = Array.isArray(user.notification)
            ? user.notification
            : [];

        // 2️⃣ Mark all as read
        const updatedNotifications = notifications.map((noti) => ({
            ...noti,
            read: true,
        }));

        // 3️⃣ Update user
        await db
            .update(userTable)
            .set({ notification: updatedNotifications })
            .where(eq(userTable.id, id));

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error occurred: ${e.message}`,
        });
    }
};