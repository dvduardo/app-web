import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/security/password";
import { generateToken, setAuthCookie } from "@/server/auth/jwt";
import { addCorsHeaders, handleCorsPreFlight } from "@/server/http/cors";
import { loginSchema } from "@/lib/schemas/auth";
import { logRequest, logRequestError } from "@/server/logging/request";

export async function OPTIONS() {
  return handleCorsPreFlight();
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const response = addCorsHeaders(NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      ), req.headers.get("origin"));
      logRequest(req, startedAt, response);
      return response;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const response = addCorsHeaders(NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      ), req.headers.get("origin"));
      logRequest(req, startedAt, response);
      return response;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      const response = addCorsHeaders(NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      ), req.headers.get("origin"));
      logRequest(req, startedAt, response, { userId: user.id });
      return response;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );

    await setAuthCookie(token);
    const finalResponse = addCorsHeaders(response, req.headers.get("origin"));
    logRequest(req, startedAt, finalResponse, { userId: user.id });
    return finalResponse;
  } catch (error) {
    logRequestError(req, startedAt, error);
    const response = addCorsHeaders(NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ), req.headers.get("origin"));
    logRequest(req, startedAt, response);
    return response;
  }
}
