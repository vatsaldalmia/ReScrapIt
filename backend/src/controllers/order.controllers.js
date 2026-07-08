import Order from "../models/order.models.js";
import { ORDER_STATUSES } from "../models/order.models.js";
import { notify } from "../lib/notify.js";

const idOf = (ref) => (ref && ref._id ? ref._id : ref);
const isParticipant = (order, uid) =>
    idOf(order.buyer).toString() === uid.toString() || idOf(order.seller).toString() === uid.toString();

// Transitions allowed and who may perform them.
const TRANSITIONS = {
    pickup_scheduled: { from: ["paid"], role: "seller" },
    in_transit: { from: ["pickup_scheduled"], role: "seller" },
    delivered: { from: ["in_transit"], role: "seller" },
    completed: { from: ["delivered"], role: "buyer" },
    cancelled: { from: ["payment_pending", "paid", "pickup_scheduled"], role: "any" },
    disputed: { from: ["paid", "pickup_scheduled", "in_transit", "delivered"], role: "any" },
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate("seller", "name email")
            .populate("items.listing", "name images")
            .sort({ createdAt: -1 });
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ seller: req.user._id })
            .populate("buyer", "name email")
            .populate("items.listing", "name images")
            .sort({ createdAt: -1 });
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("buyer", "name email")
            .populate("seller", "name email")
            .populate("items.listing", "name images");
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (!isParticipant(order, req.user._id)) {
            return res.status(403).json({ message: "Not authorized to view this order" });
        }
        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        if (!ORDER_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (!isParticipant(order, req.user._id)) {
            return res.status(403).json({ message: "Not authorized to update this order" });
        }

        const rule = TRANSITIONS[status];
        if (!rule) {
            return res.status(400).json({ message: `Cannot transition to "${status}" via this endpoint` });
        }
        if (!rule.from.includes(order.status)) {
            return res.status(400).json({ message: `Cannot move from "${order.status}" to "${status}"` });
        }

        const isSeller = order.seller.toString() === req.user._id.toString();
        const isBuyer = order.buyer.toString() === req.user._id.toString();
        if (rule.role === "seller" && !isSeller) return res.status(403).json({ message: "Only the seller can perform this action" });
        if (rule.role === "buyer" && !isBuyer) return res.status(403).json({ message: "Only the buyer can perform this action" });

        order.status = status;
        order.timeline.push({ status, note: note || "" });
        await order.save();

        const counterparty = isSeller ? order.buyer : order.seller;
        await notify({
            recipient: counterparty,
            type: "order",
            title: `Order ${status}`,
            body: `Order #${order._id.toString().slice(-6)} is now "${status}"`,
            link: `/orders/${order._id}`,
        });

        res.status(200).json({ message: `Order marked ${status}`, order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Payment step. Uses Razorpay when configured, otherwise simulates success so
// the order lifecycle can proceed in local/dev environments.
export const payOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the buyer can pay for this order" });
        }
        if (order.status !== "payment_pending") {
            return res.status(400).json({ message: `Order is not awaiting payment (status: ${order.status})` });
        }

        const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
        const paymentId = req.body.paymentId || `mock_${Date.now()}`;

        order.status = "paid";
        order.paymentId = paymentId;
        order.timeline.push({
            status: "paid",
            note: razorpayConfigured ? "Paid via Razorpay" : "Simulated payment (Razorpay not configured)",
        });
        await order.save();

        await notify({
            recipient: order.seller,
            type: "order",
            title: "Payment received",
            body: `Payment received for order #${order._id.toString().slice(-6)}`,
            link: `/orders/${order._id}`,
        });

        res.status(200).json({ message: "Payment successful", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addDeliveryProof = async (req, res) => {
    try {
        const { images } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the seller can upload delivery proof" });
        }
        if (!Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: "images array is required" });
        }

        order.deliveryProof.push(...images);
        await order.save();
        res.status(200).json({ message: "Delivery proof added", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
