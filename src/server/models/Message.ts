import mongoose from "mongoose";
import messageStatusSchema from "./MessageStatus";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "Conversation",
      required: true,
    },
    sender: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "User",
      required: true,
    },
    content        : { type: String },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video", "application", "audio"],
          required: true,
        },
      },
    ],
    reactions: [
      {
        user : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        emoji: { type: String, required: true, },
      },
    ],
    messageStatuses: {
      type: Map,
      of: messageStatusSchema,
      default: {},
    },
  },
  { timestamps: true },
);

const Message = 
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
