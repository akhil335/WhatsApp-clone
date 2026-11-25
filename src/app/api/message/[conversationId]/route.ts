import { getConversationMessages } from "@/server/controllers/message/getConversationMessages";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  await connectDB();

  return getConversationMessages(req, context);
}
