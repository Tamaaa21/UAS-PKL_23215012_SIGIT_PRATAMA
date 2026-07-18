import crypto from "crypto";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Test-only endpoint: returns captcha text for a given captchaId.
 * This endpoint should NOT exist in production.
 * Only enabled when TEST_MODE=true.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ success: false, message: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const captchaId = searchParams.get("captchaId");

  if (!captchaId) {
    return Response.json({ success: false, message: "captchaId required" }, { status: 400 });
  }

  try {
    const [record] = await db.select()
      .from(schema.captcha_sessions)
      .where(eq(schema.captcha_sessions.id, captchaId))
      .limit(1);

    if (!record) {
      return Response.json({ success: false, message: "Captcha not found" }, { status: 404 });
    }

    return Response.json({ success: true, text: record.text });
  } catch {
    return Response.json({ success: false, message: "Captcha system not available" }, { status: 500 });
  }
}
