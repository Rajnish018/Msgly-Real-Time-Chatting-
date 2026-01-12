import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import ApiError from "../utlis/ApiError.js";
import { sendSuccess } from "../utlis/ApiResponse.js";
import asyncHandler from "../utlis/asyncHandler.js";

/* =========================================================
   SIGNUP
========================================================= */

export const signup = asyncHandler(async (req, res) => {

  /* ---------- step:1 - get data ---------- */

  const { fullName, email, password } = req.body;

  /* ---------- step:2 - validation ---------- */

  if (!fullName || !email || !password) {
    throw new ApiError({ statusCode: 400, message: "All fields are required" });
  }

  if (password.length < 6) {
    throw new ApiError({
      statusCode: 400,
      message: "Password must be at least 6 characters",
    });
  }

  /* ---------- step:3 - check existing user ---------- */

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError({ statusCode: 409, message: "Email already exists" });
  }

  /* ---------- step:4 - hash password ---------- */

  const hashedPassword = await bcrypt.hash(password, 10);

  /* ---------- step:5 - create user ---------- */

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
  });

  /* ---------- step:6 - generate JWT Token ---------- */

  generateToken(user._id, res);

  /* ---------- step:7 - send response ---------- */

  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
  });
});

/* =========================================================
   LOGIN
========================================================= */

export const login = asyncHandler(async (req, res) => {

  /* ---------- step:1 - validation ---------- */

  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError({
      statusCode: 400,
      message: "Email and password required",
    });
  }

  /* ---------- step:2 - find user ---------- */

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError({ statusCode: 401, message: "Invalid credentials" });
  }

  /* ---------- step:3 - compare password ---------- */

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError({ statusCode: 401, message: "Invalid credentials" });
  }

  /* ---------- step:4 - generate JWT Token ---------- */

  generateToken(user._id, res);

  /* ---------- step:5 - send response ---------- */

  return sendSuccess(res, {
    message: "Login successful",
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
  });
});

/* =========================================================
   LOGOUT
========================================================= */

export const logout = asyncHandler(async (req, res) => {

  /* ---------- clear JWT cookie ---------- */

  res.cookie(process.env.COOKIE_NAME || "jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0),
  });

  return sendSuccess(res, {
    message: "Logged out successfully",
  });
});

/* =========================================================
   UPDATE PROFILE PICTURE
========================================================= */

export const updateProfile = asyncHandler(async (req, res) => {

  /* ---------- step:1 - get data ---------- */

  const { profilePic } = req.body;
  const userId = req.user._id;

  if (!profilePic) {
    throw new ApiError({
      statusCode: 400,
      message: "Profile picture is required",
    });
  }

  /* ---------- step:2 - upload to cloudinary ---------- */

  const uploadResult = await cloudinary.uploader.upload(profilePic, {
    folder: "profiles",
  });

  /* ---------- step:3 - update user ---------- */

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePic: uploadResult.secure_url },
    { new: true }
  ).select("fullName email profilePic");

  /*---------- step:4 - send response ---------- */

  return sendSuccess(res, {
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

/* =========================================================
   CHECK AUTH (SESSION PERSISTENCE)
========================================================= */

export const checkAuth = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: "Authenticated user",
    data: req.user,
  });
});

/* =========================================================
   SEARCH USER BY EMAIL
========================================================= */

export const searchUserByEmail = asyncHandler(async (req, res) => {

  /* ---------- step:1 - get data ---------- */

  const myId = req.user._id;
  const { email } = req.query;

  if (!email) {
    throw new ApiError({ statusCode: 400, message: "Email is required" });
  }

  /* ---------- step:2 - search user ---------- */

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    _id: { $ne: myId },
  })
    .select("fullName email profilePic")
    .lean();

  /* ---------- step:3 - send response ---------- */

  return sendSuccess(res, {
    message: "User search result",
    data: user || null,
  });
});

/* =========================================================
    GET USER DATA
========================================================= */

export const getUserData = asyncHandler(async (req, res) => {

  /* ---------- step:1 - get data ---------- */

  const userId = req.params.id;

  /* ---------- step:2 - get user ---------- */

  const user = await User.findById(userId).select(
    "fullName email profilePic"
  );

  if (!user) {
    throw new ApiError({ statusCode: 404, message: "User not found" });
  }

  /* ---------- step:3 - send response ---------- */

  return sendSuccess(res, {
    message: "User data fetched",
    data: user,
  });
});
