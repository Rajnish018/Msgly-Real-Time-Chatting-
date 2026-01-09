import mongoose from "mongoose";

/* =========================================================
   MESSAGE SCHEMA
========================================================= */
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      trim: true,
      maxlength: [2000, "Message text is too long"],
    },

    image: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================================================
   COMPOUND INDEX (CHAT PERFORMANCE)
========================================================= */
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

/* =========================================================
   OUTPUT SANITIZATION
========================================================= */
messageSchema.methods.toJSON = function () {
  return this.toObject();
};

/* =========================================================
   MODEL EXPORT
========================================================= */
const Message = mongoose.model("Message", messageSchema);
export default Message;
