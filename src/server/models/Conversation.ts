import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage : { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    unreadCounts : {  type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

const Conversation = 
  mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

export default Conversation;
