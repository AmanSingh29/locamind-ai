import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

/**
 * 404 handler for any requested routes that do not match registered endpoints
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};

