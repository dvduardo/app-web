import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user";
import { prisma } from "@/server/db/prisma";
import { addCorsHeaders, handleCorsPreFlight } from "@/server/http/cors";

export async function OPTIONS(req: Request) {
  return handleCorsPreFlight(req.headers.get("origin"));
}

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return addCorsHeaders(
      NextResponse.json({ user: null }, { status: 200 }),
      req.headers.get("origin")
    );
  }

  // Get full user data from database
  const fullUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, email: true, name: true, password: true },
  });

  if (!fullUser) {
    return addCorsHeaders(
      NextResponse.json({ user: null }, { status: 200 }),
      req.headers.get("origin")
    );
  }

  const { password, ...userWithoutPassword } = fullUser;

  return addCorsHeaders(
    NextResponse.json({
      user: {
        ...userWithoutPassword,
        hasPassword: password !== null,
      },
    }, { status: 200 }),
    req.headers.get("origin")
  );
}
