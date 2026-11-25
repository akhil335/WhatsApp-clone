import { deleteMessage } from "@/server/controllers/message/deleteMessage";
import { sendMessage } from "@/server/controllers/message/sendMessage";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();

  return sendMessage(req);
}

export async function DELETE(req: NextRequest) {
  await connectDB();

  return deleteMessage(req);
}
