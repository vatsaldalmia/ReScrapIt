import Cart from "../models/cart.models.js";

const getOrCreate = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return cart;
};

export const getCart = async (req, res) => {
    try {
        const cart = await getOrCreate(req.user._id);
        await cart.populate("items.listing", "name images price priceUnit quantity seller");
        res.status(200).json({ cart });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { listingId, quantity } = req.body;
        if (!listingId) return res.status(400).json({ message: "listingId is required" });

        const cart = await getOrCreate(req.user._id);
        const existing = cart.items.find((i) => i.listing.toString() === listingId.toString());
        if (existing) {
            existing.quantity = Number(quantity) || existing.quantity;
        } else {
            cart.items.push({ listing: listingId, quantity: Number(quantity) || 1 });
        }
        await cart.save();
        await cart.populate("items.listing", "name images price priceUnit quantity seller");
        res.status(200).json({ cart });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { listingId } = req.params;
        const cart = await getOrCreate(req.user._id);
        cart.items = cart.items.filter((i) => i.listing.toString() !== listingId.toString());
        await cart.save();
        await cart.populate("items.listing", "name images price priceUnit quantity seller");
        res.status(200).json({ cart });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await getOrCreate(req.user._id);
        cart.items = [];
        await cart.save();
        res.status(200).json({ cart });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
