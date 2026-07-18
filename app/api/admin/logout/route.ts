import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clearAuthCookie, clearCsrfCookie, blacklistToken, verifySessionToken } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { getUserId, getUsername } from "@/services/admin.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    logActivity(getUserId(request), "Logout dari panel admin", getUsername(request));
  } catch {
    // ignore log errors on logout
  }

  // Blacklist the token before clearing cookies
  const token = request.cookies.get("admin_token")?.value;
  if (token) {
    try {
      const result = await verifySessionToken(token);
      if (result.valid && result.jti) {
        // Token expires in 24h, blacklist until then
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await blacklistToken(result.jti, expiresAt);
      }
    } catch {
      // ignore blacklist errors
    }
  }

  const response = NextResponse.json({ success: true, message: "Logout berhasil" });
  clearAuthCookie(response);
  clearCsrfCookie(response);
  return response;
}
