import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../utils/apiError.js";

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * Lightweight in-memory rate limiter middleware factory.
 * @param options Rate limiting configuration (windowMs and max requests per window)
 */
export const rateLimiter = (options: RateLimiterOptions): RequestHandler => {
  const {
    windowMs,
    max,
    message = "Too many requests from this IP, please try again later",
  } = options;

  const hits = new Map<string, ClientRecord>();

  // Periodically clean up expired entries every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const record = hits.get(ip);

    if (!record || now > record.resetTime) {
      hits.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      return next();
    }

    record.count += 1;

    const remaining = Math.max(0, max - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader("Retry-After", retryAfterSeconds);
      return next(ApiError.tooManyRequests(message));
    }

    next();
  };
};

