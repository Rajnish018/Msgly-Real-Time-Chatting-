import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
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
  const userId = socket.handshake.query.userId;

  if (!userId) {
    socket.disconnect();
    return;
  }

  // 🔑 attach userId to socket
  socket.userId = userId;

  // store online user
  userSocketMap.set(userId, socket.id);

  console.log("User connected:", userId);

  /* ---------- broadcast online users ---------- */
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  /* =========================================================
     TYPING INDICATOR
  ========================================================= */
  socket.on("typing", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    // console.log("➡️ forwarding typing to socket:", receiverSocketId);

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

//   socket.on("typing", ({ to }) => {
//   console.log("📨 typing received from", socket.userId, "to", to);
// });


  /* =========================================================
     DISCONNECT
  ========================================================= */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);

    userSocketMap.delete(socket.userId);

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });


});

/* =========================================================
   EXPORTS
========================================================= */
export { io, app, server };
