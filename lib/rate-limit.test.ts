import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    })),
    insert: vi.fn(() => ({ onDuplicateKeyUpdate: vi.fn().mockResolvedValue([]) })),
    update: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue([]),
  },
  schema: {
    rate_limits: { id: "id", count: "count", reset_at: "reset_at" },
  },
}));

import { checkRateLimit } from "./rate-limit";

describe("rate-limit (MySQL)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow first request (no entry)", async () => {
    const result = await checkRateLimit("rl-mysql-test-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should handle DB errors gracefully", async () => {
    const db = (await import("@/db")).db;
    (db.select as any).mockImplementation(() => { throw new Error("DB error"); });
    const result = await checkRateLimit("rl-mysql-test-2");
    expect(result.allowed).toBe(true);
  });
});
