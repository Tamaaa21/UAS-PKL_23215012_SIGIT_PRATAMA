import { test, expect, type APIRequestContext } from "@playwright/test";

const ADMIN = { username: "admin", password: "admin123" };

async function loginWithCaptcha(request: APIRequestContext) {
  // 1. Get captcha
  const captchaRes = await request.get("/api/captcha");
  const captchaData = await captchaRes.json();
  const captchaId = captchaData.captchaId;

  // 2. Get captcha text (test-only endpoint)
  const textRes = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
  const textData = await textRes.json();
  const captchaAnswer = textData.text;

  // 3. Login with captcha
  return request.post("/api/admin/login", {
    data: { ...ADMIN, captchaId, captchaAnswer },
  });
}

// ═══════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════

test.describe("Autentikasi", () => {
  test("redirect ke login jika belum login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/admin\/login/);
  });

  test("halaman login bisa diakses", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("form")).toBeVisible();
  });

  test("login tanpa captcha return 400", async ({ request }) => {
    const resp = await request.post("/api/admin/login", {
      data: { username: "admin", password: "admin123" },
    });
    expect(resp.status()).toBe(400);
  });

  test("login dengan captcha salah return 400", async ({ request }) => {
    const captchaRes = await request.get("/api/captcha");
    const { captchaId } = await captchaRes.json();

    const resp = await request.post("/api/admin/login", {
      data: { username: "admin", password: "admin123", captchaId, captchaAnswer: "WRONG" },
    });
    expect(resp.status()).toBe(400);
  });
});

// ═══════════════════════════════════════════
// ADMIN PAGES (via API auth with captcha)
// ═══════════════════════════════════════════

test.describe("Admin - Semua Halaman", () => {
  test.beforeAll(async ({ request }) => {
    let resp = await loginWithCaptcha(request);
    if (resp.status() === 429) {
      await new Promise(r => setTimeout(r, 65000));
      resp = await loginWithCaptcha(request);
    }
    expect(resp.status()).toBe(200);
  });

  const adminPages = [
    "/admin/dashboard",
    "/admin/prakiraan-manager",
    "/admin/publikasi-manager",
    "/admin/kegiatan-manager",
    "/admin/hero-manager",
    "/admin/struktur-organisasi",
    "/admin/buku-tamu",
    "/admin/layanan",
    "/admin/display-manager",
    "/admin/login-history",
    "/admin/pengaturan",
  ];

  for (const p of adminPages) {
    test(`${p} memuat dengan benar`, async ({ page }) => {
      const resp = await page.goto(p);
      expect(resp?.status()).toBe(200);
    });
  }
});

// ═══════════════════════════════════════════
// API PUBLIC ENDPOINTS
// ═══════════════════════════════════════════

test.describe("API - Public Endpoints", () => {
  const endpoints = [
    "/api/admin/hero-images",
    "/api/admin/prakiraan-images",
    "/api/admin/prakiraan-categories",
    "/api/admin/kegiatan-documents",
    "/api/admin/layanan-cards",
    "/api/admin/struktur-organisasi",
    "/api/admin/display",
    "/api/publications",
    "/api/bmkg/tegal",
  ];

  for (const ep of endpoints) {
    test(`GET ${ep} return 200`, async ({ request }) => {
      const resp = await request.get(ep);
      expect(resp.status()).toBe(200);
    });
  }
});

// ═══════════════════════════════════════════
// API AUTH
// ═══════════════════════════════════════════

test.describe("API - Auth", () => {
  test("login valid dengan captcha return 200", async ({ request }) => {
    const resp = await loginWithCaptcha(request);
    expect(resp.status()).toBe(200);
  });

  test("login invalid return 401", async ({ request }) => {
    const captchaRes = await request.get("/api/captcha");
    const { captchaId } = await captchaRes.json();
    const textRes = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
    const { text: captchaAnswer } = await textRes.json();

    const resp = await request.post("/api/admin/login", {
      data: { username: "wrong", password: "wrong", captchaId, captchaAnswer },
    });
    expect(resp.status()).toBe(401);
  });

  test("login empty return 400 or 429", async ({ request }) => {
    const resp = await request.post("/api/admin/login", { data: {} });
    // Rate limit may kick in before validation
    expect([400, 429]).toContain(resp.status());
  });
});

// ═══════════════════════════════════════════
// API CAPTCHA
// ═══════════════════════════════════════════

test.describe("API - Captcha", () => {
  test("GET /api/captcha return captchaId", async ({ request }) => {
    const resp = await request.get("/api/captcha");
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.captchaId).toBeDefined();
  });

  test("GET /api/captcha/test return text", async ({ request }) => {
    const captchaRes = await request.get("/api/captcha");
    const { captchaId } = await captchaRes.json();

    const resp = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.text).toBeDefined();
    expect(data.text.length).toBe(6);
  });

  test("captcha text can be read", async ({ request }) => {
    const captchaRes = await request.get("/api/captcha");
    const { captchaId } = await captchaRes.json();

    const textRes = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
    expect(textRes.status()).toBe(200);
    const data = await textRes.json();
    expect(data.text.length).toBe(6);
  });

  test("captcha with invalid id returns 404", async ({ request }) => {
    const resp = await request.get("/api/captcha/test?captchaId=nonexistent-id");
    expect(resp.status()).toBe(404);
  });
});

// ═══════════════════════════════════════════
// API RATE LIMITING
// ═══════════════════════════════════════════

test.describe("API - Rate Limiting", () => {
  test("6 percobaan login gagal kena 429", async ({ request }) => {
    for (let i = 0; i < 5; i++) {
      const captchaRes = await request.get("/api/captcha");
      const { captchaId } = await captchaRes.json();
      const textRes = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
      const { text: captchaAnswer } = await textRes.json();

      await request.post("/api/admin/login", {
        data: { username: "admin", password: "wrong", captchaId, captchaAnswer },
      });
    }

    const captchaRes = await request.get("/api/captcha");
    const { captchaId } = await captchaRes.json();
    const textRes = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
    const { text: captchaAnswer } = await textRes.json();

    const resp = await request.post("/api/admin/login", {
      data: { username: "admin", password: "wrong", captchaId, captchaAnswer },
    });
    expect(resp.status()).toBe(429);
  });
});

// ═══════════════════════════════════════════
// API UNAUTHORIZED
// ═══════════════════════════════════════════

test.describe("API - Unauthorized", () => {
  test("GET /api/admin/users tanpa auth return 401", async ({ request }) => {
    const resp = await request.get("/api/admin/users");
    expect(resp.status()).toBe(401);
  });

  test("GET /api/admin/stats/users tanpa auth return 401", async ({ request }) => {
    const resp = await request.get("/api/admin/stats/users");
    expect(resp.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════
// API BUKU TAMU
// ═══════════════════════════════════════════

test.describe("API - Buku Tamu", () => {
  test("submit valid return 200", async ({ request }) => {
    const resp = await request.post("/api/submit/buku-tamu", {
      data: { nama: "Playwright Test", email: "test@playwright.com", no_telepon: "08123456789", keperluan: "Testing" },
    });
    expect(resp.status()).toBe(200);
  });

  test("submit invalid email return 400", async ({ request }) => {
    const resp = await request.post("/api/submit/buku-tamu", {
      data: { nama: "Test", email: "not-email", no_telepon: "08123456789", keperluan: "Test" },
    });
    expect(resp.status()).toBe(400);
  });
});
