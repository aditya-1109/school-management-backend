import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { eventsTable, userTable } from "../model/schema.js";

export const createEvent = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data?.date || !data?.topic || !data?.time) {
      return res.status(400).json({
        success: false,
        message: "Date, topic and time are required",
      });
    }

    // 1️⃣ Create Event
    const [newEvent] = await db
      .insert(eventsTable)
      .values({
        date: data.date,
        topic: data.topic,
        time: data.time,
        attendees: data.attendees || 0,
        status: data.status || "pending",
        approval: data.approval || "not",
      })
      .returning();

    if (!newEvent) {
      return res.status(400).json({
        success: false,
        message: "Event could not be created",
      });
    }

    // 2️⃣ Notification Object
    const notification = {
      title: data.topic,
      message: `You have new Event "${data.topic}"`,
      date: new Date().toISOString(),
      read: false,
      type: "event",
    };

    // 3️⃣ Notify All Users
    const users = await db.select().from(userTable);

    if (users?.length > 0) {
      for (const user of users) {
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

    // 4️⃣ Add Activity for Principals
    const principals = await db
      .select()
      .from(userTable)
      .where(eq(userTable.type, "principal"));

    for (const prince of principals) {
      const updatedActivity = [
        ...(prince.activity || []),
        {
          title: "Event Created",
          message: `New Event "${data.topic}" scheduled on ${data.date} at ${data.time}`,
          type: "event",
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
      message: "Event created successfully",
      data: newEvent,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error creating event: ${error.message}`,
    });
  }
};


export const getAllEvents = async (req, res) => {
  try {
    const events = await db.select().from(eventsTable);

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error fetching events: ${error.message}`,
    });
  }
};


export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, Number(id)));

    if (!event.length) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: event[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error fetching event: ${error.message}`,
    });
  }
};


export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const updated = await db
      .update(eventsTable)
      .set({
        ...(data.date && { date: data.date }),
        ...(data.topic && { topic: data.topic }),
        ...(data.time && { time: data.time }),
        ...(data.attendees !== undefined && { attendees: data.attendees }),
        ...(data.status && { status: data.status }),
        ...(data.approval && { approval: data.approval }),
      })
      .where(eq(eventsTable.id, Number(id)))
      .returning();

    if (!updated.length) {
      return res.status(404).json({
        success: false,
        message: "Event not found or not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updated[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error updating event: ${error.message}`,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db
      .delete(eventsTable)
      .where(eq(eventsTable.id, Number(id)))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error deleting event: ${error.message}`,
    });
  }
};
