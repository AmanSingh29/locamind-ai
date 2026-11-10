import { HttpStatus, type HttpStatusCode } from "../constants/httpStatusCodes.js";

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    statusCode: HttpStatusCode,
    message: string,
    details?: unknown,
    isOperational = true,
    stack = "",
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (details !== undefined) {
      this.details = details;
    }

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad Request", details?: unknown): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, details);
  }

  static unauthorized(message = "Unauthorized", details?: unknown): ApiError {
    return new ApiError(HttpStatus.UNAUTHORIZED, message, details);
  }

  static forbidden(message = "Forbidden", details?: unknown): ApiError {
    return new ApiError(HttpStatus.FORBIDDEN, message, details);
  }

  static notFound(message = "Resource Not Found", details?: unknown): ApiError {
    return new ApiError(HttpStatus.NOT_FOUND, message, details);
  }

  static conflict(message = "Conflict", details?: unknown): ApiError {
    return new ApiError(HttpStatus.CONFLICT, message, details);
  }

  static unprocessable(
    message = "Unprocessable Entity",
    details?: unknown,
  ): ApiError {
    return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message, details);
  }

  static tooManyRequests(
    message = "Too many requests, please try again later",
    details?: unknown,
  ): ApiError {
    return new ApiError(HttpStatus.TOO_MANY_REQUESTS, message, details);
  }

  static badGateway(message = "Bad Gateway", details?: unknown): ApiError {
    return new ApiError(HttpStatus.BAD_GATEWAY, message, details);
  }

  static serviceUnavailable(
    message = "Service Unavailable",
    details?: unknown,
  ): ApiError {
    return new ApiError(HttpStatus.SERVICE_UNAVAILABLE, message, details);
  }

  static gatewayTimeout(
    message = "Gateway Timeout",
    details?: unknown,
  ): ApiError {
    return new ApiError(HttpStatus.GATEWAY_TIMEOUT, message, details);
  }

  static internal(
    message = "Internal Server Error",
    details?: unknown,
  ): ApiError {
    return new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      details,
      false,
    );
  }
}

