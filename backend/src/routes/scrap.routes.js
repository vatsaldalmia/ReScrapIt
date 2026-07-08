import express from "express";
import axios from "axios";
import {
    addScrap, deleteScrap, updateScrap, searchScrap,
    getScraps, getScrapById, getMyListings, getSellerListings,
    getFeatured, getTrending,
} from "../controllers/scrap.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Browse all active listings (public, paginated + filtered)
router.get("/", getScraps);

// Featured & trending (public) — must precede "/:id"
router.get("/featured", getFeatured);
router.get("/trending", getTrending);

// Create a listing
router.post("/add", authMiddleware, addScrap);

// Seller's own inventory (must precede "/:id")
router.get("/my-listings", authMiddleware, getMyListings);

// A specific seller's public listings
router.get("/seller/:sellerId", getSellerListings);

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

// Listing detail (public) — keep dynamic ":id" routes last
router.get("/:id", getScrapById);

// Update a listing (owner only)
router.put("/:id", authMiddleware, updateScrap);

// Delete a listing (owner only)
router.delete("/delete/:id", authMiddleware, deleteScrap);

export default router;
