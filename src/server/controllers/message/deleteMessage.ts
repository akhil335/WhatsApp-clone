import Conversation from "@/server/models/Conversation";
import Message from "@/server/models/Message";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { BadRequestError, NotFoundError } from "@/server/utils/errors";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { NextRequest } from "next/server";

export const deleteMessage = withErrorHandler(async (req: NextRequest) => {
  const userId = await getCurrentUserId();
  const { messageId, conversationId } = await req.json();

  if (!conversationId) {
    throw new BadRequestError("conversationId is required");
  }
  if (!messageId) {
    throw new BadRequestError("messageId is required");
  }

  // 1. Delete in one atomic query
  const deletedMessage = await Message.findOneAndDelete({
    _id: messageId,
    conversation: conversationId,
    sender: userId,
  });

  if (!deletedMessage) {
    throw new NotFoundError(
      "Message not found or you don't have permission to delete it",
    );
  }

  // 2. Fix conversation.lastMessage if the deleted message was the latest one
  const conversation = await Conversation.findById(conversationId);
  if (conversation && conversation.lastMessage?.toString() === messageId) {
    const previousMessage = await Message.findOne({
      conversation: conversationId,
    }).sort({ _id: -1 });

    conversation.lastMessage = previousMessage?._id || null;
    await conversation.save();
  }

  return response(200, "Message deleted successfully");
});
