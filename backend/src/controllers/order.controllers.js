import Order from "../models/order.models.js";
import { ORDER_STATUSES } from "../models/order.models.js";
import User from "../models/user.models.js";
import { notify } from "../lib/notify.js";
import { createRazorpayOrder, verifyRazorpaySignature, refundRazorpayPayment, isRazorpayConfigured } from "../lib/razorpay.js";
import { generateInvoicePdf } from "../lib/pdf.js";

const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || 2);
const feeFor = (amount) => Math.round(amount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;

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
        // Release escrow to the seller when the buyer confirms completion.
        if (status === "completed" && order.escrowStatus === "held") {
            order.escrowStatus = "released";
            order.timeline.push({ status: "paid", note: "Escrow released to seller" });
        }
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

// One-click payment (dev/simulated path). Marks paid, holds escrow, takes fee.
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

        const paymentId = req.body.paymentId || `pay_sim_${Date.now()}`;
        order.status = "paid";
        order.paymentId = paymentId;
        order.platformFee = feeFor(order.finalPrice);
        order.escrowStatus = "held";
        order.timeline.push({
            status: "paid",
            note: isRazorpayConfigured() ? "Paid via Razorpay (escrow held)" : "Simulated payment (escrow held)",
        });
        await order.save();

        await notify({
            recipient: order.seller,
            type: "order",
            title: "Payment received",
            body: `Payment received for order #${order._id.toString().slice(-6)} (held in escrow)`,
            link: `/orders/${order._id}`,
        });

        res.status(200).json({ message: "Payment successful", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Real Razorpay flow — step 1: create a Razorpay order for the buyer to pay.
export const createPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the buyer can pay for this order" });
        }
        if (order.status !== "payment_pending") {
            return res.status(400).json({ message: "Order is not awaiting payment" });
        }
        const rzp = await createRazorpayOrder(order.finalPrice, `order_${order._id}`);
        res.status(200).json({
            razorpayOrderId: rzp.id,
            amount: rzp.amount,
            currency: rzp.currency || "INR",
            keyId: process.env.RAZORPAY_KEY_ID || null,
            simulated: !!rzp.simulated,
        });
    } catch (error) {
        res.status(500).json({ message: "Payment init failed", error: error.message });
    }
};

// Real Razorpay flow — step 2: verify the signature and mark the order paid.
export const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the buyer can pay for this order" });
        }

        const valid = verifyRazorpaySignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
        if (!valid) return res.status(400).json({ message: "Payment verification failed" });

        order.status = "paid";
        order.paymentId = razorpayPaymentId || `pay_sim_${Date.now()}`;
        order.platformFee = feeFor(order.finalPrice);
        order.escrowStatus = "held";
        order.timeline.push({ status: "paid", note: "Paid via Razorpay (escrow held)" });
        await order.save();

        await notify({
            recipient: order.seller, type: "order", title: "Payment received",
            body: `Payment received for order #${order._id.toString().slice(-6)}`,
            link: `/orders/${order._id}`,
        });
        res.status(200).json({ message: "Payment verified", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Refund a paid/disputed order (seller or admin). Releases escrow as refunded.
export const refundOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const isSeller = order.seller.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        if (!isSeller && !isAdmin) {
            return res.status(403).json({ message: "Only the seller or an admin can refund" });
        }
        if (order.escrowStatus !== "held") {
            return res.status(400).json({ message: "No held payment to refund" });
        }

        const refund = await refundRazorpayPayment(order.paymentId, order.finalPrice);
        order.escrowStatus = "refunded";
        order.refundId = refund.id;
        order.status = "cancelled";
        order.timeline.push({ status: "cancelled", note: "Payment refunded to buyer" });
        await order.save();

        await notify({
            recipient: order.buyer, type: "order", title: "Refund processed",
            body: `Your payment for order #${order._id.toString().slice(-6)} was refunded`,
            link: `/orders/${order._id}`,
        });
        res.status(200).json({ message: "Refund processed", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Buyer's payments and seller's payouts (transaction history).
export const getTransactions = async (req, res) => {
    try {
        const uid = req.user._id;
        const orders = await Order.find({
            $or: [{ buyer: uid }, { seller: uid }],
            paymentId: { $exists: true, $ne: null },
        })
            .populate("buyer", "name")
            .populate("seller", "name")
            .populate("items.listing", "name")
            .sort({ updatedAt: -1 });

        const transactions = orders.map((o) => {
            const isSeller = o.seller._id.toString() === uid.toString();
            return {
                orderId: o._id,
                role: isSeller ? "payout" : "payment",
                counterparty: isSeller ? o.buyer?.name : o.seller?.name,
                amount: o.finalPrice,
                platformFee: o.platformFee,
                net: isSeller ? o.finalPrice - (o.platformFee || 0) : o.finalPrice,
                escrowStatus: o.escrowStatus,
                paymentId: o.paymentId,
                refundId: o.refundId,
                date: o.updatedAt,
            };
        });
        res.status(200).json({ transactions });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Generate (and cache) a GST invoice PDF as a data URL.
export const getInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("items.listing", "name");
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (!isParticipant(order, req.user._id)) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const [buyer, seller] = await Promise.all([
            User.findById(order.buyer).select("name email"),
            User.findById(order.seller).select("name email companyName gst"),
        ]);
        const invoiceUrl = await generateInvoicePdf(order, buyer, seller);
        order.invoiceUrl = invoiceUrl;
        await order.save();
        res.status(200).json({ invoiceUrl });
    } catch (error) {
        res.status(500).json({ message: "Invoice generation failed", error: error.message });
    }
};

// Seller records the actual weighed quantity at pickup.
export const verifyWeight = async (req, res) => {
    try {
        const { actualWeight } = req.body;
        if (actualWeight === undefined) return res.status(400).json({ message: "actualWeight is required" });

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the seller can record weight" });
        }
        order.actualWeight = Number(actualWeight);
        const listed = order.items?.[0]?.quantity;
        order.timeline.push({ status: order.status, note: `Weighed at pickup: ${actualWeight} (listed ${listed})` });
        await order.save();
        res.status(200).json({ message: "Weight recorded", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addDeliveryProof = async (req, res) => {
    try {
        const { images, signature } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the seller can upload delivery proof" });
        }
        if ((!Array.isArray(images) || images.length === 0) && !signature) {
            return res.status(400).json({ message: "images or a signature is required" });
        }

        if (Array.isArray(images) && images.length) order.deliveryProof.push(...images);
        if (signature) order.signature = signature;
        await order.save();
        res.status(200).json({ message: "Delivery proof added", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
