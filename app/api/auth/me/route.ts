import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { addCorsHeaders, handleCorsPreFlight } from "@/app/lib/cors";

export async function OPTIONS() {
  return handleCorsPreFlight();
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return addCorsHeaders(NextResponse.json({ user: null }, { status: 200 }));
  }

  // Get full user data from database
  const fullUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, email: true, name: true },
  });

  if (!fullUser) {
    return addCorsHeaders(NextResponse.json({ user: null }, { status: 200 }));
  }

  return addCorsHeaders(NextResponse.json({ user: fullUser }, { status: 200 }));
}
