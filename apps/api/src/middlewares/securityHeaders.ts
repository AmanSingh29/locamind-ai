import type { Request, Response, NextFunction } from "express";

/**
 * Standard OWASP security headers middleware
 */
export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.removeHeader("X-Powered-By");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "no-referrer");

  next();
};

