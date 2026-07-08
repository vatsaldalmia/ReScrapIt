import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { sendMessage, getMessages, markSeen } from '../controllers/message.controllers.js';

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);
router.get("/get/:chatId", authMiddleware, getMessages);
router.put("/seen/:chatId", authMiddleware, markSeen);

export default router;