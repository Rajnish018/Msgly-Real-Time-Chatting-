import dotenv from "dotenv";
dotenv.config();
import express from 'express'

import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

/* ======================
   ENV & CONSTANTS
====================== */
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

/* ======================
   MIDDLEWARES
====================== */
app.use(express.json({ limit: "10mb" }));

app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    // methods: ["GET", "POST", "PUT", "DELETE"],
    
    credentials: true,
  })
);

/* ======================
   ROUTES
====================== */
app.get("/", (_, res) => {
  res.status(200).json({ status: "OK", message: "API running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


/*=====================
    error handler
====================*/



/* ======================
   START SERVER & CONNECT DB
====================== */

server.listen(PORT, async () => {
  console.log("server is running on PORT:" + PORT);
  await connectDB();
});
