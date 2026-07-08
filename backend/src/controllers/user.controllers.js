import User from "../models/user.models.js";

// Public seller/user profile — only non-sensitive fields.
export const getPublicUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("name email createdAt rating isVerified companyName bio");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
