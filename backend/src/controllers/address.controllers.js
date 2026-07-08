import Address from "../models/address.models.js";

export const listAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json({ addresses });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addAddress = async (req, res) => {
    try {
        const { label, city, state, pincode, address, isDefault } = req.body;
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const created = await Address.create({
            user: req.user._id, label, city, state, pincode, address, isDefault: !!isDefault,
        });
        res.status(201).json({ address: created });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const addr = await Address.findOne({ _id: req.params.id, user: req.user._id });
        if (!addr) return res.status(404).json({ message: "Address not found" });

        if (req.body.isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }
        for (const key of ["label", "city", "state", "pincode", "address", "isDefault"]) {
            if (req.body[key] !== undefined) addr[key] = req.body[key];
        }
        await addr.save();
        res.status(200).json({ address: addr });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const addr = await Address.findOne({ _id: req.params.id, user: req.user._id });
        if (!addr) return res.status(404).json({ message: "Address not found" });
        await addr.deleteOne();
        res.status(200).json({ message: "Address removed" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
