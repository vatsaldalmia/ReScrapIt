import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        label: { type: String, default: "Address" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pincode: { type: String, default: "" },
        address: { type: String, default: "" },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
