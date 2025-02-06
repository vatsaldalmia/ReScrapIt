import express from "express";
import axios from "axios";
import { addScrap, deleteScrap, searchScrap } from "../controllers/scrap.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();


router.post("/add", authMiddleware, addScrap);

router.delete("/delete/:id", authMiddleware, deleteScrap);

router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const response = await axios.get(`http://localhost:8000/search`, { params: { query } });

        res.json(response.data);
    } catch (error) {
        console.error("Error in semantic search:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
