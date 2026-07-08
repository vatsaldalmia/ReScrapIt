import mongoose from "mongoose";

export const REPORT_TARGETS = ["listing", "user", "review"];
export const REPORT_STATUSES = ["open", "reviewed", "actioned", "dismissed"];

const reportSchema = new mongoose.Schema(
    {
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        targetType: { type: String, enum: REPORT_TARGETS, required: true },
        targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
        reason: { type: String, required: true },
        description: { type: String, default: "" },
        status: { type: String, enum: REPORT_STATUSES, default: "open", index: true },
        adminNotes: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
