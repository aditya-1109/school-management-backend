import { Router } from "express";
import { createCourse, deletecourse, getcourse, submitAnswer, updatecourse } from "../controller/courseController.js";
import { auth } from "../middleware/auth.js";

const courseRouter = Router()

courseRouter.post("/createCourse", auth, createCourse)

courseRouter.get("/getCourse", auth, getcourse)

courseRouter.put("/updateCourse/:id", auth,  updatecourse)

courseRouter.delete("/deleteCourse/:id", auth, deletecourse)

courseRouter.put("/uploadFile", auth, submitAnswer)

export default courseRouter