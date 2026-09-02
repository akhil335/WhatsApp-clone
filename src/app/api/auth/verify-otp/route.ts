import { verifyOtp } from "@/server/controllers/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return verifyOtp(req);
}