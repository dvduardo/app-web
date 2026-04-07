import { NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  type AuthenticatedUser,
} from "@/server/auth/get-authenticated-user";

export async function requireUser(): Promise<
  { user: AuthenticatedUser; response: null } | { user: null; response: NextResponse }
> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user, response: null };
}
