import mongoose from "mongoose";

const scrapSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: [
            {
                type: String,
                required: true,
            }
        ],
        quantity: {
            type: Number,
            required: true
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    }
)

export default mongoose.model("Scrap", scrapSchema)