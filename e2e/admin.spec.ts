import { test, expect } from "@playwright/test";

const ADMIN = { username: "admin", password: "admin123" };

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
});

// ═══════════════════════════════════════════
// ADMIN PAGES (via API auth)
// ═══════════════════════════════════════════

test.describe("Admin - Semua Halaman", () => {
  test.beforeAll(async ({ request }) => {
    let resp = await request.post("/api/admin/login", { data: ADMIN });
    if (resp.status() === 429) {
      // Rate limited, wait and retry
      await new Promise(r => setTimeout(r, 65000));
      resp = await request.post("/api/admin/login", { data: ADMIN });
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
// FRONTEND PUBLIC PAGES
// ═══════════════════════════════════════════

test.describe("Frontend - Halaman Publik", () => {
  const publicPages = [
    "/",
    "/about",
    "/prakiraan",
    "/layanan",
    "/kegiatan",
    "/kontak",
    "/buku_tamu",
    "/about/struktur-organisasi",
  ];

  for (const p of publicPages) {
    test(`${p} return 200`, async ({ page }) => {
      const resp = await page.goto(p);
      expect(resp?.status()).toBe(200);
    });
  }
});

// ═══════════════════════════════════════════
// DISPLAY PAGE
// ═══════════════════════════════════════════

test.describe("Frontend - Display", () => {
  test("display page return 200", async ({ page }) => {
    const resp = await page.goto("/display");
    expect(resp?.status()).toBe(200);
  });
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
  test("login valid return 200", async ({ request }) => {
    const resp = await request.post("/api/admin/login", { data: ADMIN });
    expect(resp.status()).toBe(200);
  });

  test("login invalid return 401", async ({ request }) => {
    const resp = await request.post("/api/admin/login", { data: { username: "wrong", password: "wrong" } });
    expect(resp.status()).toBe(401);
  });

  test("login empty return 400", async ({ request }) => {
    const resp = await request.post("/api/admin/login", { data: {} });
    expect(resp.status()).toBe(400);
  });
});

// ═══════════════════════════════════════════
// API RATE LIMITING
// ═══════════════════════════════════════════

test.describe("API - Rate Limiting", () => {
  test("6 percobaan login gagal kena 429", async ({ request }) => {
    for (let i = 0; i < 5; i++) {
      await request.post("/api/admin/login", { data: { username: "admin", password: "wrong" } });
    }
    const resp = await request.post("/api/admin/login", { data: { username: "admin", password: "wrong" } });
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
