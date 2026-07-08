import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";
import {
    listUsers, verifyUser, banUser,
    listListings, listOrders,
    listDisputes, resolveDispute, getAnalytics,
    moderateListing, moderateReview, listReports, resolveReport,
} from "../controllers/admin.controllers.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", listUsers);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/ban", banUser);
router.get("/listings", listListings);
router.put("/listings/:id/moderate", moderateListing);
router.get("/orders", listOrders);
router.get("/disputes", listDisputes);
router.put("/disputes/:id/resolve", resolveDispute);
router.put("/reviews/:id/moderate", moderateReview);
router.get("/reports", listReports);
router.put("/reports/:id/resolve", resolveReport);
router.get("/analytics", getAnalytics);

export default router;
