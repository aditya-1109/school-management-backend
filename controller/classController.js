import { and, eq, sql } from "drizzle-orm";
import {db} from "../index.js"
import { classTable, userTable } from "../model/schema.js"

export const createClasses = async (req, res) => {
    try {
        const { data } = req.body;

        if (!data?.className || !data?.section) {
            return res.status(400).json({
                success: false,
                message: "Class name and section are required"
            });
        }

        // 🔍 Check duplicate
        const existingClass = await db
            .select()
            .from(classTable)
            .where(
                and(
                    eq(classTable.className, data.className),
                    eq(classTable.section, data.section),
                    eq(classTable.subject, data.subject)
                )
            );

        if (existingClass.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Class already exists"
            });
        }

        // 🔍 Validate teacher (since now it's single string)
        if (data.teacher) {
            const teacher = await db
                .select()
                .from(userTable)
                .where(eq(userTable.id, data.teacher));

            if (teacher.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher does not exist"
                });
            }
        }

        // ✅ Insert class (convert teacher string → uuid[])
        const insertedClass = await db
            .insert(classTable)
            .values({
                className: data.className,
                section: data.section,
                teacher: data.teacher ? [data.teacher] : [],
                student: [],
                subject: data.subject
            })
            .returning();

        const newClass = insertedClass[0];

        // ✅ Update teacher classes array
        if (data.teacher) {
            const teacher = await db
                .select()
                .from(userTable)
                .where(eq(userTable.id, data.teacher));

            const updatedClasses = [
                ...(teacher[0].classes || []),
                newClass.id
            ];

            await db
                .update(userTable)
                .set({ classes: updatedClasses })
                .where(eq(userTable.id, data.teacher));
        }

        return res.status(201).json({
            success: true,
            message: "Class created successfully"
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error occurred: ${e.message}`
        });
    }
};



export const getClasses = async (req, res)=>{
    try {
            const classes = await db
                .select()
                .from(classTable);
    
            if (classes.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No class found"
                });
            }
    
            return res.status(200).json({
                success: true,
                count: classes.length,
                classes: classes
            });
    
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: `Error Occurred: ${e.message}`
            });
        }
}

export const getClassesById = async(req, res) =>{
    try {
        const { id } = req.params;

        console.log("id",id)

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Class ID is required"
            });
        }

        const classes = await db
            .select()
            .from(classTable)
            .where(eq(classTable.id, Number(id)));

        if (classes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "class not found"
            });
        }

        return res.status(200).json({
            success: true,
            classes: classes[0]
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`
        });
    }
}

export const updateClasses = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data?.id) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required"
      });
    }

    // 🔍 Check class exists
    const existingClass = await db
      .select()
      .from(classTable)
      .where(eq(classTable.id, data.id));

    if (existingClass.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    const oldTeacherId = existingClass[0].teacher;

    /**
     * ✅ If teacher is changed
     */
    if (data.teacher && oldTeacherId !== data.teacher) {

      // 🔹 Remove class from old teacher
      if (oldTeacherId) {
        await db
          .update(userTable)
          .set({
            classes: sql`array_remove(${userTable.classes}, ${data.id})`
          })
          .where(eq(userTable.id, oldTeacherId));
      }

      // 🔹 Add class to new teacher
      await db
        .update(userTable)
        .set({
          classes: sql`array_append(${userTable.classes}, ${data.id})`
        })
        .where(eq(userTable.id, data.teacher));
    }

    // ✅ Update class table
    await db
      .update(classTable)
      .set({
        ...data
      })
      .where(eq(classTable.id, data.id));

    return res.status(200).json({
      success: true,
      message: "Class updated successfully"
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Error occurred: ${e.message}`
    });
  }
};


export const addStudent = async (req, res) => {
    const { data } = req.body;

    if (!data?.studentId || !data?.classId) {
        return res.status(400).json({
            success: false,
            message: "Student ID and Class ID are required"
        });
    }

    try {
        // ✅ Check student exists
        const student = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, data.studentId));

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // ✅ Check class exists
        const classes = await db
            .select()
            .from(classTable)
            .where(eq(classTable.id, data.classId));

        if (classes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        // 🔥 STEP 1: Remove student from old class (if exists)
        const oldClassId = student[0].classes?.[0];

        if (oldClassId) {
            await db.update(classTable)
                .set({
                    student: sql`array_remove(${classTable.student}, ${data.studentId})`
                })
                .where(eq(classTable.id, oldClassId));
        }

        // 🔥 STEP 2: Replace student's class (ONLY ONE)
        await db.update(userTable)
            .set({
                classes: [data.classId]   // ✅ replace fully
            })
            .where(eq(userTable.id, data.studentId));

        // 🔥 STEP 3: Add student to new class
        await db.update(classTable)
            .set({
                student: sql`array_append(${classTable.student}, ${data.studentId})`
            })
            .where(eq(classTable.id, data.classId));

        return res.status(200).json({
            success: true,
            message: "Student class updated successfully"
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error occurred: ${e.message}`
        });
    }
};


export const addTeacher = async (req, res) => {
  const { data } = req.body;

  // ✅ Validation
  if (!data?.id || !Array.isArray(data?.subjectTeacher)) {
    return res.status(400).json({
      success: false,
      message: "Class ID and subjectTeacher array are required",
    });
  }

  try {
    // ✅ Check if class exists first
    const existingClass = await db
      .select()
      .from(classTable)
      .where(eq(classTable.id, data.id));

    if (existingClass.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // ✅ Update teachersSubject column
    await db
      .update(classTable)
      .set({
        teachersSubject: data.subjectTeacher,
      })
      .where(eq(classTable.id, data.id));

    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Error Occurred: ${e.message}`,
    });
  }
};

export const deleteClasses = async (req, res) => {
  const { id } = req.params;

  try {

    // 🔍 Check if class exists
    const existingClass = await db
      .select()
      .from(classTable)
      .where(eq(classTable.id, id));

    if (existingClass.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    // ✅ Remove class id from all users who have it
    await db
      .update(userTable)
      .set({
        classes: sql`array_remove(${userTable.classes}, ${id})`
      })
      .where(sql`${userTable.classes} @> ARRAY[${id}]`);

    // ✅ Delete class
    await db
      .delete(classTable)
      .where(eq(classTable.id, id));

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully"
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Error occurred: ${e.message}`
    });
  }
};
