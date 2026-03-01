import { Router } from "express";
import { createTimeTable, getTimeTable } from "../controller/timeTableController.js";
import { auth } from "../middleware/auth.js";


const timeTableRoutr = Router()

timeTableRoutr.post("/createTimeTable", auth, createTimeTable)

timeTableRoutr.get("/getTimeTable", auth, getTimeTable)

export default timeTableRoutr