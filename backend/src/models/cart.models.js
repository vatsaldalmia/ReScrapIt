import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
    {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "Scrap", required: true },
        quantity: { type: Number, default: 1, min: 0 },
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, unique: true, index: true },
        items: { type: [cartItemSchema], default: [] },
    },
    { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
