import Notification from "../models/notification.models.js";

// Fire-and-forget notification creation. Never throws into the caller's flow.
export const notify = async ({ recipient, type, title, body, link }) => {
    try {
        if (!recipient) return null;
        return await Notification.create({ recipient, type, title, body: body || "", link: link || "" });
    } catch (error) {
        console.error("Failed to create notification:", error.message);
        return null;
    }
};
