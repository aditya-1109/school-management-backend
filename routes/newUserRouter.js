import Router from "express"
import { createNewUser, deleteNewUser, getAllNewUsers, getSingleNewUser, updateNewUser } from "../controller/newUserController.js"

const newUserRouter = Router()

newUserRouter.post("/createNewUser", createNewUser)

newUserRouter.get("/getAllNewUser", getAllNewUsers)

newUserRouter.get("/getNewUser/:id", getSingleNewUser)

newUserRouter.put("/updateNewUser", updateNewUser)

newUserRouter.delete("/deleteNewUser", deleteNewUser)


export default newUserRouter