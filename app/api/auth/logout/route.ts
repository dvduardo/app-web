import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/app/lib/auth";
import { addCorsHeaders, handleCorsPreFlight } from "@/app/lib/cors";

export async function OPTIONS() {
  return handleCorsPreFlight();
}

export async function POST(req: NextRequest) {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  await clearAuthCookie();
  return addCorsHeaders(response);
}
