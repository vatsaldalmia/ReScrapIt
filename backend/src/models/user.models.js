import mongoose from 'mongoose'

export const USER_ROLES = ["buyer", "seller", "dual", "admin"];
export const KYC_DOC_TYPES = ["pan_card", "gst_certificate", "other"];
export const KYC_STATUSES = ["pending", "approved", "rejected"];

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        address: {
            type: String,
            required: true,
        },
        pan: {
            type: String,
            required: true,
            unique: true,
        },
        role: {
            type: String,
            enum: USER_ROLES,
            default: "dual",
        },
        companyName: { type: String, default: "" },
        gst: { type: String, default: "" },
        logo: { type: String, default: "" },
        bio: { type: String, default: "" },
        isVerified: { type: Boolean, default: false },
        banned: { type: Boolean, default: false },
        kycDocuments: [
            {
                type: {
                    type: String,
                    enum: KYC_DOC_TYPES,
                    default: "other",
                },
                url: { type: String },
                status: {
                    type: String,
                    enum: KYC_STATUSES,
                    default: "pending",
                },
            }
        ],
        rating: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        }
    },
    {timestamps : true}
)

export default mongoose.model('user',userSchema)
