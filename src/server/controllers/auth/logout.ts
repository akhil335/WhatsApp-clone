import { response } from "@/server/utils/responseHandler";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const logout = withErrorHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");

  return response(200, "Logged out successfully");
});
