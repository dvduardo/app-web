import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { hashPassword } from "@/backend/security/password";
import { addCorsHeaders, handleCorsPreFlight } from "@/backend/http/cors";

export async function OPTIONS() {
  return handleCorsPreFlight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return addCorsHeaders(NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      ));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return addCorsHeaders(NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      ));
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

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Registration error:", error);
    return addCorsHeaders(NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ));
  }
}
