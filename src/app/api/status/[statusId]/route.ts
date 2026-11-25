import { deleteStatus } from "@/server/controllers/status/deleteStatus";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  context?: { params?: Promise<{ statusId?: string }> },
) {
  await connectDB();

  return deleteStatus(req, context);
}
