import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/security/password";
import { generateToken, setAuthCookie } from "@/server/auth/jwt";
import { addCorsHeaders, handleCorsPreFlight } from "@/server/http/cors";

export async function OPTIONS() {
  return handleCorsPreFlight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return addCorsHeaders(NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      ));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return addCorsHeaders(NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      ));
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return addCorsHeaders(NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      ));
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
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("Login error:", error);
    return addCorsHeaders(NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ), req.headers.get("origin"));
  }
}
