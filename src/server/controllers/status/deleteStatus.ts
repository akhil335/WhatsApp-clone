import { NextRequest } from "next/server";
import mongoose from "mongoose";
import UserStatus from "@/server/models/UserStatus";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { BadRequestError, NotFoundError } from "@/server/utils/errors";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";

export const deleteStatus = withErrorHandler(
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

    // 2. Atomic delete (only deletes if status belongs to the current user)
    const deletedStatus = await UserStatus.findOneAndDelete({
      _id: statusId,
      user: userId,
    });

    if (!deletedStatus) {
      throw new NotFoundError(
        "Status not found or you don't have permission to delete it",
      );
    }

    return response(200, "Status deleted successfully");
  },
);
