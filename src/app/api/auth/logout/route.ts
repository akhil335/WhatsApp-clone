import { logout } from "@/server/controllers/auth";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  return logout(req);
}
