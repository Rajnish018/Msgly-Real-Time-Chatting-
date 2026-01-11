import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

/* =========================================================
   GET USERS FOR SIDEBAR
========================================================= */
export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user._id.toString();

    const sentTo = await Message.distinct("receiverId", {
      senderId: myId,
    });

    const receivedFrom = await Message.distinct("senderId", {
      receiverId: myId,
    });

    const chatUserIds = [...new Set([...sentTo, ...receivedFrom])];

    if (!chatUserIds.length) {
      return res.status(200).json([]);
    }

    const users = await User.find(
      { _id: { $in: chatUserIds } },
      { password: 0 }
    ).lean();

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
   GET MESSAGES
========================================================= */
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id.toString();

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
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
    const senderId = req.user._id.toString();

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let imageUrl = "";
    if (image) {
      const upload = await cloudinary.uploader.upload(image, {
        folder: "chat-images",
      });
      imageUrl = upload.secure_url;
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text: text?.trim(),
      image: imageUrl,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", message);
    }

    return res.status(201).json(message);
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================================================
   MARK MESSAGES AS READ
========================================================= */
export const markMessagesAsRead = async (req, res) => {
  try {
    const myId = req.user._id.toString();
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
  } catch (error) {
    console.error("markMessagesAsRead error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
