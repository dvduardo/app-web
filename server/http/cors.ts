import { NextResponse } from "next/server";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

export function addCorsHeaders(response: NextResponse, origin?: string | null) {
  const allowedOrigin = getAllowedOrigin(origin);

  if (allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export function handleCorsPreFlight(origin?: string | null) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, origin);
}

function getAllowedOrigin(origin?: string | null): string | null {
  if (!origin) {
    return null;
  }

  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const allowedOrigins =
    configuredOrigins && configuredOrigins.length > 0
      ? configuredOrigins
      : process.env.NODE_ENV === "production"
        ? []
        : DEFAULT_ALLOWED_ORIGINS;

  return allowedOrigins.includes(origin) ? origin : null;
}
