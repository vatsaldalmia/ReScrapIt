import mongoose from "mongoose";

export const SCRAP_CATEGORIES = ["metal", "plastic", "e_waste", "paper", "glass", "chemical", "other"];
export const PRICE_UNITS = ["per_kg", "per_ton", "per_lot", "negotiable"];
export const SCRAP_STATUSES = ["active", "paused", "sold", "expired"];

const scrapSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: [
            {
                type: String,
            }
        ],
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            default: 0,
            min: 0,
        },
        priceUnit: {
            type: String,
            enum: PRICE_UNITS,
            default: "negotiable",
        },
        category: {
            type: String,
            enum: SCRAP_CATEGORIES,
            default: "other",
            index: true,
        },
        location: {
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pincode: { type: String, default: "" },
            address: { type: String, default: "" },
        },
        status: {
            type: String,
            enum: SCRAP_STATUSES,
            default: "active",
            index: true,
        },
        moq: {
            type: Number,
            default: 1,
            min: 0,
        },
        specifications: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        featured: {
            type: Boolean,
            default: false,
            index: true,
        },
        moderationStatus: {
            type: String,
            enum: ["approved", "pending", "rejected"],
            default: "approved",
            index: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            index: true,
        }
    },
    { timestamps: true }
)

scrapSchema.index({ name: "text", description: "text" });

export default mongoose.model("Scrap", scrapSchema)