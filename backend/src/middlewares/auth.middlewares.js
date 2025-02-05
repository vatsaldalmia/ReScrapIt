import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next(); // Move to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export default authMiddleware;
