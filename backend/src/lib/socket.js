import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

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
   COOKIE PARSER
====================== */
io.use((socket, next) => {
  cookieParser()(socket.request, {}, next);
});

/* ======================
   AUTH
====================== */
io.use((socket, next) => {
  try {
    const token = socket.request.cookies?.[process.env.COOKIE_NAME || "jwt"];
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId.toString();
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

/* ======================
   USER SOCKETS
====================== */
// userId -> Set<socketId>
const userSockets = new Map();
/* ======================
   HELPERS
====================== */
export const getReceiverSocketId = (userId) => {
  const sockets = userSockets.get(userId.toString());
  if (!sockets || sockets.size === 0) return null;
  return [...sockets][0]; // pick one active socket
};

/* ======================
   SOCKET EVENTS
====================== */
io.on("connection", (socket) => {
  const userId = socket.userId;

  /* ---------- register socket ---------- */
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }

  const sockets = userSockets.get(userId);
  sockets.add(socket.id);

  /*  FULL SNAPSHOT (ALWAYS SAFE) */
  socket.emit("onlineUsers", Array.from(userSockets.keys()));

  /*  ONLINE ONLY ON FIRST SOCKET */
  if (sockets.size === 1) {
    io.emit("userStatus", {
      userId,
      status: "online",
    });
  }

  console.log(" User connected:", userId, "| sockets:", sockets.size);

  /* ---------- typing ---------- */
  socket.on("typing", ({ to }) => {
    const targets = userSockets.get(to);
    if (!targets) return;
    targets.forEach((id) =>
      io.to(id).emit("typing", { from: userId })
    );
  });

  socket.on("stopTyping", ({ to }) => {
    const targets = userSockets.get(to);
    if (!targets) return;
    targets.forEach((id) =>
      io.to(id).emit("stopTyping", { from: userId })
    );
  });

  /* ---------- disconnect ---------- */
  socket.on("disconnect", () => {
    const sockets = userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(socket.id);

    console.log(" Socket disconnected:", socket.id);

    /* 🔥 OFFLINE ONLY ON LAST SOCKET */
    if (sockets.size === 0) {
      userSockets.delete(userId);

      io.emit("userStatus", {
        userId,
        status: "offline",
        lastSeen: Date.now(),
      });

      io.emit("onlineUsers", Array.from(userSockets.keys()));
    }
  });
});

export { io, app, server };
