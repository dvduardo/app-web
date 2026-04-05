import { NextResponse } from "next/server";
import { getCurrentUser, type JWTPayload } from "@/backend/auth/jwt";

export async function requireUser(): Promise<
  { user: JWTPayload; response: null } | { user: null; response: NextResponse }
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user, response: null };
}
