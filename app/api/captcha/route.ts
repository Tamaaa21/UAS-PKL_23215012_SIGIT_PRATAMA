import crypto from "crypto";
import { db, schema } from "@/db";
import { eq, lt } from "drizzle-orm";

export const runtime = "nodejs";

const CAPTCHA_LENGTH = 6;
const CAPTCHA_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function generateCaptchaText(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    // Clean expired AND used captchas
    try {
      await db.delete(schema.captcha_sessions)
        .where(lt(schema.captcha_sessions.expires_at, new Date()));
    } catch {
      // Table might not exist yet, skip cleanup
    }

    const id = crypto.randomUUID();
    const text = generateCaptchaText();
    const expiresAt = new Date(Date.now() + CAPTCHA_EXPIRY_MS);

    await db.insert(schema.captcha_sessions).values({
      id,
      text,
      is_used: false,
      expires_at: expiresAt,
    });

    return Response.json({ success: true, captchaId: id });
  } catch (error) {
    console.error("Gagal generate captcha:", error);
    return Response.json({ success: false, message: "Gagal generate captcha" }, { status: 500 });
  }
}
