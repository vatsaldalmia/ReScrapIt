import express from "express";
import { registerUser, loginUser, getProfile, updateProfile, uploadKyc } from "../controllers/auth.controllers.js";
import { authMiddleware }from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/kyc", authMiddleware, uploadKyc);

export default router;
