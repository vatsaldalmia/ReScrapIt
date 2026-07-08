import mongoose from "mongoose";

export const NOTIFICATION_TYPES = ["message", "order", "offer", "review", "kyc", "dispute", "system"];

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        type: { type: String, enum: NOTIFICATION_TYPES, default: "system" },
        title: { type: String, required: true },
        body: { type: String, default: "" },
        link: { type: String, default: "" },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
