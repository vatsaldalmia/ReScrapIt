import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
    createOffer, getMyOffers, respondOffer, confirmOffer,
} from "../controllers/offer.controllers.js";

const router = express.Router();

router.post("/", authMiddleware, createOffer);
router.get("/", authMiddleware, getMyOffers);
router.put("/:id/respond", authMiddleware, respondOffer);
router.post("/:id/confirm", authMiddleware, confirmOffer);

export default router;
