import { NextRequest } from "next/server";
import mongoose from "mongoose";
import UserStatus from "@/server/models/UserStatus";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { BadRequestError, NotFoundError } from "@/server/utils/errors";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";

export const likeStatus = withErrorHandler(
  async (
    req: NextRequest,
    context?: { params?: Promise<{ statusId?: string }> },
  ) => {
    const userId = await getCurrentUserId();

    // 1. Resolve statusId from route params, query params, or JSON body
    const params = context?.params ? await context.params : undefined;
    const queryId = req.nextUrl.searchParams.get("statusId");
    let bodyId: string | undefined;

    if (!params?.statusId && !queryId) {
      try {
        const body = await req.json();
        bodyId = body?.statusId;
      } catch {
        // Body was empty or not JSON
      }
    }

    const statusId = params?.statusId || queryId || bodyId;

    if (!statusId) {
      throw new BadRequestError("statusId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(statusId)) {
      throw new BadRequestError("Invalid statusId format");
    }

    // 2. Fetch active status (must not be expired)
    const status = await UserStatus.findOne({
      _id: statusId,
      expiredAt: { $gt: new Date() },
    });

    if (!status) {
      throw new NotFoundError("Status not found or has expired");
    }

    // 3. Check if user already liked this status (comparing ObjectIds safely)
    const isLiked = status.likes.some(
      (likeId: mongoose.Types.ObjectId) =>
        likeId.toString() === userId.toString(),
    );

    // 4. Atomic toggle: $pull if already liked, $addToSet if not liked
    const updateQuery =
      isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

    const updatedStatus = await UserStatus.findByIdAndUpdate(
      statusId,
      updateQuery,
      { new: true },
    );

    const willBeLiked = !isLiked;
    const likesCount = updatedStatus?.likes?.length || 0;

    return response(
      200,
      willBeLiked ? "Status liked successfully" : "Status unliked successfully",
      {
        isLiked: willBeLiked,
        likesCount,
      },
    );
  },
);
