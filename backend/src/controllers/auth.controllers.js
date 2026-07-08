import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../lib/mailer.js";
import { sendSms } from "../lib/sms.js";

const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });

const sanitizeUser = (user) => {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
};

// User Signup
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, address, pan } = req.body;

        if (!name || !email || !password || !phoneNumber || !address || !pan) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword, phoneNumber, address, pan });

        await user.save();

        const token = signToken(user._id);
        res.status(201).json({ token, user: sanitizeUser(user) });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log(error);

    }
};

// User Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = signToken(user._id);

        res.json({ token, user: sanitizeUser(user) });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log(error);
    }
};

// Get User Profile (Protected)
export const getProfile = async (req, res) => {
    try {
        // authMiddleware already attaches the user document (minus password)
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update editable profile / company fields (Protected)
export const updateProfile = async (req, res) => {
    try {
        const editable = ["name", "phoneNumber", "address", "companyName", "gst", "logo", "bio", "role"];
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        for (const key of editable) {
            if (req.body[key] !== undefined) {
                // Never allow self-promotion to admin via profile update.
                if (key === "role" && req.body.role === "admin") continue;
                if (key === "role" && !["buyer", "seller", "dual"].includes(req.body.role)) continue;
                user[key] = req.body[key];
            }
        }
        await user.save();
        res.json(sanitizeUser(user));
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add a KYC document (Protected). Resets verification to pending review.
export const uploadKyc = async (req, res) => {
    try {
        const { type, url } = req.body;
        if (!url) return res.status(400).json({ message: "Document url is required" });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.kycDocuments.push({ type: type || "other", url, status: "pending" });
        await user.save();
        res.status(201).json(sanitizeUser(user));
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const FRONTEND_URL = () => process.env.FRONTEND_URL || "http://localhost:5173";

// Request an email-verification link.
export const requestEmailVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.emailVerified) return res.status(400).json({ message: "Email already verified" });

        const token = crypto.randomBytes(24).toString("hex");
        user.emailVerifyToken = token;
        user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const link = `${FRONTEND_URL()}/verify-email?token=${token}`;
        const result = await sendEmail({
            to: user.email,
            subject: "Verify your ReScrapIt email",
            text: `Verify your email: ${link}`,
        });

        res.status(200).json({ message: "Verification email sent", devToken: result.simulated ? token : undefined });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Confirm email verification with a token.
export const confirmEmailVerification = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({ emailVerifyToken: token, emailVerifyExpires: { $gt: new Date() } });
        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        user.emailVerified = true;
        user.emailVerifyToken = undefined;
        user.emailVerifyExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Email verified" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Request a password reset link.
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        // Always respond success to avoid account enumeration.
        if (!user) return res.status(200).json({ message: "If that email exists, a reset link was sent" });

        const token = crypto.randomBytes(24).toString("hex");
        user.resetToken = token;
        user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const link = `${FRONTEND_URL()}/reset-password?token=${token}`;
        const result = await sendEmail({
            to: user.email,
            subject: "Reset your ReScrapIt password",
            text: `Reset your password: ${link}`,
        });

        res.status(200).json({ message: "If that email exists, a reset link was sent", devToken: result.simulated ? token : undefined });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Reset password using a token.
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

        const user = await User.findOne({ resetToken: token, resetExpires: { $gt: new Date() } });
        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        user.password = await bcrypt.hash(password, 10);
        user.resetToken = undefined;
        user.resetExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Change password while logged in.
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });

        const user = await User.findById(req.user._id);
        const ok = await bcrypt.compare(currentPassword || "", user.password);
        if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: "Password changed" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Request a phone OTP.
export const requestOtp = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const code = String(Math.floor(100000 + Math.random() * 900000));
        user.otpCode = code;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        const result = await sendSms({ to: user.phoneNumber, message: `Your ReScrapIt OTP is ${code}` });
        res.status(200).json({ message: "OTP sent", devCode: result.simulated ? code : undefined });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Verify a phone OTP.
export const verifyOtp = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user._id);
        if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
            return res.status(400).json({ message: "OTP expired, request a new one" });
        }
        if (user.otpCode !== code) return res.status(400).json({ message: "Incorrect OTP" });

        user.phoneVerified = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Phone verified" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
