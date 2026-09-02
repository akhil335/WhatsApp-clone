import { getAllConversations } from "@/server/controllers/conversation/getAllConversations";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB()
  
  return getAllConversations(req);
}