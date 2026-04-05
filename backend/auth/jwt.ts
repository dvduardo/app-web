import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export interface JWTPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth")?.value || null;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const allowInsecure = process.env.ALLOW_INSECURE_COOKIES === "true";
  const secure = !allowInsecure && process.env.NODE_ENV === "production";

  cookieStore.set("auth", token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth");
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

function getJwtSecret(): string {
  const configuredSecret = process.env.JWT_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "test") {
    return "test-jwt-secret";
  }

  throw new Error("JWT_SECRET environment variable is required");
}
