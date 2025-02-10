import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const authMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(" ")[1] || req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;

        next(); 
    } catch (error) {
        console.error("Error in authMiddleware: ", error.message);
        res.status(500).json({ message: "Invalid JWT" });
    }
};
