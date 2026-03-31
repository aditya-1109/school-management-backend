import { eq } from "drizzle-orm"
import { db } from "../index.js"
import { communicationTable, userTable } from "../model/schema.js"

export const createCommunication = async (req, res) => {
    const { data } = req.body;

    try {
        // 1️⃣ Insert Chat / Communication
        const chat = await db
            .insert(communicationTable)
            .values(data)
            .returning();

        if (!chat || chat.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Could not send",
            });
        }

        // 2️⃣ Get Receiver IDs from data.secondPerson
        const receiverIds = Array.isArray(data.secondPerson)
            ? data.secondPerson
            : [];

        if (receiverIds.length > 0) {
            const users = await db
                .select()
                .from(userTable)
                .where(inArray(userTable.id, receiverIds));

            const notification = {
                title: "New Message",
                message: `You got a new ${data?.type}`,
                type: data?.type || "communication",
                read: false,
                date: new Date().toISOString(),
            };

            // 3️⃣ Update Each Receiver
            for (let user of users) {
                const existingNotifications = Array.isArray(user.notification)
                    ? user.notification
                    : [];

                await db
                    .update(userTable)
                    .set({
                        notification: [...existingNotifications, notification],
                    })
                    .where(eq(userTable.id, user.id));
            }
        }

        return res.status(200).json({
            success: true,
            message: "Successfully sent",
            data: chat[0],
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};

export const getCommunication = async (req, res) => {
    const { type } = req.params;
    try {
        const chat = await db.select().from(communicationTable).where(eq(communicationTable.type, type));
        if (chat) {
            return res.status(200).json({ success: true, message: "Successfully get", chats: chat })
        } else {
            return res.status(400).json({ success: false, message: "Could not get" })
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: `Error Occured: ${e.message}` })
    }
}