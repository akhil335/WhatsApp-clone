import { markMessageAsSeen } from "@/server/controllers/message/markMessageAsSeen";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  await connectDB();

  return markMessageAsSeen(req);
}
