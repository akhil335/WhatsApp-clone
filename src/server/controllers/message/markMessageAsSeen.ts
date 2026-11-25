import Conversation from "@/server/models/Conversation";
import Message from "@/server/models/Message";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { BadRequestError, NotFoundError } from "@/server/utils/errors";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { NextRequest } from "next/server";

export const markMessageAsSeen = withErrorHandler(async (req: NextRequest) => {
  const userId = await getCurrentUserId();
  const { conversationId } = await req.json();

  if (!conversationId) {
    throw new BadRequestError("conversationId is required");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  const now = new Date();

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      [`messageStatuses.${userId}.seenAt`]: null,
    },
    {
      $set: { [`messageStatuses.${userId}.seenAt`]: now },
    },
  );

  conversation.unreadCounts.set(userId.toString(), 0);
  await conversation.save();

  return response(200, "message marked as seen", {
    conversationId,
    seenAt: now,
  });
});
