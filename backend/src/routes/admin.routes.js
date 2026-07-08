import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";
import {
    listUsers, verifyUser, banUser,
    listListings, listOrders,
    listDisputes, resolveDispute, getAnalytics,
} from "../controllers/admin.controllers.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", listUsers);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/ban", banUser);
router.get("/listings", listListings);
router.get("/orders", listOrders);
router.get("/disputes", listDisputes);
router.put("/disputes/:id/resolve", resolveDispute);
router.get("/analytics", getAnalytics);

export default router;
