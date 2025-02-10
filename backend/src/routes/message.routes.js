import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { sendMessage, getMessages } from '../controllers/message.controllers.js';

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);
router.get("/get/:chatId", authMiddleware, getMessages);

export default router;