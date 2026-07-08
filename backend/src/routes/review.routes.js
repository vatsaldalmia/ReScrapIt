import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
    createReview, getSellerReviews, getListingReviews, respondReview, toggleHelpful,
} from "../controllers/review.controllers.js";

const router = express.Router();

router.post("/", authMiddleware, createReview);
router.get("/seller/:sellerId", getSellerReviews);
router.get("/listing/:listingId", getListingReviews);
router.put("/:id/respond", authMiddleware, respondReview);
router.post("/:id/helpful", authMiddleware, toggleHelpful);

export default router;
