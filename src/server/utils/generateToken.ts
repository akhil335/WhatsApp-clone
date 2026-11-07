import jwt from "jsonwebtoken";
import { env } from "@/server/env";

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: "365d",
  });
};
