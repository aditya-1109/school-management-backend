import { eq, inArray } from "drizzle-orm"
import { db } from "../index.js"
import { complaintsTable } from "../model/schema.js"


export const createComplaint = async (req, res) => {
  const { data } = req.body;

  try {
    
    const [complaint] = await db
      .insert(complaintsTable)
      .values(data)
      .returning();

    if (!complaint) {
      return res.status(400).json({
        success: false,
        message: "Could not create complaint",
      });
    }

    
    const studentIds = Array.isArray(data.student) ? data.student : [];

    if (studentIds.length > 0) {
      const students = await db
        .select()
        .from(userTable)
        .where(inArray(userTable.id, studentIds));

      const notification = {
        title: "New Complaint Issued",
        message: `A complaint has been registered against you on ${data?.type}.`,
        type: "complaint",
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

    
    const principals = await db
      .select()
      .from(userTable)
      .where(eq(userTable.type, "principal"));

    for (const prince of principals) {
      const updatedActivity = [
        ...(prince.activity || []),
        {
          title: "Complaint Created",
          message: `Complaint registered for ${studentIds.length} student(s) under "${data?.type}".`,
          type: "complaint",
          read: false,
          date: new Date().toISOString(),
        },
      ];

      await db
        .update(userTable)
        .set({ activity: updatedActivity })
        .where(eq(userTable.id, prince.id));
    }

    return res.status(200).json({
      success: true,
      message: "Complaint created successfully",
      data: complaint,
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Error occurred: ${e.message}`,
    });
  }
};


export const getComplaint = async (req, res) => {
  try {
    const complaint = await db.select().from(complaintsTable)
    if (complaint) {
      return res.status(200).json({ success: true, message: "Complaint get successfully", complaint: complaint })
    } else {
      return res.status(400).json({ success: false, message: "Could not get complaint" })
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: `Error occured: ${e.message}` })
  }
}

export const getComplaintById = async (req, res) => {
  const { id } = req.params
  try {
    const complaint = await db.select().from(complaintsTable).where(eq(complaintsTable.id, id))
    if (complaint) {
      return res.status(200).json({ success: true, message: "Complaint get successfully", complaint: complaint })
    } else {
      return res.status(400).json({ success: false, message: "Could not get complaint" })
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: `Error occured: ${e.message}` })
  }
}