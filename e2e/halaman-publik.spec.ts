import { test, expect } from "@playwright/test";

test.describe("Halaman Publik", () => {
  const pages = [
    "/",
    "/about",
    "/about/struktur-organisasi",
    "/about/visi-misi",
    "/buku_tamu",
    "/kegiatan",
    "/kontak",
    "/layanan",
    "/prakiraan",
    "/display",
  ];

  for (const path of pages) {
    test(`${path} return 200`, async ({ page }) => {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(200);
    });
  }
});
