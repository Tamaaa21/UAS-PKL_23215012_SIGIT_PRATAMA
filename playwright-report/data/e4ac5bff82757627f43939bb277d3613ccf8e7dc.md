# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> API - Auth >> login valid dengan captcha return 200
- Location: e2e/admin.spec.ts:121:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 400
```

# Test source

```ts
  23  | // AUTHENTICATION
  24  | // ═══════════════════════════════════════════
  25  | 
  26  | test.describe("Autentikasi", () => {
  27  |   test("redirect ke login jika belum login", async ({ page }) => {
  28  |     await page.goto("/admin/dashboard");
  29  |     await expect(page).toHaveURL(/admin\/login/);
  30  |   });
  31  | 
  32  |   test("halaman login bisa diakses", async ({ page }) => {
  33  |     await page.goto("/admin/login");
  34  |     await expect(page.locator("form")).toBeVisible();
  35  |   });
  36  | 
  37  |   test("login tanpa captcha return 400", async ({ request }) => {
  38  |     const resp = await request.post("/api/admin/login", {
  39  |       data: { username: "admin", password: "admin123" },
  40  |     });
  41  |     expect(resp.status()).toBe(400);
  42  |   });
  43  | 
  44  |   test("login dengan captcha salah return 400", async ({ request }) => {
  45  |     const captchaRes = await request.get("/api/captcha");
  46  |     const { captchaId } = await captchaRes.json();
  47  | 
  48  |     const resp = await request.post("/api/admin/login", {
  49  |       data: { username: "admin", password: "admin123", captchaId, captchaAnswer: "WRONG" },
  50  |     });
  51  |     expect(resp.status()).toBe(400);
  52  |   });
  53  | });
  54  | 
  55  | // ═══════════════════════════════════════════
  56  | // ADMIN PAGES (via API auth with captcha)
  57  | // ═══════════════════════════════════════════
  58  | 
  59  | test.describe("Admin - Semua Halaman", () => {
  60  |   test.beforeAll(async ({ request }) => {
  61  |     let resp = await loginWithCaptcha(request);
  62  |     if (resp.status() === 429) {
  63  |       await new Promise(r => setTimeout(r, 65000));
  64  |       resp = await loginWithCaptcha(request);
  65  |     }
  66  |     expect(resp.status()).toBe(200);
  67  |   });
  68  | 
  69  |   const adminPages = [
  70  |     "/admin/dashboard",
  71  |     "/admin/prakiraan-manager",
  72  |     "/admin/publikasi-manager",
  73  |     "/admin/kegiatan-manager",
  74  |     "/admin/hero-manager",
  75  |     "/admin/struktur-organisasi",
  76  |     "/admin/buku-tamu",
  77  |     "/admin/layanan",
  78  |     "/admin/display-manager",
  79  |     "/admin/login-history",
  80  |     "/admin/pengaturan",
  81  |   ];
  82  | 
  83  |   for (const p of adminPages) {
  84  |     test(`${p} memuat dengan benar`, async ({ page }) => {
  85  |       const resp = await page.goto(p);
  86  |       expect(resp?.status()).toBe(200);
  87  |     });
  88  |   }
  89  | });
  90  | 
  91  | // ═══════════════════════════════════════════
  92  | // API PUBLIC ENDPOINTS
  93  | // ═══════════════════════════════════════════
  94  | 
  95  | test.describe("API - Public Endpoints", () => {
  96  |   const endpoints = [
  97  |     "/api/admin/hero-images",
  98  |     "/api/admin/prakiraan-images",
  99  |     "/api/admin/prakiraan-categories",
  100 |     "/api/admin/kegiatan-documents",
  101 |     "/api/admin/layanan-cards",
  102 |     "/api/admin/struktur-organisasi",
  103 |     "/api/admin/display",
  104 |     "/api/publications",
  105 |     "/api/bmkg/tegal",
  106 |   ];
  107 | 
  108 |   for (const ep of endpoints) {
  109 |     test(`GET ${ep} return 200`, async ({ request }) => {
  110 |       const resp = await request.get(ep);
  111 |       expect(resp.status()).toBe(200);
  112 |     });
  113 |   }
  114 | });
  115 | 
  116 | // ═══════════════════════════════════════════
  117 | // API AUTH
  118 | // ═══════════════════════════════════════════
  119 | 
  120 | test.describe("API - Auth", () => {
  121 |   test("login valid dengan captcha return 200", async ({ request }) => {
  122 |     const resp = await loginWithCaptcha(request);
> 123 |     expect(resp.status()).toBe(200);
      |                           ^ Error: expect(received).toBe(expected) // Object.is equality
  124 |   });
  125 | 
  126 |   test("login invalid return 401", async ({ request }) => {
  127 |     const captchaRes = await request.get("/api/captcha");
  128 |     const { captchaId } = await captchaRes.json();
  129 |     const textRes = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
  130 |     const { text: captchaAnswer } = await textRes.json();
  131 | 
  132 |     const resp = await request.post("/api/admin/login", {
  133 |       data: { username: "wrong", password: "wrong", captchaId, captchaAnswer },
  134 |     });
  135 |     expect(resp.status()).toBe(401);
  136 |   });
  137 | 
  138 |   test("login empty return 400", async ({ request }) => {
  139 |     const resp = await request.post("/api/admin/login", { data: {} });
  140 |     expect(resp.status()).toBe(400);
  141 |   });
  142 | });
  143 | 
  144 | // ═══════════════════════════════════════════
  145 | // API CAPTCHA
  146 | // ═══════════════════════════════════════════
  147 | 
  148 | test.describe("API - Captcha", () => {
  149 |   test("GET /api/captcha return captchaId", async ({ request }) => {
  150 |     const resp = await request.get("/api/captcha");
  151 |     expect(resp.status()).toBe(200);
  152 |     const data = await resp.json();
  153 |     expect(data.captchaId).toBeDefined();
  154 |   });
  155 | 
  156 |   test("GET /api/captcha/test return text", async ({ request }) => {
  157 |     const captchaRes = await request.get("/api/captcha");
  158 |     const { captchaId } = await captchaRes.json();
  159 | 
  160 |     const resp = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
  161 |     expect(resp.status()).toBe(200);
  162 |     const data = await resp.json();
  163 |     expect(data.text).toBeDefined();
  164 |     expect(data.text.length).toBe(6);
  165 |   });
  166 | 
  167 |   test("captcha is one-time use", async ({ request }) => {
  168 |     const captchaRes = await request.get("/api/captcha");
  169 |     const { captchaId } = await captchaRes.json();
  170 | 
  171 |     // First use - should work
  172 |     const textRes = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
  173 |     expect(textRes.status()).toBe(200);
  174 | 
  175 |     // Second use - should fail (already consumed)
  176 |     const textRes2 = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
  177 |     expect(textRes2.status()).toBe(404);
  178 |   });
  179 | });
  180 | 
  181 | // ═══════════════════════════════════════════
  182 | // API RATE LIMITING
  183 | // ═══════════════════════════════════════════
  184 | 
  185 | test.describe("API - Rate Limiting", () => {
  186 |   test("6 percobaan login gagal kena 429", async ({ request }) => {
  187 |     for (let i = 0; i < 5; i++) {
  188 |       const captchaRes = await request.get("/api/captcha");
  189 |       const { captchaId } = await captchaRes.json();
  190 |       const textRes = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
  191 |       const { text: captchaAnswer } = await textRes.json();
  192 | 
  193 |       await request.post("/api/admin/login", {
  194 |         data: { username: "admin", password: "wrong", captchaId, captchaAnswer },
  195 |       });
  196 |     }
  197 | 
  198 |     const captchaRes = await request.get("/api/captcha");
  199 |     const { captchaId } = await captchaRes.json();
  200 |     const textRes = await request.get(`/api/captcha/test?captchaId=${captchaId}`);
  201 |     const { text: captchaAnswer } = await textRes.json();
  202 | 
  203 |     const resp = await request.post("/api/admin/login", {
  204 |       data: { username: "admin", password: "wrong", captchaId, captchaAnswer },
  205 |     });
  206 |     expect(resp.status()).toBe(429);
  207 |   });
  208 | });
  209 | 
  210 | // ═══════════════════════════════════════════
  211 | // API UNAUTHORIZED
  212 | // ═══════════════════════════════════════════
  213 | 
  214 | test.describe("API - Unauthorized", () => {
  215 |   test("GET /api/admin/users tanpa auth return 401", async ({ request }) => {
  216 |     const resp = await request.get("/api/admin/users");
  217 |     expect(resp.status()).toBe(401);
  218 |   });
  219 | 
  220 |   test("GET /api/admin/stats/users tanpa auth return 401", async ({ request }) => {
  221 |     const resp = await request.get("/api/admin/stats/users");
  222 |     expect(resp.status()).toBe(401);
  223 |   });
```