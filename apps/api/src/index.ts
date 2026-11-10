import express from "express";
import cors from "cors";

import { env } from "./config/index.js";
import routes from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler,
  requestId,
  requestLogger,
  securityHeaders,
} from "./middlewares/index.js";
import { checkAIHealth } from "./services/index.js";
import { asyncHandler, sendSuccess } from "./utils/index.js";

const app = express();

// Security and utility middlewares
app.use(securityHeaders);
app.use(requestId);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP Request logging
app.use(requestLogger);

// Liveness health check
app.get("/health", (_req, res) => {
  sendSuccess(
    res,
    {
      service: "LocalMind API",
      status: "healthy",
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
    },
    "Service is live",
  );
});

// Readiness check (probes upstream AI microservice)
app.get(
  "/health/ready",
  asyncHandler(async (_req, res) => {
    let upstreamStatus = "unknown";
    try {
      const upstream = await checkAIHealth();
      upstreamStatus = upstream.status || "healthy";
    } catch {
      upstreamStatus = "unreachable";
    }

    sendSuccess(
      res,
      {
        service: "LocalMind API",
        status: upstreamStatus === "healthy" ? "ready" : "degraded",
        dependencies: {
          aiService: {
            url: env.AI_SERVICE_URL,
            status: upstreamStatus,
          },
        },
      },
      upstreamStatus === "healthy"
        ? "All dependencies healthy"
        : "Some dependencies unreachable",
    );
  }),
);

// API Routes
app.use("/api", routes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

// Server startup
const server = app.listen(env.PORT, () => {
  console.log(
    `[LocalMind API] Running on port ${env.PORT} in ${env.NODE_ENV} mode`,
  );
});

// Graceful shutdown handling
const handleGracefulShutdown = (signal: string): void => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  // Force close if graceful shutdown takes longer than 10s
  setTimeout(() => {
    console.error("Forcing shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

// Unhandled process-level error safety nets
process.on("uncaughtException", (error: Error) => {
  console.error("CRITICAL: Uncaught Exception detected:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("CRITICAL: Unhandled Promise Rejection:", reason);
});

export default app;
