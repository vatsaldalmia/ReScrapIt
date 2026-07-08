import { getCloudinary, isCloudinaryConfigured } from "../lib/cloudinary.js";

// Accepts a base64 data URI (or an array of them) in the request body and
// uploads to Cloudinary. If Cloudinary credentials are not configured, the
// image(s) are returned unchanged so the flow still works in local dev.
export const uploadImage = async (req, res) => {
    try {
        const { image, images } = req.body;
        const payload = images || (image ? [image] : []);

        if (!payload.length) {
            return res.status(400).json({ message: "No image provided" });
        }

        if (!isCloudinaryConfigured()) {
            // Dev fallback: persist base64 directly.
            const urls = payload;
            return res.status(200).json({ urls, url: urls[0], usedCloudinary: false });
        }

        const cloudinary = getCloudinary();
        const uploads = await Promise.all(
            payload.map((img) =>
                cloudinary.uploader.upload(img, { folder: "rescrapit" })
            )
        );
        const urls = uploads.map((u) => u.secure_url);

        res.status(200).json({ urls, url: urls[0], usedCloudinary: true });
    } catch (error) {
        console.error("Error uploading image:", error.message);
        res.status(500).json({ message: "Image upload failed", error: error.message });
    }
};
