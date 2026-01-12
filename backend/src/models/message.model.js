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

    /* =========================================================
       AUDIO MESSAGE SUPPORT
    ========================================================= */
    audio: {
      url: {
        type: String,
        default: "",
      },
      duration: {
        type: Number, // seconds
      },
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "audio", "system"],
      default: "text",
      index: true,
    },

    /* =========================================================
       EDIT MESSAGE SUPPORT
    ========================================================= */
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
    },

    /* =========================================================
       DELETE MESSAGE (SOFT DELETE)
    ========================================================= */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =========================================================
       MESSAGE REACTIONS (userId -> emoji)
    ========================================================= */
    reactions: {
      type: Map,
      of: String,
      default: {},
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
  const obj = this.toObject();

  // Hide content if message is deleted
  if (obj.isDeleted) {
    obj.text = "This message was deleted";
    obj.image = "";
    obj.audio = {};
  }

  return obj;
};

/* =========================================================
   MODEL EXPORT
========================================================= */
const Message = mongoose.model("Message", messageSchema);
export default Message;
