import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { raiseDispute, getMyDisputes } from "../controllers/dispute.controllers.js";

const router = express.Router();

router.post("/", authMiddleware, raiseDispute);
router.get("/mine", authMiddleware, getMyDisputes);

export default router;
