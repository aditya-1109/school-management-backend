import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createInfo, deleteInfo, getInfo, updateInfo } from "../controller/infoController.js";

const infoRouter = Router()

infoRouter.get("/getInfo",auth, getInfo )

infoRouter.post("/createInfo", auth, createInfo)

infoRouter.put("/updateInfo", auth, updateInfo)

infoRouter.delete("/deleteInfo/:id", auth, deleteInfo)

export default infoRouter