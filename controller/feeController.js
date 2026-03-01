import { eq } from "drizzle-orm"
import { db } from "../index.js"
import { feeTable, userTable } from "../model/schema.js"

export const getFees = async(req, res)=>{
    try{
        const fees = await db.select().from(feeTable)
        if(fees){
            return res.status(200).json({success: true, fees, message: "Get successfully"})
        }else{
            return res.status(400).json({success: false, message: "Could not get"})
        }
    }catch(e){
        return res.status(500).json({success: false, fees, message: `Error Occured: ${e.message}`})
    }
}

export const updateFees = async (req, res) => {
    try {
        const { data } = req.body;
        const { feeId } = req.params;

        const {id, createdAt, ...fees} = data
        const updated = await db
            .update(feeTable)
            .set(fees)
            .where(eq(feeTable.id, feeId))
            .returning();

        if (!updated.length) {
            return res.status(400).json({
                success: false,
                message: "Could not update fee",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Fee updated successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};

export const deleteFees = async (req, res) => {
    try {
        const { feeId } = req.params;

        console.log(feeId)

        const deleted = await db
            .delete(feeTable)
            .where(eq(feeTable.id, feeId))
            .returning();

        if (!deleted.length) {
            return res.status(400).json({
                success: false,
                message: "Could not delete fee",
            });
        }

        // Remove from all students
        const students = await db.select().from(userTable);

        for (const student of students) {
            const updatedFees = (student.fees || []).filter(
                (fee) => fee.feeId != feeId
            );

            await db
                .update(userTable)
                .set({ fees: updatedFees })
                .where(eq(userTable.id, student.id));
        }

        return res.status(200).json({
            success: true,
            message: "Fee deleted successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error Occurred: ${e.message}`,
        });
    }
};

