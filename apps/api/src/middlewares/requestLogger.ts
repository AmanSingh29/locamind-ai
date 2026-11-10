import type { Request, Response, NextFunction } from "express";

/**
 * Lightweight HTTP request logger middleware
 * Logs: [METHOD] [PATH] [STATUS_CODE] [RESPONSE_TIME_MS]
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = performance.now();

  res.on("finish", () => {
    const duration = (performance.now() - startTime).toFixed(1);
    const statusCode = res.statusCode;
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      console.error(logMessage);
    } else if (statusCode >= 400) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  });

  next();
};

