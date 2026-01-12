import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utlis/ApiError.js";

/* =========================================================
   AUTH PROTECTION MIDDLEWARE
========================================================= */
export const protectRoute = async (req, res, next) => {
  try {
    const cookieName = process.env.COOKIE_NAME || "jwt";
    const token = req.cookies?.[cookieName];

    /* ---------- step:1 - check token ---------- */
    if (!token) {
      throw new ApiError({
        statusCode: 401,
        message: "Unauthorized - Authentication required",
      });
    }

    /* ---------- step:2 - verify token ---------- */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ---------- step:3 - fetch user ---------- */
    const user = await User.findById(decoded.userId)
      .select("-password")
      .lean();

    if (!user) {
      throw new ApiError({
        statusCode: 401,
        message: "Unauthorized - User not found",
      });
    }

    /* ---------- step:4 - attach user ---------- */
    req.user = user;
    next();
  } catch (error) {

    /* ---------- token expired ---------- */
    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError({
          statusCode: 401,
          message: "Session expired. Please log in again.",
        })
      );
    }

    /* ---------- invalid token ---------- */
    if (error.name === "JsonWebTokenError") {
      return next(
        new ApiError({
          statusCode: 401,
          message: "Invalid authentication token",
        })
      );
    }

    /* ---------- fallback ---------- */
    console.error("protectRoute error:", error.message);
    return next(
      new ApiError({
        statusCode: 401,
        message: "Unauthorized",
      })
    );
  }
};
