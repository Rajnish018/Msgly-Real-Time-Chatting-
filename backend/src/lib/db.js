import mongoose from "mongoose";

/* =========================================================
   DATABASE CONNECTION
========================================================= */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: false,        // disable in production for performance
      serverSelectionTimeoutMS: 5000,
    });

    console.log(
      ` MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    // Fail fast in production
    process.exit(1);
  }
};
