import { Router } from "express";
import { createComplaint, getComplaint, getComplaintById } from "../controller/complaintController.js";
import { auth } from "../middleware/auth.js";


const complaintRouter = Router()

complaintRouter.get("/getComplaint", auth, getComplaint)

complaintRouter.post("/createComplaint", auth, createComplaint)

complaintRouter.get("/getComplaintById/:id", auth, getComplaintById)

export default complaintRouter