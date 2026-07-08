import Scrap from "../models/scrap.models.js";
import Order from "../models/order.models.js";
import Offer from "../models/offer.models.js";

const REVENUE_STATUSES = ["paid", "pickup_scheduled", "in_transit", "delivered", "completed", "disputed"];

// Real stats for the current user's dashboard (both buyer and seller views).
export const getMyAnalytics = async (req, res) => {
    try {
        const uid = req.user._id;

        const [
            activeListings, totalListings, sellerRevenueAgg, buyerSpendAgg,
            activeOrders, completedSales, tonsAgg, offersReceived, savingsAgg,
        ] = await Promise.all([
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
            Order.aggregate([
                { $match: { seller: uid, status: "completed" } },
                { $unwind: "$items" },
                { $group: { _id: null, tons: { $sum: "$items.quantity" } } },
            ]),
            Offer.countDocuments({ seller: uid }),
            Order.aggregate([
                { $match: { buyer: uid, status: { $in: REVENUE_STATUSES } } },
                { $unwind: "$items" },
                { $lookup: { from: "scraps", localField: "items.listing", foreignField: "_id", as: "l" } },
                { $unwind: { path: "$l", preserveNullAndEmptyArrays: true } },
                { $group: { _id: null, listPrice: { $sum: { $multiply: ["$items.quantity", { $ifNull: ["$l.price", 0] }] } }, paid: { $sum: "$items.totalPrice" } } },
            ]),
        ]);

        const { revenue = 0, count: sellerOrders = 0 } = sellerRevenueAgg[0] || {};
        const { spent = 0, count: buyerOrders = 0 } = buyerSpendAgg[0] || {};
        const tonsSold = tonsAgg[0]?.tons || 0;
        const conversionRate = offersReceived > 0 ? Math.round((sellerOrders / offersReceived) * 100) : 0;
        const savings = Math.max(0, Math.round(((savingsAgg[0]?.listPrice || 0) - (savingsAgg[0]?.paid || 0)) * 100) / 100);

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
                tonsSold,
                conversionRate,
                savings,
                rating: req.user.rating || { average: 0, count: 0 },
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
