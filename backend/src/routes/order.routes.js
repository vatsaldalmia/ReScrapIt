import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
    getMyOrders, getSellerOrders, getOrderById,
    updateOrderStatus, payOrder, addDeliveryProof,
} from "../controllers/order.controllers.js";

const router = express.Router();

router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/seller-orders", authMiddleware, getSellerOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, updateOrderStatus);
router.post("/:id/pay", authMiddleware, payOrder);
router.post("/:id/delivery-proof", authMiddleware, addDeliveryProof);

export default router;
