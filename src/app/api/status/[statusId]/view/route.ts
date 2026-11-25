import { viewStatus } from "@/server/controllers/status/viewStatus";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ statusId: string }> }
) {
  await connectDB();

  return viewStatus(req, context);
}
