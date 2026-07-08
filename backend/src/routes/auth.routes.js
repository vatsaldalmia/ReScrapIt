import express from "express";
import {
    registerUser, loginUser, getProfile, updateProfile, uploadKyc,
    requestEmailVerification, confirmEmailVerification,
    forgotPassword, resetPassword, changePassword,
    requestOtp, verifyOtp,
} from "../controllers/auth.controllers.js";
import { authMiddleware }from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/kyc", authMiddleware, uploadKyc);

router.post("/verify-email/request", authMiddleware, requestEmailVerification);
router.post("/verify-email/confirm", confirmEmailVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authMiddleware, changePassword);
router.post("/otp/request", authMiddleware, requestOtp);
router.post("/otp/verify", authMiddleware, verifyOtp);

export default router;
