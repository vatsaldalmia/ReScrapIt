import Dispute from "../models/dispute.models.js";
import Order from "../models/order.models.js";
import { notify } from "../lib/notify.js";

const isParticipant = (order, uid) =>
    order.buyer.toString() === uid.toString() || order.seller.toString() === uid.toString();

// A buyer or seller raises a dispute on an order.
export const raiseDispute = async (req, res) => {
    try {
        const { orderId, reason, description, evidence } = req.body;
        if (!orderId || !reason) {
            return res.status(400).json({ message: "orderId and reason are required" });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (!isParticipant(order, req.user._id)) {
            return res.status(403).json({ message: "Only order participants can raise a dispute" });
        }

        const existing = await Dispute.findOne({ order: orderId, status: { $in: ["open", "under_review"] } });
        if (existing) {
            return res.status(400).json({ message: "An open dispute already exists for this order" });
        }

        const dispute = await Dispute.create({
            order: order._id,
            raisedBy: req.user._id,
            participants: [order.buyer, order.seller],
            reason,
            description: description || "",
            evidence: evidence || [],
        });

        // Flag the order as disputed if the lifecycle allows.
        if (!["completed", "cancelled"].includes(order.status)) {
            order.status = "disputed";
            order.timeline.push({ status: "disputed", note: reason });
            await order.save();
        }

        const other = order.buyer.toString() === req.user._id.toString() ? order.seller : order.buyer;
        await notify({
            recipient: other,
            type: "dispute",
            title: "Dispute raised",
            body: `A dispute was raised on order #${order._id.toString().slice(-6)}: ${reason}`,
            link: `/orders/${order._id}`,
        });

        res.status(201).json({ message: "Dispute raised", dispute });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMyDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.find({ participants: req.user._id })
            .populate("order", "finalPrice status")
            .populate("raisedBy", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ disputes });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
