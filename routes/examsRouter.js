import { Router } from "express";
import { createExams, deleteExam, getExam, updateExam } from "../controller/examsController.js";
import { auth } from "../middleware/auth.js";

const examsRouter = Router()

examsRouter.post("/createExams", auth, createExams)

examsRouter.get("/getExams", auth, getExam)

examsRouter.put("/updateExams/:id", auth, updateExam)

examsRouter.delete("/deleteExams/:id", auth, deleteExam)

export default examsRouter