import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, unique: true, index: true },
        listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scrap" }],
    },
    { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);
