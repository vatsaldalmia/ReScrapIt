import mongoose from "mongoose";

export const DISPUTE_STATUSES = ["open", "under_review", "resolved_buyer", "resolved_seller"];

const disputeSchema = new mongoose.Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user", index: true }],
        reason: { type: String, required: true },
        description: { type: String, default: "" },
        evidence: { type: [String], default: [] },
        status: { type: String, enum: DISPUTE_STATUSES, default: "open", index: true },
        adminNotes: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("Dispute", disputeSchema);
