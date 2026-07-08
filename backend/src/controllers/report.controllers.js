import Report from "../models/report.models.js";
import Review from "../models/review.models.js";
import { REPORT_TARGETS } from "../models/report.models.js";

// Any authenticated user can report a listing, user or review.
export const createReport = async (req, res) => {
    try {
        const { targetType, targetId, reason, description } = req.body;
        if (!REPORT_TARGETS.includes(targetType) || !targetId || !reason) {
            return res.status(400).json({ message: "targetType, targetId and reason are required" });
        }
        const report = await Report.create({
            reporter: req.user._id,
            targetType,
            targetId,
            reason,
            description: description || "",
        });
        if (targetType === "review") {
            await Review.findByIdAndUpdate(targetId, { reported: true });
        }
        res.status(201).json({ message: "Report submitted", report });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
