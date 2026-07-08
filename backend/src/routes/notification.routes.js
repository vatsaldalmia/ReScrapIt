import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { getNotifications, markRead, markAllRead } from "../controllers/notification.controllers.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read-all", authMiddleware, markAllRead);
router.put("/:id/read", authMiddleware, markRead);

export default router;
