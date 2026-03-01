import { eq } from "drizzle-orm";
import { newUsersTable } from "../model/schema.js";
import {db} from "../index.js"

export const createNewUser = async (req, res) => {
  const { data } = req.body;

  try {
    const insertedUser = await db
      .insert(newUsersTable)
      .values({
        name: data.name,
        email: data.email,
        parent: data.parent,
        parentEmail: data.parentEmail,
        phone: data.phone,
        status: data.status,
        dob: data.dob,
        gender: data.gender,
        documents: data.documents || [],
      })
      .returning();

    return res.status(201).json({
      success: true,
      data: insertedUser[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllNewUsers = async (req, res) => {
  try {
    const users = await db.select().from(newUsersTable);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getSingleNewUser = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const user = await db
      .select()
      .from(newUsersTable)
      .where(eq(newUsersTable.id, id));

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateNewUser = async (req, res) => {
  const id = Number(req.params.id);
  const { data } = req.body;

  try {
    const updatedUser = await db
      .update(newUsersTable)
      .set({
        name: data.name,
        email: data.email,
        parent: data.parent,
        parentEmail: data.parentEmail,
        phone: data.phone,
        status: data.status,
        dob: data.dob,
        gender: data.gender,
        documents: data.documents,
      })
      .where(eq(newUsersTable.id, id))
      .returning();

    if (!updatedUser.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteNewUser = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const deletedUser = await db
      .delete(newUsersTable)
      .where(eq(newUsersTable.id, id))
      .returning();

    if (!deletedUser.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
