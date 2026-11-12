import Conversation from "@/server/models/Conversation";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { withErrorHandler } from "@/server/utils/errorHandler";

export const getAllConversations = withErrorHandler(async () => {
  const currentUserId = await getCurrentUserId();

  const conversations = await Conversation.find({
    participants: currentUserId,
  })
    .populate("participants", "username profilePicture about lastSeen isOnline")
    .populate("lastMessage", "content createdAt")
    .sort({ updatedAt: -1 })
    .lean();

  return response(200, "Conversations fetched successfully", { conversations });
});
