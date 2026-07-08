import nodemailer from "nodemailer";

const isConfigured = () =>
    Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
const getTransporter = () => {
    if (!transporter && isConfigured()) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
    }
    return transporter;
};

// Sends an email when SMTP is configured; otherwise logs it (dev fallback).
export const sendEmail = async ({ to, subject, text, html }) => {
    if (!isConfigured()) {
        console.log(`[email:dev] to=${to} | ${subject} | ${text || ""}`);
        return { simulated: true };
    }
    try {
        const from = process.env.SMTP_FROM || "ReScrapIt <no-reply@rescrapit.local>";
        await getTransporter().sendMail({ from, to, subject, text, html });
        return { simulated: false };
    } catch (error) {
        console.error("Email send failed:", error.message);
        return { simulated: false, error: error.message };
    }
};
