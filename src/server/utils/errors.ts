/**
 * Base Application Error
 * All custom domain errors inherit from this class.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;

    // Captures proper stack trace in V8 engines (Node.js)
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 * Use when user input is invalid, missing, or malformed.
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized
 * Use when user is not authenticated (missing or invalid token).
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden
 * Use when user is authenticated, but does not have permission to view or edit this resource.
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

/**
 * 404 Not Found
 * Use when a requested user, message, or conversation does not exist.
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * 409 Conflict
 * Use when duplicate data is detected (e.g., phone number or email already in use).
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflict: Resource already exists") {
    super(message, 409);
  }
}

