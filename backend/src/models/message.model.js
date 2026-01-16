import mongoose from "mongoose";

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
      maxlength: 2000,
    },

    image: { type: String, default: "" },

    audio: {
      url: { type: String, default: "" },
      duration: Number,
    },

    isRead: { type: Boolean, default: false, index: true },

    messageType: {
      type: String,
      enum: ["text", "image", "audio", "system"],
      default: "text",
      index: true,
    },

    isEdited: { type: Boolean, default: false },
    editedAt: Date,

    isDeleted: { type: Boolean, default: false, index: true },

    reactions: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

messageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.isDeleted) {
    obj.text = "This message was deleted";
    obj.image = "";
    obj.audio = {};
  }
  return obj;
};

export default mongoose.model("Message", messageSchema);
