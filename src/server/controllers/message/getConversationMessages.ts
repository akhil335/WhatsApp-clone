import Conversation from "@/server/models/Conversation";
import Message from "@/server/models/Message";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { NotFoundError } from "@/server/utils/errors";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

interface PopulatedParticipant {
  _id: mongoose.Types.ObjectId;
  username: string;
  profilePicture?: string;
  lastSeen?: Date;
}

export const getConversationMessages = withErrorHandler<{
  params: Promise<{ conversationId: string }>;
}>(async (req: NextRequest, context) => {
  if (!context?.params) {
    throw new NotFoundError("Conversation ID is required");
  }

  const { conversationId } = await context.params;
  const userId = await getCurrentUserId();

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).populate<{ participants: PopulatedParticipant[] }>(
    "participants",
    "username profilePicture lastSeen"
  );

  if (!conversation) {
    throw new NotFoundError("Conversation not found or you do not have access");
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "username profilePicture")
    .sort({ _id: -1 })
    .lean();

  const receiver = conversation.participants.find(
    (p: PopulatedParticipant) => p._id.toString() !== userId.toString()
  );

  return response(200, "Messages fetched successfully", {
    messages,
    receiver,
    conversation: {
      _id: conversation._id,
      participants: conversation.participants,
    },
  });
});
