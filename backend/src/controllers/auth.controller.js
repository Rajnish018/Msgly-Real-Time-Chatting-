import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";

/* =========================================================
   SIGNUP
========================================================= */
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    /* ---------- validation ---------- */
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    /* ---------- check existing user ---------- */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    /* ---------- hash password ---------- */
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* ---------- create user ---------- */
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    /* ---------- issue JWT ---------- */
   generateToken(user._id, res);


    /* ---------- response ---------- */
    return res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================================================
   LOGIN
========================================================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ---------- validation ---------- */
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    /* ---------- find user (include password) ---------- */
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* ---------- compare password ---------- */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* ---------- issue JWT ---------- */
      generateToken(user._id, res);

    /* ---------- response ---------- */
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================================================
   LOGOUT
========================================================= */
export const logout = async (req, res) => {
  try {
    res.cookie(process.env.COOKIE_NAME || "jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(0), // 🔥 force delete
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



/* =========================================================
   UPDATE PROFILE PICTURE
========================================================= */
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    /* ---------- upload to cloudinary ---------- */
    const uploadResult = await cloudinary.uploader.upload(profilePic, {
      folder: "profiles",
    });

    /* ---------- update user ---------- */
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResult.secure_url },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================================================
   CHECK AUTH (SESSION PERSISTENCE)
========================================================= */
export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Check auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const searchUserByEmail = async (req, res) => {
  try {
    const myId = req.user._id;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: myId }, // prevent self-chat
    })
      .select("fullName email profilePic")
      .lean();

    // IMPORTANT:
    // If not found → return null (NOT error)
    return res.status(200).json(user || null);
  } catch (error) {
    console.error("searchUserByEmail error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

