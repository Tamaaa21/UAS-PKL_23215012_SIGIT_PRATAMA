import { db, schema } from "@/db";
import { eq, gt } from "drizzle-orm";

export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    // Find existing entry
    const [entry] = await db.select()
      .from(schema.rate_limits)
      .where(eq(schema.rate_limits.id, key))
      .limit(1);

    if (!entry || now > entry.reset_at) {
      // No entry or expired — create new
      await db.insert(schema.rate_limits)
        .values({ id: key, count: 1, reset_at: resetAt })
        .onDuplicateKeyUpdate({ set: { count: 1, reset_at: resetAt } });
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    // Increment count
    const newCount = entry.count + 1;
    await db.update(schema.rate_limits)
      .set({ count: newCount })
      .where(eq(schema.rate_limits.id, key));

    if (newCount > maxAttempts) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: maxAttempts - newCount };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fallback: allow if DB fails
    return { allowed: true, remaining: maxAttempts - 1 };
  }
}

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(async () => {
    try {
      await db.delete(schema.rate_limits)
        .where(gt(schema.rate_limits.reset_at, new Date()));
    } catch {
      // Ignore cleanup errors
    }
  }, 10 * 60 * 1000);
}
