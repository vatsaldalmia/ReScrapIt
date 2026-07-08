import Wishlist from "../models/wishlist.models.js";

const getOrCreate = async (userId) => {
    let wl = await Wishlist.findOne({ user: userId });
    if (!wl) wl = await Wishlist.create({ user: userId, listings: [] });
    return wl;
};

export const getWishlist = async (req, res) => {
    try {
        const wl = await getOrCreate(req.user._id);
        await wl.populate("listings", "name images price priceUnit quantity category location");
        res.status(200).json({ wishlist: wl });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Toggle a listing in the wishlist.
export const toggleWishlist = async (req, res) => {
    try {
        const { listingId } = req.body;
        if (!listingId) return res.status(400).json({ message: "listingId is required" });

        const wl = await getOrCreate(req.user._id);
        const exists = wl.listings.some((l) => l.toString() === listingId.toString());
        if (exists) {
            wl.listings = wl.listings.filter((l) => l.toString() !== listingId.toString());
        } else {
            wl.listings.push(listingId);
        }
        await wl.save();
        res.status(200).json({ inWishlist: !exists, count: wl.listings.length });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
