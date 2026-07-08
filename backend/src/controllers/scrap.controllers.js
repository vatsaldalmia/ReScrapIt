import Scrap from "../models/scrap.models.js";
import { SCRAP_CATEGORIES, PRICE_UNITS, SCRAP_STATUSES } from "../models/scrap.models.js";

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

// Browse listings with filters, sorting and pagination.
export const getScraps = async (req, res) => {
    try {
        const {
            q, category, city, state, status,
            minPrice, maxPrice, seller,
            sort = "newest", page = 1, limit = 20,
        } = req.query;

        const filter = {};
        // Default to active listings for public browse unless a status is specified.
        filter.status = status || "active";
        if (category) filter.category = category;
        if (seller) filter.seller = seller;
        if (city) filter["location.city"] = { $regex: city, $options: "i" };
        if (state) filter["location.state"] = { $regex: state, $options: "i" };
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
            ];
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
        };
        const sortBy = sortMap[sort] || sortMap.newest;

        const pageNum = Math.max(1, Number(page));
        const perPage = Math.min(100, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * perPage;

        const [items, total] = await Promise.all([
            Scrap.find(filter)
                .populate("seller", "name email")
                .sort(sortBy)
                .skip(skip)
                .limit(perPage),
            Scrap.countDocuments(filter),
        ]);

        res.status(200).json({
            scraps: items,
            pagination: {
                total,
                page: pageNum,
                limit: perPage,
                pages: Math.ceil(total / perPage),
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getScrapById = async (req, res) => {
    try {
        const scrap = await Scrap.findById(req.params.id).populate("seller", "name email createdAt rating");
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
