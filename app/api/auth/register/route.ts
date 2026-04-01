import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword, verifyPassword } from "@/app/lib/password";
import { generateToken, setAuthCookie } from "@/app/lib/auth";
import { addCorsHeaders, handleCorsPreFlight } from "@/app/lib/cors";

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

    console.log("Attempting to register user:", email);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return addCorsHeaders(NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      ));
    }

    console.log("User does not exist, hashing password...");
    const hashedPassword = await hashPassword(password);
    
    console.log("Creating user in database...");
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log("User created successfully:", user.id);

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
      { status: 201 }
    );

    await setAuthCookie(token);
    return addCorsHeaders(response);
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : String(error));
    return addCorsHeaders(NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    ));
  }
}
