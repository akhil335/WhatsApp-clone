import { NextRequest } from "next/server";
import mongoose from "mongoose";
import UserStatus from "@/server/models/UserStatus";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { BadRequestError, NotFoundError } from "@/server/utils/errors";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";

export const viewStatus = withErrorHandler(
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

    // 3. Check ownership and prior views
    const isOwner = status.user.toString() === userId.toString();
    const alreadyViewed = status.viewers.some(
      (v: any) => v.user.toString() === userId.toString(),
    );

    // 4. Only record view if viewer is NOT the owner and hasn't viewed yet
    if (!isOwner && !alreadyViewed) {
      await UserStatus.findByIdAndUpdate(statusId, {
        $push: {
          viewers: {
            user: userId,
            viewedAt: new Date(),
          },
        },
      });
    }

    return response(200, "Status viewed successfully", {
      statusId,
      alreadyViewed: isOwner || alreadyViewed,
    });
  },
);
