import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { getWishlist, toggleWishlist } from "../controllers/wishlist.controllers.js";

const router = express.Router();

router.get("/", authMiddleware, getWishlist);
router.post("/toggle", authMiddleware, toggleWishlist);

export default router;
