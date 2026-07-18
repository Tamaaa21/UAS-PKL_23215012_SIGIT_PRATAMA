import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: "test-captcha-id", text: "ABC123" }]),
    })),
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue([]), onDuplicateKeyUpdate: vi.fn().mockResolvedValue([]) })),
    update: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue([]),
  },
  schema: {
    users: { id: "id", username: "username", password: "password", role: "role", nama: "nama", is_active: "is_active", created_at: "created_at" },
    login_logs: { id: "id", user_id: "user_id", username: "username", ip_address: "ip_address", user_agent: "user_agent", aktivitas: "aktivitas" },
    captcha_sessions: { id: "id", text: "text", expires_at: "expires_at" },
    rate_limits: { id: "id", count: "count", reset_at: "reset_at" },
  },
}));

vi.mock("@/services/auth.service", () => ({
  login: vi.fn(),
  recordLoginLog: vi.fn(),
}));

vi.mock("@/services/admin.service", () => ({
  getUserId: vi.fn(() => "user-admin-1"),
  getUsername: vi.fn(() => "admin"),
  getRole: vi.fn(() => "admin"),
  isAdmin: vi.fn(() => true),
  getClientIp: vi.fn(() => "test-ratelimit-ip"),
  getUserAgent: vi.fn(() => "Mozilla/5.0"),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { POST as loginPOST } from "./login/route";
import { createMockRequest } from "../test-utils";

function makeLoginRequest() {
  return createMockRequest({
    method: "POST",
    body: { username: "admin", password: "wrong", captchaId: "test-captcha-id", captchaAnswer: "ABC123" },
    headers: { "content-type": "application/json", "x-forwarded-for": "test-ratelimit-ip" },
  });
}

describe("Rate Limiting — Login Endpoint (MySQL)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow first 5 attempts", async () => {
    const { login } = await import("@/services/auth.service");
    vi.mocked(login).mockResolvedValue({
      success: false,
      response: new Response(JSON.stringify({ message: "Username atau password salah" }), { status: 401 }) as any,
    });

    for (let i = 0; i < 5; i++) {
      const req = makeLoginRequest();
      const response = await loginPOST(req);
      expect(response.status).not.toBe(429);
    }
  });
});
