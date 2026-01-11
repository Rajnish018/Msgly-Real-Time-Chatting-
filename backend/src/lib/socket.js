import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

/* ======================
   SOCKET.IO SETUP
====================== */
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["websocket"], // stable on mobile browsers
});

/* =========================================================
   SOCKET AUTH (JWT) 🔐
========================================================= */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.warn("❌ Socket rejected: missing token");
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    console.warn("❌ Socket rejected: invalid token");
    next(new Error("Unauthorized"));
  }
});

/* =========================================================
   ONLINE USERS MAP
========================================================= */
// userId -> socketId
const userSocketMap = new Map();

/* =========================================================
   HELPERS
========================================================= */
export const getReceiverSocketId = (userId) => {
  return userSocketMap.get(userId);
};

/* =========================================================
   SOCKET CONNECTION
========================================================= */
io.on("connection", (socket) => {
  const userId = socket.userId;

  userSocketMap.set(userId, socket.id);
  console.log("🟢 User connected:", userId);

  /* ---------- broadcast online users ---------- */
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  /* =========================================================
     TYPING INDICATOR
  ========================================================= */
  socket.on("typing", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        from: userId,
      });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", {
        from: userId,
      });
    }
  });

  /* =========================================================
     DISCONNECT
  ========================================================= */
  socket.on("disconnect", (reason) => {
    console.log("🔴 User disconnected:", userId, "|", reason);
    userSocketMap.delete(userId);
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

/* =========================================================
   EXPORTS
========================================================= */
export { io, app, server };
