import express from "express";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import Message from "../models/message.model.js";

/* ======================
   APP + SERVER (ONLY HERE)
====================== */
const app = express();
const server = http.createServer(app);

/* ======================
   SOCKET.IO SETUP
====================== */
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.CLIENT_URL].filter(Boolean),
    credentials: true,
  },
  transports: ["websocket"],
});

/* ======================
   USER SOCKET MAP
====================== */
const userSockets = new Map();

/* ======================
   HELPERS
====================== */
const getUserSockets = (userId) =>
  userSockets.get(userId?.toString()) ?? new Set();

const broadcastOnlineUsers = () => {
  io.emit("onlineUsers", Array.from(userSockets.keys()));
};

export const getReceiverSocketId = (userId) => {
  const sockets = userSockets.get(userId.toString());
  if (!sockets || sockets.size === 0) return null;
  return [...sockets][0]; // pick one active socket
};

/* ======================
   COOKIE PARSER (SOCKET)
====================== */
io.use((socket, next) => {
  cookieParser()(socket.request, {}, next);
});

/* ======================
   AUTH MIDDLEWARE
====================== */
io.use((socket, next) => {
  try {
    const token =
      socket.request.cookies?.[process.env.COOKIE_NAME || "jwt"];

    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId.toString();
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

/* ======================
   SOCKET EVENTS
====================== */
io.on("connection", (socket) => {
  const userId = socket.userId;

  /* ---------- REGISTER SOCKET ---------- */
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socket.id);

  console.log("🟢 User connected:", userId);

  /* ---------- USER ONLINE ---------- */
  if (userSockets.get(userId).size === 1) {
    io.emit("userStatus", { userId, status: "online" });
    broadcastOnlineUsers();
  }

  /* ---------- SEND MESSAGE ---------- */
  socket.on("sendMessage", async (payload, cb) => {
    try {
      const {
        receiverId,
        text = "",
        image = "",
        audio = {},
        messageType = "text",
      } = payload;

      if (!receiverId) return;

      const message = await Message.create({
        senderId: new mongoose.Types.ObjectId(userId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        text,
        image,
        audio,
        messageType,
      });

      getUserSockets(receiverId).forEach((id) =>
        io.to(id).emit("newMessage", message)
      );

      cb?.({ success: true, message });
    } catch (err) {
      console.error("❌ sendMessage error:", err);
      cb?.({ success: false });
    }
  });

  /* ---------- TYPING ---------- */
  socket.on("typing", ({ to }) => {
    getUserSockets(to).forEach((id) =>
      io.to(id).emit("typing", { from: userId })
    );
  });

  socket.on("stopTyping", ({ to }) => {
    getUserSockets(to).forEach((id) =>
      io.to(id).emit("stopTyping", { from: userId })
    );
  });

  /* ---------- READ RECEIPTS ---------- */
  socket.on("markRead", async ({ messageIds }) => {
    if (!Array.isArray(messageIds)) return;
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isRead: true } }
    );
  });

  /* ---------- DISCONNECTING ---------- */
  socket.on("disconnecting", () => {
    userSockets.get(userId)?.delete(socket.id);
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", () => {
    const sockets = userSockets.get(userId);
    if (sockets?.size > 0) return;

    userSockets.delete(userId);

    io.emit("userStatus", {
      userId,
      status: "offline",
      lastSeen: Date.now(),
    });

    broadcastOnlineUsers();
    console.log("🔴 User offline:", userId);
  });
});

/* ======================
   EXPORTS
====================== */
export { io, app, server };
