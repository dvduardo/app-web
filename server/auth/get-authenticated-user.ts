import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { getCurrentUser } from "@/server/auth/jwt";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name?: string;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("outside a request scope")) {
      throw error;
    }
  }

  if (session?.user?.id && session.user.email) {
    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? undefined,
    };
  }

  const legacyUser = await getCurrentUser();
  if (!legacyUser) {
    return null;
  }

  return legacyUser;
}
