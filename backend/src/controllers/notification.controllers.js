import Notification from "../models/notification.models.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        const unread = await Notification.countDocuments({ recipient: req.user._id, read: false });
        res.status(200).json({ notifications, unread });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const markRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        notification.read = true;
        await notification.save();
        res.status(200).json({ notification });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.status(200).json({ message: "All notifications marked read" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
