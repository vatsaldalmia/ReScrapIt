// SMS abstraction. A real provider (Twilio/MSG91) can be wired via env; without
// it, the code is logged and returned so OTP flows work in local/dev.
export const isSmsConfigured = () =>
    Boolean(process.env.SMS_PROVIDER && process.env.SMS_API_KEY);

export const sendSms = async ({ to, message }) => {
    if (!isSmsConfigured()) {
        console.log(`[sms:dev] to=${to} | ${message}`);
        return { simulated: true };
    }
    // Placeholder for a real provider integration.
    console.log(`[sms] to=${to} | ${message}`);
    return { simulated: false };
};
