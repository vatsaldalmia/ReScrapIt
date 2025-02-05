import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/auth.controllers.js";
import authMiddleware from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);

export default router;
