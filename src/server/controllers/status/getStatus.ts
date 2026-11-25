import { NextRequest } from "next/server";
import Conversation from "@/server/models/Conversation";
import UserStatus from "@/server/models/UserStatus";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { withErrorHandler } from "@/server/utils/errorHandler";

export const getStatus = withErrorHandler(async (req: NextRequest) => {
  const userId = await getCurrentUserId();
  const now = new Date();

  // ----------------------------------------------------
  // 1. Fetch My Active Statuses
  // ----------------------------------------------------
  const rawMyStatuses = await UserStatus.find({
    user: userId,
    expiredAt: { $gt: now },
  })
    .sort({ createdAt: 1 })
    .populate("viewers.user", "username profilePicture")
    .populate("likes", "username profilePicture")
    .lean();

  const myStatuses = rawMyStatuses.map((status) => ({
    ...status,
    isLiked:
      status.likes?.some(
        (user: any) => user._id?.toString() === userId.toString()
      ) || false,
    likesCount: status.likes?.length || 0,
    viewsCount: status.viewers?.length || 0,
  }));

  // ----------------------------------------------------
  // 2. Find Contacts (Derive from active Conversations)
  // ----------------------------------------------------
  const conversations = await Conversation.find({
    participants: userId,
  })
    .select("participants")
    .lean();

  const contactIds = Array.from(
    new Set(
      conversations
        .flatMap((c) => c.participants)
        .map((p) => p.toString())
        .filter((id) => id !== userId.toString())
    )
  );

  // ----------------------------------------------------
  // 3. Fetch Contacts' Active Statuses
  // ----------------------------------------------------
  let otherStatuses: Array<{
    user: any;
    allViewed: boolean;
    statuses: any[];
  }> = [];

  if (contactIds.length > 0) {
    const rawContactStatuses = await UserStatus.find({
      user: { $in: contactIds },
      expiredAt: { $gt: now },
    })
      .sort({ createdAt: 1 })
      .populate("user", "username profilePicture")
      .lean();

    // ----------------------------------------------------
    // 4. Group Contact Statuses by User (WhatsApp Story Ring format)
    // ----------------------------------------------------
    const statusMap = new Map<
      string,
      { user: any; allViewed: boolean; statuses: any[] }
    >();

    for (const status of rawContactStatuses) {
      const author = status.user;
      if (!author) continue;

      const authorId = author._id.toString();

      // Has the current user already viewed this specific status?
      const isViewed =
        status.viewers?.some(
          (v: any) => v.user.toString() === userId.toString()
        ) || false;

      // Has the current user liked this specific status?
      const isLiked =
        status.likes?.some(
          (likeId: any) => likeId.toString() === userId.toString()
        ) || false;

      const formattedStatus = {
        ...status,
        isViewed,
        isLiked,
        likesCount: status.likes?.length || 0,
      };

      if (!statusMap.has(authorId)) {
        statusMap.set(authorId, {
          user: author,
          allViewed: true, // will turn false if any story is not yet viewed
          statuses: [],
        });
      }

      const group = statusMap.get(authorId)!;
      if (!isViewed) {
        group.allViewed = false; // WhatsApp shows a green unread ring if any story is unviewed
      }
      group.statuses.push(formattedStatus);
    }

    otherStatuses = Array.from(statusMap.values());
  }

  return response(200, "Statuses fetched successfully", {
    myStatuses,
    otherStatuses,
  });
});
