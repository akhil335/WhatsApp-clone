import { sendOtp } from "@/server/controllers/auth";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB()
  
  return sendOtp(req);
}