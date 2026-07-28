import { findUserById } from "../dao/user.dao.js";
import { verifyToken } from "../utils/helper.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies?.accesstoken || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = verifyToken(token);
        const user = await findUserById(decoded);

        if (!user) return res.status(401).json({ message: "Unauthorized" });
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error.message });
    }
};