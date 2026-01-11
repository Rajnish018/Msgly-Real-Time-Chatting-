import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const cookieName = process.env.COOKIE_NAME || "jwt";
    const token = req.cookies?.[cookieName];

    // No token
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - Authentication required",
      });
    }

    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Fetch user
    const user = await User.findById(decoded.userId)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    console.error("protectRoute error:", error.message);
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};
