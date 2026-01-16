import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import ApiError from "../utlis/ApiError.js";
import { sendSuccess } from "../utlis/ApiResponse.js";
import asyncHandler from "../utlis/asyncHandler.js";

/* =========================================================
   GET USERS FOR SIDEBAR
========================================================= */
export const getUsersForSidebar = asyncHandler(async (req, res) => {

  const myId = req.user._id.toString();

  const sentTo = await Message.distinct("receiverId", {
    senderId: myId,
  });

  const receivedFrom = await Message.distinct("senderId", {
    receiverId: myId,
  });

  const chatUserIds = [...new Set([...sentTo, ...receivedFrom])];

  if (!chatUserIds.length) {
    return sendSuccess(res, {
      message: "No users found",
      data: [],
    });
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

  return sendSuccess(res, {
    message: "Sidebar users fetched",
    data: usersWithMeta,
  });
});

/* =========================================================
   GET MESSAGES
========================================================= */
export const getMessages = asyncHandler(async (req, res) => {

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

  return sendSuccess(res, {
    message: "Messages fetched",
    data: messages,
  });
});

/* =========================================================
   SEND MESSAGE (TEXT / IMAGE / AUDIO)
========================================================= */
export const sendMessage = asyncHandler(async (req, res) => {

  const { text, image, audio, audioDuration } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id.toString();

  if (!text && !image && !audio) {
    throw new ApiError({
      statusCode: 400,
      message: "Message cannot be empty",
    });
  }

  let imageUrl = "";
  let audioData = {};
  let messageType = "text";

  /* ---------- image upload ---------- */
  if (image) {
    const upload = await cloudinary.uploader.upload(image, {
      folder: "chat-images",
    });
    imageUrl = upload.secure_url;
    messageType = "image";
  }

  /* ---------- audio upload ---------- */
  if (audio) {
    const upload = await cloudinary.uploader.upload(audio, {
      resource_type: "video", // Cloudinary treats audio as video
      folder: "chat-audio",
    });

    audioData = {
      url: upload.secure_url,
      duration: audioDuration || 0,
    };

    messageType = "audio";
  }

  const message = await Message.create({
    senderId,
    receiverId,
    text: text?.trim(),
    image: imageUrl,
    audio: audioData,
    messageType,
  });

  const receiverSocketId = getReceiverSocketId(receiverId);
  const senderSocketId = getReceiverSocketId(senderId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", message);
  }

  if (senderSocketId) {
    io.to(senderSocketId).emit("newMessage", message);
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: "Message sent",
    data: message,
  });
});

/* =========================================================
   MARK MESSAGES AS READ
========================================================= */
export const markMessagesAsRead = asyncHandler(async (req, res) => {

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

  return sendSuccess(res, {
    message: "Messages marked as read",
    data: { success: true },
  });
});


/* =========================================================
   EDIT MESSAGE
========================================================= */
export const editMessage = asyncHandler(async (req, res) => {
  const { id: messageId } = req.params;
  const { text } = req.body;
  const myId = req.user._id.toString();

  if (!text) {
    throw new ApiError({ statusCode: 400, message: "Message text required" });
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError({ statusCode: 404, message: "Message not found" });
  }

  if (message.senderId.toString() !== myId) {
    throw new ApiError({ statusCode: 403, message: "Not allowed" });
  }

  if (message.isDeleted) {
    throw new ApiError({ statusCode: 400, message: "Message already deleted" });
  }

  message.text = text.trim();
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  const receiverSocketId = getReceiverSocketId(message.receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageEdited", message);
  }

  return sendSuccess(res, {
    message: "Message edited",
    data: message,
  });
});

/* =========================================================
   DELETE MESSAGE
========================================================= */
export const deleteMessage = asyncHandler(async (req, res) => {
  const { id: messageId } = req.params;
  const myId = req.user._id.toString();

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError({ statusCode: 404, message: "Message not found" });
  }

  if (message.senderId.toString() !== myId) {
    throw new ApiError({ statusCode: 403, message: "Not allowed" });
  }

  message.isDeleted = true;
  message.text = "";
  message.image = "";
  message.audio = {};
  message.reactions.clear();

  await message.save();

  const receiverSocketId = getReceiverSocketId(message.receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageDeleted", { messageId });
  }

  return sendSuccess(res, {
    message: "Message deleted",
    data: { messageId },
  });
});


/* =========================================================
   REPLY TO MESSAGE
========================================================= */
export const replyToMessage = asyncHandler(async (req, res) => {
  const { id: receiverId } = req.params;
  const { text, replyTo } = req.body;
  const senderId = req.user._id.toString();

  if (!text || !replyTo) {
    throw new ApiError({
      statusCode: 400,
      message: "Reply text and original message required",
    });
  }

  const originalMessage = await Message.findById(replyTo);
  if (!originalMessage) {
    throw new ApiError({ statusCode: 404, message: "Original message not found" });
  }

  const message = await Message.create({
    senderId,
    receiverId,
    text: text.trim(),
    replyTo,
    messageType: "text",
  });

  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", message);
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: "Reply sent",
    data: message,
  });
});

/* =========================================================
   REACT TO MESSAGE
========================================================= */
export const reactToMessage = asyncHandler(async (req, res) => {
  const { id: messageId } = req.params;
  const { emoji } = req.body;
  const myId = req.user._id.toString();

  if (!emoji) {
    throw new ApiError({ statusCode: 400, message: "Emoji required" });
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError({ statusCode: 404, message: "Message not found" });
  }

  message.reactions.set(myId, emoji);
  await message.save();

  const receiverSocketId = getReceiverSocketId(message.receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageReacted", {
      messageId,
      reactions: Object.fromEntries(message.reactions),
    });
  }

  return sendSuccess(res, {
    message: "Reaction added",
    data: message.reactions,
  });
});
