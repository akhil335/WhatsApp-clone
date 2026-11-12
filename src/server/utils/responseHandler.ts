import { NextResponse } from "next/server";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data?: T;
}

export const response = <T = unknown>(
  statusCode: number,
  message: string,
  data?: T,
) => {
  return NextResponse.json<ApiResponse<T>>(
    {
      status: statusCode < 400 ? "success" : "error",
      message,
      data,
    },
    { status: statusCode },
  );
};
