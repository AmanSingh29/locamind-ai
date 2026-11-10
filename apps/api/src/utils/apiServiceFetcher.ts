import { ApiError } from "./apiError.js";
import { env } from "../config/env.js";
import { HttpStatus, type HttpStatusCode } from "../constants/httpStatusCodes.js";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  baseUrl?: string;
}

/**
 * Common fetch utility that handles URL formatting, timeouts, JSON parsing,
 * and standard error handling for external and microservice calls.
 */
export async function apiServiceFetcher<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    params,
    timeoutMs = env.AI_SERVICE_TIMEOUT_MS,
    baseUrl = env.AI_SERVICE_URL,
    headers,
    ...customConfig
  } = options;

  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${cleanBase}${cleanEndpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((headers as Record<string, string>) || {}),
  };

  let serializedBody: BodyInit | null = null;
  if (body !== undefined && body !== null) {
    if (
      typeof body === "string" ||
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof ArrayBuffer
    ) {
      serializedBody = body as BodyInit;
    } else {
      serializedBody = JSON.stringify(body);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      ...customConfig,
      headers: mergedHeaders,
      body: serializedBody,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
      let errorData: unknown;
      let errorMessage = `Upstream service returned status ${response.status}`;

      try {
        if (isJson) {
          errorData = await response.json();
          if (
            typeof errorData === "object" &&
            errorData !== null &&
            "detail" in errorData &&
            typeof (errorData as { detail: unknown }).detail === "string"
          ) {
            errorMessage = (errorData as { detail: string }).detail;
          } else if (
            typeof errorData === "object" &&
            errorData !== null &&
            "message" in errorData &&
            typeof (errorData as { message: unknown }).message === "string"
          ) {
            errorMessage = (errorData as { message: string }).message;
          }
        } else {
          const text = await response.text();
          if (text.trim()) {
            errorMessage = text.trim();
            errorData = text;
          }
        }
      } catch {
        // Fallback to default status message if body parsing fails
      }

      const validStatusCode =
        response.status >= 400 && response.status <= 599
          ? (response.status as HttpStatusCode)
          : HttpStatus.BAD_GATEWAY;

      throw new ApiError(validStatusCode, errorMessage, errorData);
    }

    if (response.status === HttpStatus.NO_CONTENT) {
      return undefined as T;
    }

    if (isJson) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw ApiError.gatewayTimeout(
        `Request to upstream service timed out after ${timeoutMs}ms`,
      );
    }

    const connectionMessage =
      error instanceof Error ? error.message : "Network error";
    throw ApiError.badGateway(
      `Unable to reach upstream service at ${baseUrl}: ${connectionMessage}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
