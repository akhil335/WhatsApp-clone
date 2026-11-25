import { createStatus } from "@/server/controllers/status/createStatus";
import { getStatus } from "@/server/controllers/status/getStatus";
import { connectDB } from "@/server/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();

  return getStatus(req);
}

export async function POST(req: NextRequest) {
  await connectDB();

  return createStatus(req);
}
