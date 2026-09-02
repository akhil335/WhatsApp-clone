import { NextResponse } from "next/server";

export const response = (
  statusCode: number,
  message: string,
  data: any = null
) => {
  return NextResponse.json(
    {
      status: statusCode < 400 ? "success" : "error",
      message,
      data,
    },
    { status: statusCode }
  );
};