import Offer from "../models/offer.models.js";
import Order from "../models/order.models.js";
import Scrap from "../models/scrap.models.js";

// Buyer creates an offer / quote request on a listing.
export const createOffer = async (req, res) => {
    try {
        const { listingId, offeredPrice, offeredQuantity, message } = req.body;
        if (!listingId || offeredPrice === undefined || offeredQuantity === undefined) {
            return res.status(400).json({ message: "listingId, offeredPrice and offeredQuantity are required" });
        }

        const listing = await Scrap.findById(listingId);
        if (!listing) return res.status(404).json({ message: "Listing not found" });
        if (listing.seller.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot make an offer on your own listing" });
        }

        const offer = await Offer.create({
            buyer: req.user._id,
            seller: listing.seller,
            listing: listing._id,
            offeredPrice,
            offeredQuantity,
            message: message || "",
        });

        res.status(201).json({ message: "Offer sent", offer });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Offers relevant to the current user, split by role.
export const getMyOffers = async (req, res) => {
    try {
        const uid = req.user._id;
        const [asBuyer, asSeller] = await Promise.all([
            Offer.find({ buyer: uid }).populate("listing", "name images").populate("seller", "name email").sort({ createdAt: -1 }),
            Offer.find({ seller: uid }).populate("listing", "name images").populate("buyer", "name email").sort({ createdAt: -1 }),
        ]);
        res.status(200).json({ asBuyer, asSeller });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Seller responds to an offer: accept, reject or counter.
export const respondOffer = async (req, res) => {
    try {
        const { action, counterPrice } = req.body;
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: "Offer not found" });
        if (offer.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the seller can respond to this offer" });
        }
        if (!["pending", "countered"].includes(offer.status)) {
            return res.status(400).json({ message: `Offer cannot be updated from status "${offer.status}"` });
        }

        if (action === "accept") {
            offer.status = "accepted";
        } else if (action === "reject") {
            offer.status = "rejected";
        } else if (action === "counter") {
            if (counterPrice === undefined) return res.status(400).json({ message: "counterPrice is required for a counter" });
            offer.status = "countered";
            offer.counterPrice = counterPrice;
        } else {
            return res.status(400).json({ message: "action must be accept, reject or counter" });
        }

        await offer.save();
        res.status(200).json({ message: `Offer ${offer.status}`, offer });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Buyer confirms an accepted/countered offer, creating an Order.
export const confirmOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: "Offer not found" });
        if (offer.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the buyer can confirm this offer" });
        }
        if (!["accepted", "countered"].includes(offer.status)) {
            return res.status(400).json({ message: "Only an accepted or countered offer can be confirmed" });
        }
        if (offer.order) {
            return res.status(400).json({ message: "This offer already has an order" });
        }

        const unitPrice = offer.status === "countered" ? offer.counterPrice : offer.offeredPrice;
        const quantity = offer.offeredQuantity;
        const total = unitPrice * quantity;

        const order = await Order.create({
            buyer: offer.buyer,
            seller: offer.seller,
            offer: offer._id,
            items: [{ listing: offer.listing, quantity, unitPrice, totalPrice: total }],
            status: "payment_pending",
            offeredPrice: offer.offeredPrice,
            finalPrice: total,
            timeline: [{ status: "payment_pending", note: "Order created from confirmed offer" }],
        });

        offer.status = "confirmed";
        offer.order = order._id;
        await offer.save();

        res.status(201).json({ message: "Order created", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
