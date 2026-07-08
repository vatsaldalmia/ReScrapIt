import mongoose from "mongoose";

export const OFFER_STATUSES = ["pending", "accepted", "rejected", "countered", "confirmed"];

const offerSchema = new mongoose.Schema(
    {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "Scrap", required: true },
        offeredPrice: { type: Number, required: true, min: 0 },
        offeredQuantity: { type: Number, required: true, min: 0 },
        message: { type: String, default: "" },
        status: { type: String, enum: OFFER_STATUSES, default: "pending", index: true },
        counterPrice: { type: Number },
        expiresAt: { type: Date },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
    { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
