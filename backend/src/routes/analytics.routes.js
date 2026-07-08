import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { getMyAnalytics } from "../controllers/analytics.controllers.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyAnalytics);

export default router;
