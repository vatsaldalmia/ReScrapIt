import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
