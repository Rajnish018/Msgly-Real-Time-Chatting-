import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

/* =========================================================
   GET USERS FOR SIDEBAR
========================================================= */
export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user._id;

    // 1️ Find all users I've chatted with
    const sentTo = await Message.distinct("receiverId", {
      senderId: myId,
    });

    const receivedFrom = await Message.distinct("senderId", {
      receiverId: myId,
    });

    const chatUserIds = [...new Set([...sentTo, ...receivedFrom])];

    if (chatUserIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2️⃣ Fetch users
    const users = await User.find(
      { _id: { $in: chatUserIds } },
      { password: 0 }
    ).lean();

    // 3️⃣ Attach last message + unread count
    const usersWithMeta = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: myId, receiverId: user._id },
            { senderId: user._id, receiverId: myId },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: myId,
          isRead: false,
        });

        return {
          ...user,
          lastMessage,
          unreadCount,
        };
      })
    );

    // 4️⃣ Sort by last message time (WhatsApp behavior)
    usersWithMeta.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt || 0) -
        new Date(a.lastMessage?.createdAt || 0)
    );

    return res.status(200).json(usersWithMeta);
  } catch (error) {
    console.error("getUsersForSidebar error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================================================
   GET MESSAGES (1-TO-1)
========================================================= */
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!userToChatId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 }) // chronological order
      .lean();

    return res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================================================
   SEND MESSAGE
========================================================= */
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver id is required" });
    }

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let imageUrl = "";

    /* ---------- upload image (if exists) ---------- */
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat-images",
      });
      imageUrl = uploadResponse.secure_url;
    }

    /* ---------- save message ---------- */
    const message = await Message.create({
      senderId,
      receiverId,
      text: text?.trim(),
      image: imageUrl,
    });

    /* ---------- realtime delivery ---------- */
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    return res.status(201).json(message);
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// mark unread msg 
export const markMessagesAsRead = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    await Message.updateMany(
      {
        senderId: userId,
        receiverId: myId,
        isRead: false,
      },
      { isRead: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("markMessagesAsRead error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
