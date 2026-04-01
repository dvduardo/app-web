import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface JWTPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
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
  // In production: use secure cookies (requires HTTPS)
  // For local testing on HTTP: set ALLOW_INSECURE_COOKIES=true
  const allowInsecure = process.env.ALLOW_INSECURE_COOKIES === "true";
  const secure = !allowInsecure && process.env.NODE_ENV === "production";
  
  cookieStore.set("auth", token, {
    httpOnly: true,
    secure: secure,
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
