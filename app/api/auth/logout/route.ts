import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/backend/auth/jwt";
import { addCorsHeaders, handleCorsPreFlight } from "@/backend/http/cors";

export async function OPTIONS() {
  return handleCorsPreFlight();
}

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  await clearAuthCookie();
  return addCorsHeaders(response);
}
