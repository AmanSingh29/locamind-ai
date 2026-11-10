import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../utils/apiError.js";

export type ValidationFn<T = unknown> = (
  body: T,
) => string | string[] | null | undefined;

/**
 * Middleware factory to validate request body
 * @param validator Function returning error message(s) or null/undefined if valid
 */
export const validateBody = <T = unknown>(
  validator: ValidationFn<T>,
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors = validator(req.body as T);

    if (errors) {
      const errorList = Array.isArray(errors) ? errors : [errors];
      if (errorList.length > 0) {
        next(ApiError.badRequest("Validation failed", errorList));
        return;
      }
    }

    next();
  };
};

