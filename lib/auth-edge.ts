// Edge-compatible auth utilities using jose JWT
// Used by middleware.ts

import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "admin_token";
export const CSRF_COOKIE_NAME = "csrf_token";
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.TOKEN_SECRET;
  if (!secret || secret === "bmkg-maritim-tegal-secret-change-in-production") {
    throw new Error("TOKEN_SECRET environment variable is not set or still using default value");
  }
  return secret;
}

export async function createSessionToken(userId: string, role: string, username: string): Promise<string> {
  const secret = getSecret();
  const jti = crypto.randomUUID();
  const token = await new SignJWT({ userId, role, username, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(secret));
  return token;
}

export async function verifySessionToken(token: string): Promise<{
  valid: boolean; userId?: string; role?: string; username?: string; jti?: string;
}> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return {
      valid: true,
      userId: payload.userId as string,
      role: payload.role as string,
      username: payload.username as string,
      jti: payload.jti as string,
    };
  } catch {
    return { valid: false };
  }
}
