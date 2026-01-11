import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

/* ======================
   CORS (SAFE FOR PROD)
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
  transports: ["websocket"], // 🔥 better stability on Render
});

/* =========================================================
   ONLINE USERS MAP
========================================================= */
// { userId: socketId }
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
  const { userId } = socket.handshake.query;

  if (!userId) {
    console.warn("❌ Socket rejected: missing userId");
    socket.disconnect(true);
    return;
  }

  socket.userId = userId;
  userSocketMap.set(userId, socket.id);

  console.log(" User connected:", userId);

  /* ---------- broadcast online users ---------- */
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  /* =========================================================
     TYPING INDICATOR
  ========================================================= */
  socket.on("typing", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        from: socket.userId,
      });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", {
        from: socket.userId,
      });
    }
  });

  /* =========================================================
     DISCONNECT
  ========================================================= */
  socket.on("disconnect", (reason) => {
    console.log(" User disconnected:", socket.userId, "|", reason);

    userSocketMap.delete(socket.userId);
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

/* =========================================================
   EXPORTS
========================================================= */
export { io, app, server };
