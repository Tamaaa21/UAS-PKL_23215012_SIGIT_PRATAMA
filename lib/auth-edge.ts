// Edge-compatible auth utilities (no Node.js dependencies)
// Uses HMAC-SHA256 via Web Crypto API

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

// HMAC-SHA256: proper key-derivation signing via Web Crypto API
async function hmacSign(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

export async function verifySessionToken(token: string): Promise<{
  valid: boolean; userId?: string; role?: string; username?: string
}> {
  try {
    const secret = getSecret();
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    const signature = parts.pop()!;
    const payload = parts.join(":");
    const expectedSig = await hmacSign(secret, payload);

    if (!timingSafeEqual(signature, expectedSig)) return { valid: false };

    const [userId, role, username, , timestamp] = parts;
    if (Date.now() - parseInt(timestamp) > SESSION_DURATION_MS) return { valid: false };

    return { valid: true, userId, role, username };
  } catch {
    return { valid: false };
  }
}

export async function createSessionToken(userId: string, role: string, username: string): Promise<string> {
  const secret = getSecret();
  const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, "0")).join("");
  const iat = Date.now();
  const payload = `${userId}:${role}:${username}:${random}:${iat}`;
  const signature = await hmacSign(secret, payload);
  return Buffer.from(payload + ":" + signature).toString("base64url");
}
