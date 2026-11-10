import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";
import { HttpStatus, type HttpStatusCode } from "../constants/httpStatusCodes.js";

interface ErrorResponsePayload {
  success: false;
  statusCode: number;
  message: string;
  errors?: unknown;
  stack?: string;
  timestamp: string;
  path: string;
}

/**
 * Global centralized error handling middleware.
 * Formats errors uniformly, preserves operational error details,
 * and prints/returns full stack traces in development.
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // Express identifies error middleware by the 4-argument signature (including next)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = "An unexpected internal server error occurred";
  let details: unknown | undefined;
  let isOperational = false;
  let stack = "";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    isOperational = err.isOperational;
    stack = err.stack || "";
  } else if (err instanceof SyntaxError && "body" in err) {
    // Malformed JSON payload in express.json()
    statusCode = HttpStatus.BAD_REQUEST;
    message = "Malformed JSON in request body";
    isOperational = true;
    stack = err.stack || "";
  } else if (err instanceof Error) {
    message = err.message || message;
    stack = err.stack || "";
  }

  // Log error details for server diagnostics
  const logPrefix = `[${new Date().toISOString()}] [${req.method}] ${req.originalUrl}`;
  if (statusCode >= 500) {
    console.error(`${logPrefix} - Server Error (${statusCode}):`, stack || err);
  } else {
    console.warn(`${logPrefix} - Client Error (${statusCode}): ${message}`);
  }

  const isDevelopment = env.NODE_ENV !== "production";

  // Hide internal server error specifics from clients in production
  const clientMessage =
    !isOperational && !isDevelopment && statusCode === HttpStatus.INTERNAL_SERVER_ERROR
      ? "An internal server error occurred"
      : message;

  const responsePayload: ErrorResponsePayload = {
    success: false,
    statusCode,
    message: clientMessage,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  if (details !== undefined) {
    responsePayload.errors = details;
  }

  if (isDevelopment && stack) {
    responsePayload.stack = stack;
  }

  res.status(statusCode).json(responsePayload);
};

