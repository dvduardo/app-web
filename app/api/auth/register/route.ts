import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/security/password";
import { addCorsHeaders, handleCorsPreFlight } from "@/server/http/cors";
import { registerServerSchema } from "@/lib/schemas/auth";
import { logRequest, logRequestError } from "@/server/logging/request";

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight(req.headers.get("origin"));
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await req.json();
    const parsed = registerServerSchema.safeParse(body);

    if (!parsed.success) {
      const response = addCorsHeaders(NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      ), req.headers.get("origin"));
      logRequest(req, startedAt, response);
      return response;
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const response = addCorsHeaders(NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      ), req.headers.get("origin"));
      logRequest(req, startedAt, response);
      return response;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );

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
