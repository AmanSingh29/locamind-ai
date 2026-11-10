import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware that attaches a unique correlation ID to every incoming request
 * and propagates it in the response headers.
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const headerId = req.headers["x-request-id"];
  const id =
    typeof headerId === "string" && headerId.trim()
      ? headerId.trim()
      : randomUUID();

  req.id = id;
  res.setHeader("x-request-id", id);

  next();
};

