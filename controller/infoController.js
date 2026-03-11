import { db } from "../index.js"
import { schoolInfoTable } from "../model/schema.js"
import { eq } from "drizzle-orm"


// ---------------- GET INFO ----------------
export const getInfo = async (req, res) => {
  try {

    const information = await db.select().from(schoolInfoTable)

    return res.status(200).json({
      success: true,
      info: information || []
    })

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Error occurred: ${e.message}`
    })
  }
}


// ---------------- CREATE INFO ----------------
export const createInfo = async (req, res) => {

  const { data } = req.body

  console.log(data)

  try {

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Data is required"
      })
    }

    const information = await db
      .insert(schoolInfoTable)
      .values(data)
      .returning()

    return res.status(201).json({
      success: true,
      info: information,
      message: "Successfully created"
    })

  } catch (e) {

    return res.status(500).json({
      success: false,
      message: `Error occurred: ${e.message}`
    })

  }
}


// ---------------- UPDATE INFO ----------------
export const updateInfo = async (req, res) => {

  const { data } = req.body

  if (!data || !data.id) {
    return res.status(400).json({
      success: false,
      message: "ID and data are required"
    })
  }

  const { id, createdAt, ...updateData } = data

  try {

    const information = await db
      .select()
      .from(schoolInfoTable)
      .where(eq(schoolInfoTable.id, id))

    if (information.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Info not found"
      })
    }

    const updatedInfo = await db
      .update(schoolInfoTable)
      .set(updateData)
      .where(eq(schoolInfoTable.id, id))
      .returning()

    return res.status(200).json({
      success: true,
      message: "Info updated successfully",
      data: updatedInfo
    })

  } catch (e) {

    return res.status(500).json({
      success: false,
      message: `Error occurred: ${e.message}`
    })

  }

}


// ---------------- DELETE INFO ----------------
export const deleteInfo = async (req, res) => {

  const { id } = req.params

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID is required"
    })
  }

  try {

    const deletedInfo = await db
      .delete(schoolInfoTable)
      .where(eq(schoolInfoTable.id, id))
      .returning()

    if (deletedInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Info not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Info deleted successfully",
      data: deletedInfo
    })

  } catch (e) {

    return res.status(500).json({
      success: false,
      message: `Error occurred: ${e.message}`
    })

  }

}