import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "Scrap" },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, default: "" },
        images: { type: [String], default: [] },
        sellerResponse: {
            text: { type: String },
            createdAt: { type: Date },
        },
        helpful: { type: Number, default: 0 },
        helpfulVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        hidden: { type: Boolean, default: false },
        reported: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// One review per order.
reviewSchema.index({ order: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
