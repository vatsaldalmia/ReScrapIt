import axios from "axios";
import crypto from "crypto";

export const isRazorpayConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

// Creates a Razorpay order via the REST API when configured; otherwise returns
// a simulated order so the checkout flow works end-to-end in dev.
export const createRazorpayOrder = async (amountInRupees, receipt) => {
    if (!isRazorpayConfigured()) {
        return { id: `order_sim_${Date.now()}`, amount: Math.round(amountInRupees * 100), currency: "INR", simulated: true };
    }
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const { data } = await axios.post(
        "https://api.razorpay.com/v1/orders",
        { amount: Math.round(amountInRupees * 100), currency: "INR", receipt },
        { headers: { Authorization: `Basic ${auth}` } }
    );
    return { ...data, simulated: false };
};

// Verifies the Razorpay payment signature (HMAC-SHA256 of "order_id|payment_id").
export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
    if (!isRazorpayConfigured()) return true; // dev: accept simulated payments
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    return expected === signature;
};

// Issues a refund for a captured payment. Simulated when unconfigured.
export const refundRazorpayPayment = async (paymentId, amountInRupees) => {
    if (!isRazorpayConfigured() || String(paymentId).startsWith("pay_sim") || String(paymentId).startsWith("mock")) {
        return { id: `rfnd_sim_${Date.now()}`, status: "processed", simulated: true };
    }
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const { data } = await axios.post(
        `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
        amountInRupees ? { amount: Math.round(amountInRupees * 100) } : {},
        { headers: { Authorization: `Basic ${auth}` } }
    );
    return { ...data, simulated: false };
};
