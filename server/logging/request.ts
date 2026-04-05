import type { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

export interface RequestLogContext {
  method: string;
  path: string;
  userId?: string;
  statusCode?: number;
  durationMs?: number;
  error?: unknown;
}

type RequestLike = Pick<NextRequest, "method" | "nextUrl">;

export function logRequest(
  request: RequestLike,
  startedAt: number,
  response: NextResponse,
  extra: Partial<RequestLogContext> = {}
) {
  logger.info({
    method: request.method,
    path: request.nextUrl.pathname,
    userId: extra.userId,
    statusCode: response.status,
    durationMs: Date.now() - startedAt,
  });
}

export function logRequestError(
  request: RequestLike,
  startedAt: number,
  error: unknown,
  extra: Partial<RequestLogContext> = {}
) {
  logger.error({
    method: request.method,
    path: request.nextUrl.pathname,
    userId: extra.userId,
    durationMs: Date.now() - startedAt,
    error,
  });
}
