import SavedSearch from "../models/savedSearch.models.js";
import { notify } from "../lib/notify.js";

export const createSavedSearch = async (req, res) => {
    try {
        const { name, params } = req.body;
        const saved = await SavedSearch.create({ user: req.user._id, name: name || "Saved search", params: params || {} });
        res.status(201).json({ savedSearch: saved });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getSavedSearches = async (req, res) => {
    try {
        const searches = await SavedSearch.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ searches });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteSavedSearch = async (req, res) => {
    try {
        const saved = await SavedSearch.findOne({ _id: req.params.id, user: req.user._id });
        if (!saved) return res.status(404).json({ message: "Saved search not found" });
        await saved.deleteOne();
        res.status(200).json({ message: "Saved search removed" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Does a listing match a saved search's params?
const listingMatches = (listing, params = {}) => {
    if (params.category && listing.category !== params.category) return false;
    if (params.city && !(listing.location?.city || "").toLowerCase().includes(String(params.city).toLowerCase())) return false;
    if (params.minPrice && Number(listing.price) < Number(params.minPrice)) return false;
    if (params.maxPrice && Number(listing.price) > Number(params.maxPrice)) return false;
    if (params.q) {
        const hay = `${listing.name} ${listing.description}`.toLowerCase();
        if (!hay.includes(String(params.q).toLowerCase())) return false;
    }
    return true;
};

// Called when a new listing is created — alert subscribers whose search matches.
export const alertSavedSearches = async (listing) => {
    try {
        const searches = await SavedSearch.find({ alertsEnabled: true, user: { $ne: listing.seller } });
        for (const s of searches) {
            if (listingMatches(listing, s.params)) {
                await notify({
                    recipient: s.user,
                    type: "system",
                    title: "New listing matches your saved search",
                    body: `"${listing.name}" matches "${s.name}"`,
                    link: `/listing/${listing._id}`,
                });
                s.lastAlertedAt = new Date();
                await s.save();
            }
        }
    } catch (error) {
        console.error("Saved-search alert failed:", error.message);
    }
};
