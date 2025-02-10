import express from 'express';
import { createChat, getUserChats } from '../controllers/chat.controllers.js';
import { authMiddleware } from '../middlewares/auth.middlewares.js'

const router = express.Router();

router.post("/createchat", authMiddleware, createChat);
router.get("/getchat", authMiddleware, getUserChats);

export default router;
