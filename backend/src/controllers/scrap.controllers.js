import Scrap from "../models/scrap.models.js";

export const addScrap = async (req, res) => {
    try {
        const { name, description, images } = req.body;
        const seller = req.user._id;
        if (!name || !description || !images || images.length === 0) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newScrap = new Scrap({ name, description, images, seller });
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
        res.status(500).json({ message: "You aren't the owner of the product", error: error.message });
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
        });

        res.status(200).json({ scraps });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
