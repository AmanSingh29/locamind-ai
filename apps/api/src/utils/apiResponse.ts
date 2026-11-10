import type { Response } from "express";
import { HttpStatus, type HttpStatusCode } from "../constants/httpStatusCodes.js";

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
}

export interface SendSuccessOptions<T = unknown> {
  res: Response;
  data?: T;
  message?: string;
  statusCode?: HttpStatusCode;
}

/**
 * Standardized success response sender
 */
export const sendSuccess = <T = unknown>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: HttpStatusCode = HttpStatus.OK,
): Response => {
  const payload: ApiResponsePayload<T> = {
    success: true,
    timestamp: new Date().toISOString(),
  };

  if (message !== undefined) {
    payload.message = message;
  }

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Convenience helper for 201 Created responses
 */
export const sendCreated = <T = unknown>(
  res: Response,
  data?: T,
  message = "Resource created successfully",
): Response => {
  return sendSuccess(res, data, message, HttpStatus.CREATED);
};

/**
 * Convenience helper for 204 No Content responses
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(HttpStatus.NO_CONTENT).send();
};

