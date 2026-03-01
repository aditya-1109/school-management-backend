import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { newUsersTable } from "./model/schema.js";
import { drizzle } from "drizzle-orm/node-postgres";
import userRouter from "./routes/userRouter.js";
import { classRouter } from "./routes/classRouter.js";
import complaintRouter from "./routes/complaintRouter.js";
import timeTableRoutr from "./routes/timeTableRouter.js";
import examsRouter from "./routes/examsRouter.js";
import courseRouter from "./routes/courseRouter.js";
import communicationRouter from "./routes/communicationRouter.js";
import feeRouter from "./routes/feeRouter.js";
import newUserRouter from "./routes/newUserRouter.js";
import eventsRouter from "./routes/eventsRouter.js";

dotenv.config()

const app = express();

app.use(cors())

app.use(express.json())

export const db = drizzle(process.env.DirectConnectionString)

app.use("/api/user", userRouter)

app.use("/api/class", classRouter)

app.use("/api/complaint", complaintRouter)

app.use("/api/timeTable", timeTableRoutr)

app.use("/api/exams", examsRouter)

app.use("/api/course", courseRouter)

app.use("/api/communication", communicationRouter)

app.use("/api/fees", feeRouter)

app.use("/api/newUser", newUserRouter)

app.use("/api/events", eventsRouter)



app.get("/", (req, res) => {
    return res.status(200).send("Connected Succesfully")
})

app.listen(3000, () => {
    console.log("Server is listening on 3000")
})