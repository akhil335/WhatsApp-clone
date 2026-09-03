import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const getCurrentUserId = async () => {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  const decoded = jwt.verify(token, jwtSecret) as { userId?: string };

  if (!decoded.userId) {
    throw new Error("Invalid token");
  }

  return decoded.userId;
};