import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { createReport } from "../controllers/report.controllers.js";

const router = express.Router();

router.post("/", authMiddleware, createReport);

export default router;
