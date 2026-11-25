import { likeStatus } from "@/server/controllers/status/likeStatus";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ statusId: string }> }
) {
  await connectDB();

  return likeStatus(req, context);
}
