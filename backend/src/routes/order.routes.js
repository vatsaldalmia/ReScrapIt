import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
    getMyOrders, getSellerOrders, getOrderById,
    updateOrderStatus, payOrder, addDeliveryProof,
    createPayment, verifyPayment, refundOrder,
    getTransactions, getInvoice, verifyWeight,
} from "../controllers/order.controllers.js";

const router = express.Router();

router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/seller-orders", authMiddleware, getSellerOrders);
router.get("/transactions", authMiddleware, getTransactions);
router.get("/:id", authMiddleware, getOrderById);
router.get("/:id/invoice", authMiddleware, getInvoice);
router.put("/:id/status", authMiddleware, updateOrderStatus);
router.post("/:id/pay", authMiddleware, payOrder);
router.post("/:id/pay/create", authMiddleware, createPayment);
router.post("/:id/pay/verify", authMiddleware, verifyPayment);
router.post("/:id/refund", authMiddleware, refundOrder);
router.post("/:id/weight", authMiddleware, verifyWeight);
router.post("/:id/delivery-proof", authMiddleware, addDeliveryProof);

export default router;
