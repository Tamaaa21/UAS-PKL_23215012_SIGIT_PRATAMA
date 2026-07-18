import { NextRequest, NextResponse } from "next/server";
import { login, recordLoginLog } from "@/services/auth.service";
import { getClientIp, getUserAgent } from "@/services/admin.service";
import { setAuthCookie, setCsrfCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity-log";
import crypto from "crypto";
import { loginSchema } from "@/lib/validation";
import { db, schema } from "@/db";
import { eq, lt } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limit: 5 attempts per IP per 1 minute
    const rateCheck = await checkRateLimit(`login:${ip}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      logActivity(null, `Rate limit terlampaui login dari IP: ${ip}`, null);
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "Retry-After": "60",
          },
        }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Username dan password harus diisi" }, { status: 400 });
    }

    // Server-side CAPTCHA validation
    const { captchaId, captchaAnswer } = body;
    if (!captchaId || !captchaAnswer) {
      return NextResponse.json({ success: false, message: "CAPTCHA wajib diisi" }, { status: 400 });
    }

    // Clean expired captchas
    await db.delete(schema.captcha_sessions)
      .where(lt(schema.captcha_sessions.expires_at, new Date()));

    // Find captcha — must not be expired and not already used
    const [captchaRecord] = await db.select()
      .from(schema.captcha_sessions)
      .where(eq(schema.captcha_sessions.id, captchaId))
      .limit(1);

    if (!captchaRecord) {
      return NextResponse.json({ success: false, message: "CAPTCHA tidak valid atau sudah kedaluwarsa" }, { status: 400 });
    }

    // Check if already used
    if (captchaRecord.is_used) {
      return NextResponse.json({ success: false, message: "CAPTCHA sudah digunakan" }, { status: 400 });
    }

    // Mark as used (one-time use)
    await db.update(schema.captcha_sessions)
      .set({ is_used: true })
      .where(eq(schema.captcha_sessions.id, captchaId));

    // Compare captcha (case-insensitive)
    if (captchaRecord.text.toLowerCase() !== captchaAnswer.toLowerCase()) {
      logActivity(null, `CAPTCHA salah dari IP: ${ip}`, parsed.data.username);
      return NextResponse.json({ success: false, message: "CAPTCHA salah" }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const result = await login(username, password, ip);

    if (!result.success) {
      logActivity(null, `Login gagal untuk username: ${parsed.data.username} dari IP: ${ip}`, parsed.data.username);
      const response = result.response;
      response.headers.set("X-RateLimit-Limit", "5");
      response.headers.set("X-RateLimit-Remaining", String(rateCheck.remaining));
      return response;
    }

    recordLoginLog(result.user.id, result.user.username, ip, getUserAgent(request));

    const response = NextResponse.json({ user: result.user, message: "Login berhasil" }, {
      status: 200,
      headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": String(rateCheck.remaining),
      },
    });
    setAuthCookie(response, result.token);
    const csrfToken = crypto.randomBytes(32).toString("hex");
    setCsrfCookie(response, csrfToken);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
