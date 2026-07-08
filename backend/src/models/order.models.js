import mongoose from "mongoose";

export const ORDER_STATUSES = [
    "quote_accepted", "payment_pending", "paid",
    "pickup_scheduled", "in_transit", "delivered",
    "completed", "cancelled", "disputed",
];

const orderItemSchema = new mongoose.Schema(
    {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "Scrap", required: true },
        quantity: { type: Number, required: true, min: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const timelineSchema = new mongoose.Schema(
    {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
        items: { type: [orderItemSchema], default: [] },
        status: { type: String, enum: ORDER_STATUSES, default: "quote_accepted", index: true },
        offeredPrice: { type: Number },
        finalPrice: { type: Number, required: true, min: 0 },
        shippingAddress: {
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pincode: { type: String, default: "" },
            address: { type: String, default: "" },
        },
        pickupDate: { type: Date },
        deliveryProof: { type: [String], default: [] },
        paymentId: { type: String },
        invoiceUrl: { type: String },
        reviewed: { type: Boolean, default: false },
        timeline: { type: [timelineSchema], default: [] },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
