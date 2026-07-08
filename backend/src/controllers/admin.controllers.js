import User from "../models/user.models.js";
import Scrap from "../models/scrap.models.js";
import Order from "../models/order.models.js";
import Dispute from "../models/dispute.models.js";
import { notify } from "../lib/notify.js";

export const listUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isVerified = true;
        user.kycDocuments = user.kycDocuments.map((d) => ({ ...d.toObject(), status: "approved" }));
        await user.save();

        await notify({
            recipient: user._id,
            type: "kyc",
            title: "KYC approved",
            body: "Your business has been verified. You now have a verified badge.",
            link: "/settings",
        });

        const safe = user.toObject();
        delete safe.password;
        res.status(200).json({ message: "User verified", user: safe });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const banUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "admin") return res.status(400).json({ message: "Cannot ban an admin" });

        user.banned = !user.banned;
        await user.save();
        res.status(200).json({ message: user.banned ? "User banned" : "User unbanned", banned: user.banned });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const listListings = async (req, res) => {
    try {
        const listings = await Scrap.find().populate("seller", "name email").sort({ createdAt: -1 });
        res.status(200).json({ listings });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const listOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("buyer", "name email")
            .populate("seller", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const listDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.find()
            .populate("raisedBy", "name email")
            .populate("participants", "name email")
            .populate("order", "finalPrice status")
            .sort({ createdAt: -1 });
        res.status(200).json({ disputes });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const resolveDispute = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const allowed = ["under_review", "resolved_buyer", "resolved_seller"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid dispute status" });
        }

        const dispute = await Dispute.findById(req.params.id);
        if (!dispute) return res.status(404).json({ message: "Dispute not found" });

        dispute.status = status;
        if (adminNotes !== undefined) dispute.adminNotes = adminNotes;
        await dispute.save();

        for (const p of dispute.participants) {
            await notify({
                recipient: p,
                type: "dispute",
                title: "Dispute updated",
                body: `An admin set your dispute to "${status}"`,
                link: `/orders/${dispute.order}`,
            });
        }

        res.status(200).json({ message: "Dispute updated", dispute });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const [users, listings, orders, openDisputes, gmvAgg] = await Promise.all([
            User.countDocuments(),
            Scrap.countDocuments(),
            Order.countDocuments(),
            Dispute.countDocuments({ status: { $in: ["open", "under_review"] } }),
            Order.aggregate([
                { $match: { status: { $in: ["paid", "pickup_scheduled", "in_transit", "delivered", "completed", "disputed"] } } },
                { $group: { _id: null, gmv: { $sum: "$finalPrice" }, count: { $sum: 1 } } },
            ]),
        ]);

        const { gmv = 0, count: paidOrders = 0 } = gmvAgg[0] || {};
        res.status(200).json({
            analytics: { users, listings, orders, paidOrders, gmv, openDisputes },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
