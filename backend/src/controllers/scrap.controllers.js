import mongoose from "mongoose";
import Scrap from "../models/scrap.models.js";
import { SCRAP_CATEGORIES, PRICE_UNITS, SCRAP_STATUSES } from "../models/scrap.models.js";
import { alertSavedSearches } from "./savedSearch.controllers.js";

export const addScrap = async (req, res) => {
    try {
        const {
            name, description, images, quantity,
            price, priceUnit, category, location, moq, specifications, status,
        } = req.body;
        const seller = req.user._id;

        if (!name || !description || quantity === undefined || quantity === null) {
            return res.status(400).json({ message: "name, description and quantity are required" });
        }
        if (category && !SCRAP_CATEGORIES.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }
        if (priceUnit && !PRICE_UNITS.includes(priceUnit)) {
            return res.status(400).json({ message: "Invalid priceUnit" });
        }
        if (status && !SCRAP_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const newScrap = new Scrap({
            name,
            description,
            images: images || [],
            quantity,
            price,
            priceUnit,
            category,
            location,
            moq,
            specifications,
            status,
            seller,
        });
        await newScrap.save();

        // Fire saved-search alerts for matching subscribers (non-blocking).
        alertSavedSearches(newScrap);

        res.status(201).json({ message: "Product added successfully", scrap: newScrap });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteScrap = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const scrap = await Scrap.findById(id);

        if (!scrap) {
            return res.status(404).json({ message: "Scrap product not found" });
        }

        if (scrap.seller.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized: Only the seller can delete this product" });
        }

        await Scrap.findByIdAndDelete(id);

        res.status(200).json({ message: "Scrap product deleted successfully" });
    } catch (error) {
        console.error("Error deleting scrap:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateScrap = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const scrap = await Scrap.findById(id);
        if (!scrap) {
            return res.status(404).json({ message: "Scrap product not found" });
        }
        if (scrap.seller.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized: Only the seller can edit this product" });
        }

        const editable = [
            "name", "description", "images", "quantity",
            "price", "priceUnit", "category", "location", "moq", "specifications", "status",
        ];
        for (const key of editable) {
            if (req.body[key] !== undefined) scrap[key] = req.body[key];
        }

        if (scrap.category && !SCRAP_CATEGORIES.includes(scrap.category)) {
            return res.status(400).json({ message: "Invalid category" });
        }
        if (scrap.priceUnit && !PRICE_UNITS.includes(scrap.priceUnit)) {
            return res.status(400).json({ message: "Invalid priceUnit" });
        }
        if (scrap.status && !SCRAP_STATUSES.includes(scrap.status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await scrap.save();
        res.status(200).json({ message: "Product updated successfully", scrap });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Browse listings with filters, sorting and pagination (aggregation-based so we
// can filter/sort by the seller's rating too).
export const getScraps = async (req, res) => {
    try {
        const {
            q, category, city, state, status,
            minPrice, maxPrice, minQuantity, minRating, seller, featured,
            sort = "newest", page = 1, limit = 20,
        } = req.query;

        const match = {};
        match.status = status || "active";
        match.moderationStatus = { $ne: "rejected" };
        if (category) match.category = category;
        if (seller) match.seller = new mongoose.Types.ObjectId(seller);
        if (featured === "true") match.featured = true;
        if (city) match["location.city"] = { $regex: city, $options: "i" };
        if (state) match["location.state"] = { $regex: state, $options: "i" };
        if (q) {
            match.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
            ];
        }
        if (minPrice || maxPrice) {
            match.price = {};
            if (minPrice) match.price.$gte = Number(minPrice);
            if (maxPrice) match.price.$lte = Number(maxPrice);
        }
        if (minQuantity) match.quantity = { $gte: Number(minQuantity) };

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            rating: { sellerRating: -1, createdAt: -1 },
        };
        const sortBy = sortMap[sort] || sortMap.newest;

        const pageNum = Math.max(1, Number(page));
        const perPage = Math.min(100, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * perPage;

        const pipeline = [
            { $match: match },
            { $lookup: { from: "users", localField: "seller", foreignField: "_id", as: "sellerDoc" } },
            { $unwind: { path: "$sellerDoc", preserveNullAndEmptyArrays: true } },
            { $addFields: { sellerRating: { $ifNull: ["$sellerDoc.rating.average", 0] } } },
        ];
        if (minRating) pipeline.push({ $match: { sellerRating: { $gte: Number(minRating) } } });
        pipeline.push({
            $addFields: {
                seller: {
                    _id: "$sellerDoc._id", name: "$sellerDoc.name", email: "$sellerDoc.email",
                    rating: "$sellerDoc.rating", isVerified: "$sellerDoc.isVerified",
                },
            },
        });
        pipeline.push({ $project: { sellerDoc: 0 } });
        pipeline.push({
            $facet: {
                items: [{ $sort: sortBy }, { $skip: skip }, { $limit: perPage }],
                totalArr: [{ $count: "count" }],
            },
        });

        const [result] = await Scrap.aggregate(pipeline);
        const items = result?.items || [];
        const total = result?.totalArr?.[0]?.count || 0;

        res.status(200).json({
            scraps: items,
            pagination: { total, page: pageNum, limit: perPage, pages: Math.ceil(total / perPage) },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Featured listings for the homepage/browse hero.
export const getFeatured = async (req, res) => {
    try {
        const scraps = await Scrap.find({ status: "active", featured: true, moderationStatus: { $ne: "rejected" } })
            .populate("seller", "name rating isVerified")
            .sort({ createdAt: -1 })
            .limit(8);
        res.status(200).json({ scraps });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Trending: active listings with the most offers, then most recent.
export const getTrending = async (req, res) => {
    try {
        const scraps = await Scrap.aggregate([
            { $match: { status: "active", moderationStatus: { $ne: "rejected" } } },
            { $lookup: { from: "offers", localField: "_id", foreignField: "listing", as: "offers" } },
            { $addFields: { offerCount: { $size: "$offers" } } },
            { $sort: { featured: -1, offerCount: -1, createdAt: -1 } },
            { $limit: 8 },
            { $lookup: { from: "users", localField: "seller", foreignField: "_id", as: "sellerDoc" } },
            { $unwind: { path: "$sellerDoc", preserveNullAndEmptyArrays: true } },
            { $addFields: { seller: { _id: "$sellerDoc._id", name: "$sellerDoc.name", rating: "$sellerDoc.rating", isVerified: "$sellerDoc.isVerified" } } },
            { $project: { offers: 0, sellerDoc: 0 } },
        ]);
        res.status(200).json({ scraps });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getScrapById = async (req, res) => {
    try {
        const scrap = await Scrap.findById(req.params.id).populate("seller", "name email createdAt rating isVerified companyName");
        if (!scrap) {
            return res.status(404).json({ message: "Listing not found" });
        }
        res.status(200).json({ scrap });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMyListings = async (req, res) => {
    try {
        const scraps = await Scrap.find({ seller: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ scraps });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getSellerListings = async (req, res) => {
    try {
        const scraps = await Scrap.find({ seller: req.params.sellerId, status: "active" })
            .sort({ createdAt: -1 });
        res.status(200).json({ scraps });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const searchScrap = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const scraps = await Scrap.find({
            $or: [
                { name: { $regex: query, $options: "i" } }, 
                { description: { $regex: query, $options: "i" } }
            ]
        })
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ scraps });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
