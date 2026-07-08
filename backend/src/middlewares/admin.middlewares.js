// Requires authMiddleware to run first (sets req.user).
// Grants access to platform admins: users with role "admin", or whose email is
// listed in the ADMIN_EMAILS env var (comma-separated) for easy bootstrapping.
export const adminMiddleware = (req, res, next) => {
    const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    const isAdmin =
        req.user?.role === "admin" ||
        (req.user?.email && adminEmails.includes(req.user.email.toLowerCase()));

    if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};
