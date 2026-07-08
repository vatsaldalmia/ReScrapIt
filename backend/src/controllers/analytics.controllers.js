import Scrap from "../models/scrap.models.js";
import Order from "../models/order.models.js";

const REVENUE_STATUSES = ["paid", "pickup_scheduled", "in_transit", "delivered", "completed", "disputed"];

// Real stats for the current user's dashboard (both buyer and seller views).
export const getMyAnalytics = async (req, res) => {
    try {
        const uid = req.user._id;

        const [activeListings, totalListings, sellerRevenueAgg, buyerSpendAgg, activeOrders, completedSales] = await Promise.all([
            Scrap.countDocuments({ seller: uid, status: "active" }),
            Scrap.countDocuments({ seller: uid }),
            Order.aggregate([
                { $match: { seller: uid, status: { $in: REVENUE_STATUSES } } },
                { $group: { _id: null, revenue: { $sum: "$finalPrice" }, count: { $sum: 1 } } },
            ]),
            Order.aggregate([
                { $match: { buyer: uid, status: { $in: REVENUE_STATUSES } } },
                { $group: { _id: null, spent: { $sum: "$finalPrice" }, count: { $sum: 1 } } },
            ]),
            Order.countDocuments({
                $or: [{ buyer: uid }, { seller: uid }],
                status: { $in: ["payment_pending", "paid", "pickup_scheduled", "in_transit", "delivered"] },
            }),
            Order.countDocuments({ seller: uid, status: "completed" }),
        ]);

        const { revenue = 0, count: sellerOrders = 0 } = sellerRevenueAgg[0] || {};
        const { spent = 0, count: buyerOrders = 0 } = buyerSpendAgg[0] || {};

        res.status(200).json({
            analytics: {
                activeListings,
                totalListings,
                revenue,
                sellerOrders,
                completedSales,
                spent,
                buyerOrders,
                activeOrders,
                rating: req.user.rating || { average: 0, count: 0 },
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
