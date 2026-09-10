
import Conversation from "@/server/models/Conversation";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { NextRequest } from "next/server";

export const getAllConversations = async (req: NextRequest) => {
    try {
        const currentUserId = await getCurrentUserId();

        const conversations = await Conversation.find({
        participants: currentUserId,
        })
        .populate("participants", "username profilePicture about lastSeen isOnline")
        .populate("lastMessage", "content createdAt")
        .sort({ updatedAt: -1 })
        .lean();

        return response(200, "Conversations fetched successfully", { conversations });

    }catch(err) {
        if (err instanceof Error) {
             console.error("getAllConversations error:", err);
            if (
                err.message === "Unauthorized" ||
                err.message === "Invalid token"
            ) {
                return response(401, err.message);
            }
        }

        return response(500, "Internal server error");
    }
}