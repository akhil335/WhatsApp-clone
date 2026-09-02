
import { updateProfile } from "@/server/controllers/profile/updateProfile";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  await connectDB()
  
  return updateProfile(req);
}