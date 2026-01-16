import mongoose from "mongoose";

/* =========================================================
   USER SCHEMA
========================================================= */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [50, "Full name must be less than 50 characters"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    profilePic: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    /* =========================================================
       ACCOUNT STATUS (PRODUCTION HARDENING)
    ========================================================= */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================================================
   INDEXES (PERFORMANCE)
========================================================= */
// Reduce search complexity O(n) → O(log n)
userSchema.index({ email: 1 });

// Useful for admin / moderation queries
userSchema.index({ role: 1, isActive: 1 });

/* =========================================================
   JSON SAFETY (HIDE SENSITIVE FIELDS)
========================================================= */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.__v;

  return obj;
};

/* =========================================================
   MODEL EXPORT
========================================================= */
const User = mongoose.model("User", userSchema);
export default User;
