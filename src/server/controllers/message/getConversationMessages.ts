import Conversation from "@/server/models/Conversation";
import Message from "@/server/models/Message";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

interface PopulatedParticipant {
  _id: mongoose.Types.ObjectId;
  name: string;
  profilePicture?: string;
  lastSeen?: Date;
}

export const getConversationMessages = async (
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) => {
  try {
    const { conversationId } = await params;

    const userId = await getCurrentUserId();

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    }).populate<{ participants: PopulatedParticipant[] }>(
      "participants",
      "name profilePicture lastSeen"
    );

    if (!conversation) {
      return response(404, "Conversation not found or you don't have access");
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name profilePicture")
      .sort({ _id: -1 })
      .lean();

    const receiver = conversation.participants.find(
            (p: PopulatedParticipant) => p._id.toString() !== userId.toString()
          )

    return response(200, "Messages fetched successfully", {
      data: {
        messages,
        receiver,
        conversation: {
          _id: conversation._id,
          type: conversation.type,
          name: conversation.name,
          groupImage: conversation.groupImage,
        },
      },
    });
  } catch (err: unknown) {
    console.error("getConversationMessages error:", err);
    return response(500, "Internal server error");
  }
};