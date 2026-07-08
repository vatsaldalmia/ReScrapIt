import Review from "../models/review.models.js";
import Order from "../models/order.models.js";
import User from "../models/user.models.js";
import { notify } from "../lib/notify.js";

const recomputeSellerRating = async (sellerId) => {
    const agg = await Review.aggregate([
        { $match: { seller: sellerId } },
        { $group: { _id: "$seller", average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const { average = 0, count = 0 } = agg[0] || {};
    await User.findByIdAndUpdate(sellerId, {
        rating: { average: Math.round(average * 10) / 10, count },
    });
};

// Buyer leaves a review after an order is completed.
export const createReview = async (req, res) => {
    try {
        const { orderId, rating, text, images } = req.body;
        if (!orderId || !rating) {
            return res.status(400).json({ message: "orderId and rating are required" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "rating must be between 1 and 5" });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the buyer can review this order" });
        }
        if (order.status !== "completed") {
            return res.status(400).json({ message: "You can only review completed orders" });
        }
        if (order.reviewed) {
            return res.status(400).json({ message: "This order has already been reviewed" });
        }

        const review = await Review.create({
            reviewer: req.user._id,
            seller: order.seller,
            listing: order.items[0]?.listing,
            order: order._id,
            rating,
            text: text || "",
            images: images || [],
        });

        order.reviewed = true;
        order.timeline.push({ status: "reviewed", note: "Buyer left a review" });
        await order.save();

        await recomputeSellerRating(order.seller);

        await notify({
            recipient: order.seller,
            type: "review",
            title: "New review received",
            body: `${req.user.name} left you a ${rating}-star review`,
            link: `/seller/${order.seller}`,
        });

        res.status(201).json({ message: "Review submitted", review });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "This order has already been reviewed" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getSellerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ seller: req.params.sellerId })
            .populate("reviewer", "name")
            .populate("listing", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getListingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ listing: req.params.listingId })
            .populate("reviewer", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Seller responds to a review.
export const respondReview = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Response text is required" });

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });
        if (review.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the seller can respond to this review" });
        }

        review.sellerResponse = { text, createdAt: new Date() };
        await review.save();
        res.status(200).json({ message: "Response added", review });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
