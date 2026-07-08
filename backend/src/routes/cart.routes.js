import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cart.controllers.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.delete("/clear", authMiddleware, clearCart);
router.delete("/:listingId", authMiddleware, removeFromCart);

export default router;
