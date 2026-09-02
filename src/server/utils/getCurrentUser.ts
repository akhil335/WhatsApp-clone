import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const getCurrentUserId = async () => {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as { userId?: string };

  if (!decoded.userId) {
    throw new Error("Invalid token");
  }

  return decoded.userId;
};