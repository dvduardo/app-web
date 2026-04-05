import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/server/auth/jwt";
import { addCorsHeaders, handleCorsPreFlight } from "@/server/http/cors";

export async function OPTIONS(req: Request) {
  return handleCorsPreFlight(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  await clearAuthCookie();
  return addCorsHeaders(response, req.headers.get("origin"));
}
