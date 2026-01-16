import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";

import { app, server } from "./lib/socket.js";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

/* ======================
   MIDDLEWARES
====================== */
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL].filter(Boolean),
    credentials: true,
  })
);

/* ======================
   ROUTES
====================== */
app.get("/", (_, res) => {
  res.json({ status: "OK", message: "API running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* ======================
   ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false });
});

/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on ${PORT}`);
});
