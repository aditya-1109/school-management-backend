import { Router } from "express";
import { deleteFees, getFees, updateFees } from "../controller/feeController.js";
import { auth } from "../middleware/auth.js";


const feeRouter = Router()

feeRouter.get("/getFees", auth, getFees)

feeRouter.put("/updateFee/:feeId", auth, updateFees)

feeRouter.delete("/deleteFee/:feeId", auth,  deleteFees)

export default feeRouter