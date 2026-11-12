import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { response } from "./responseHandler";

/**
 * Route handler function type signature.
 * Accepts NextRequest and optional route context (such as params).
 */
export type RouteHandler<TContext = any> = (
  req: NextRequest,
  context?: TContext
) => Promise<NextResponse> | NextResponse;

/**
 * Centralized API Error Handling Wrapper.
 * Wraps any Next.js route or controller with automatic try/catch and error formatting.
 */
export const withErrorHandler = <TContext = any>(
  handler: RouteHandler<TContext>
): RouteHandler<TContext> => {
  return async (req: NextRequest, context?: TContext) => {
    try {
      return await handler(req, context);
    } catch (err: unknown) {
      console.error("❌ API Error:", err);

      // 1. Handled Domain Errors (throw new NotFoundError, UnauthorizedError, etc.)
      if (err instanceof AppError) {
        return response(err.statusCode, err.message);
      }

      // 2. Zod Schema Validation Errors
      if (err instanceof ZodError) {
        const firstError = err.issues[0]?.message || "Validation failed";
        return response(400, firstError, err.format());
      }

      // 3. JWT Authentication Errors
      if (err instanceof Error) {
        if (err.name === "JsonWebTokenError") {
          return response(401, "Invalid token");
        }
        if (err.name === "TokenExpiredError") {
          return response(401, "Token has expired");
        }
        if (err.message === "Unauthorized" || err.message === "Invalid token") {
          return response(401, err.message);
        }
      }

      // 4. MongoDB Duplicate Key Error (Code 11000)
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: number }).code === 11000
      ) {
        return response(409, "A record with this unique field already exists");
      }

      // 5. Fallback for unhandled unexpected crashes
      return response(500, "Internal server error");
    }
  };
};
