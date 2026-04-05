import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/jwt";
import { prisma } from "@/server/db/prisma";
import { addCorsHeaders, handleCorsPreFlight } from "@/server/http/cors";

export async function OPTIONS(req: Request) {
  return handleCorsPreFlight(req.headers.get("origin"));
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return addCorsHeaders(
      NextResponse.json({ user: null }, { status: 200 }),
      req.headers.get("origin")
    );
  }

  // Get full user data from database
  const fullUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, email: true, name: true },
  });

  if (!fullUser) {
    return addCorsHeaders(
      NextResponse.json({ user: null }, { status: 200 }),
      req.headers.get("origin")
    );
  }

  return addCorsHeaders(
    NextResponse.json({ user: fullUser }, { status: 200 }),
    req.headers.get("origin")
  );
}
