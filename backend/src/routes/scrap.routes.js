import express from "express";
import axios from "axios";
import { addScrap, deleteScrap, searchScrap } from "../controllers/scrap.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();


router.post("/add", authMiddleware, addScrap);

router.delete("/delete/:id", authMiddleware, deleteScrap);

// Text search backed by MongoDB (works without the external service)
router.get("/search", searchScrap);

// Optional AI/semantic search proxy (external service at :8000, when available)
router.get("/semantic-search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const baseUrl = process.env.SEMANTIC_SEARCH_URL || "http://localhost:8000";
        const response = await axios.get(`${baseUrl}/search`, { params: { query } });

        res.json(response.data);
    } catch (error) {
        console.error("Error in semantic search:", error.message);
        res.status(500).json({ message: "Semantic search service unavailable" });
    }
});

export default router;
