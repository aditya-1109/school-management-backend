import { Router } from "express";
import { createCommunication, getCommunication } from "../controller/communicationController.js";
import { auth } from "../middleware/auth.js";

const communicationRouter = Router();

communicationRouter.post("/createChat", auth, createCommunication )

communicationRouter.get("/getChat/:type", auth, getCommunication)

export default communicationRouter