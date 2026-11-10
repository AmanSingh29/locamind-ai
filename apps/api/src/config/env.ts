import "dotenv/config";

export interface EnvConfig {
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
  AI_SERVICE_URL: string;
  FRONTEND_URL: string;
  AI_SERVICE_TIMEOUT_MS: number;
}

const parsePort = (value: string | undefined, defaultPort: number): number => {
  if (!value) return defaultPort;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultPort : parsed;
};

export const env: EnvConfig = {
  PORT: parsePort(process.env["PORT"], 4000),
  NODE_ENV: (process.env["NODE_ENV"] as EnvConfig["NODE_ENV"]) || "development",
  AI_SERVICE_URL: process.env["AI_SERVICE_URL"] || "http://127.0.0.1:8000",
  FRONTEND_URL: process.env["FRONTEND_URL"] || "http://localhost:3000",
  AI_SERVICE_TIMEOUT_MS: parsePort(process.env["AI_SERVICE_TIMEOUT_MS"], 120000),
};

