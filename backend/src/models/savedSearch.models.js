import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        name: { type: String, default: "Saved search" },
        params: { type: mongoose.Schema.Types.Mixed, default: {} },
        alertsEnabled: { type: Boolean, default: true },
        lastAlertedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model("SavedSearch", savedSearchSchema);
