import { Router } from "express";
import { addFee, createUser, deleteUser, getMySelf, getTopper, getUserById, getUsers, loginUser, submitFees, updateAttendance, updateMarks, updateNotification, updateUser, uploadBulkUser } from "../controller/userController.js";
import { auth } from "../middleware/auth.js";


const userRouter = Router()

userRouter.post("/createUser", createUser)

userRouter.post("/loginUser", loginUser)

userRouter.put("/updateUser", auth, updateUser)

userRouter.post("/bulkUser",auth, uploadBulkUser)

userRouter.get("/getUser",auth, getUsers)

userRouter.get("/getUserById/:id",auth, getUserById)

userRouter.get("/getMyself", auth, getMySelf)

userRouter.put("/updateMarks",auth, updateMarks )

userRouter.put("/updateAttendace/:id", auth, updateAttendance)

userRouter.post("/createFees", auth, addFee)

userRouter.put("/submitFees/:studentId/:feeId", auth, submitFees)

userRouter.delete("/deleteUser/:id", auth, deleteUser)

userRouter.get("/getTopper", auth, getTopper)

userRouter.put("/updateNotification/:id", auth, updateNotification)


export default userRouter