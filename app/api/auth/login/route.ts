import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { verifyPassword } from "@/backend/security/password";
import { generateToken, setAuthCookie } from "@/backend/auth/jwt";
import { addCorsHeaders, handleCorsPreFlight } from "@/backend/http/cors";

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
    return addCorsHeaders(response);
  } catch (error) {
    console.error("Login error:", error);
    return addCorsHeaders(NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ));
  }
}
