# BMKG Maritim Tegal

Portal informasi cuaca maritim dan layanan publik berbasis Next.js untuk Stasiun Meteorologi Maritim Tegal – BMKG.

# SIGIT PRATAMA (23215012)

## Teknologi Utama

- **Framework:** Next.js 16 (React 19 + TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** MySQL + Drizzle ORM
- **Auth:** JWT HS256 (jose) + bcryptjs
- **Animasi:** Framer Motion
- **Form:** React Hook Form + Zod
- **Testing:** Vitest (210 tests) + Playwright (36 tests)
- **CI/CD:** GitHub Actions

## Fitur

### Halaman Publik
- Beranda (hero slider, prakiraan cuaca, informasi BMKG)
- About (visi-misi, struktur organisasi)
- Prakiraan cuaca maritim
- Layanan publik
- Dokumentasi kegiatan
- Buku tamu online
- Kontak

### Panel Admin (CMS)
- Dashboard statistik
- Manajemen prakiraan cuaca
- Manajemen publikasi / buletin
- Manajemen dokumentasi kegiatan
- Slider hero home (file + URL)
- Struktur organisasi
- Data buku tamu (CRUD + backup/restore)
- Kelola layanan
- Display digital otomatis
- Manajemen user
- History login
- Pengaturan (ganti password)

### Keamanan
- **JWT HS256** — autentikasi via jose library
- **Token Blacklist** — secure logout via token_blacklist table
- **Server-Side CAPTCHA** — validasi di database (one-time use)
- **CSRF Protection** — double-submit cookie pattern
- **Rate Limiting** — MySQL-based (login 5/menit, create user 10/menit, buku tamu 5/menit)
- **RBAC** — role-based access control (admin, user)
- **Audit logging** — 39+ log points untuk operasi sensitif
- **Security headers** — CSP, HSTS, X-Frame-Options, X-XSS-Protection

## Cara Install & Jalankan

### Prasyarat

| Software | Minimal Versi |
|----------|--------------|
| Node.js | 20.x LTS |
| npm | 9+ |
| MySQL | 8.0+ |

### Langkah-langkah

```bash
# 1. Clone repository
git clone <url-repository>
cd BMKG-Maritim-Tegal

# 2. Install dependency
npm install

# 3. Buat database dan tabel
mysql -u root - < scripts/init.sql

# 4. Insert admin user
node scripts/seed.js

# 5. Konfigurasi environment
cp .env.example .env
# Edit .env sesuai konfigurasi server

# 6. Jalankan development
npm run dev
```

### Insert Admin User

```bash
# Menggunakan seed script (password: admin123)
node scripts/seed.js
```

Atau manual via MySQL:
```sql
-- Password: admin123 (bcrypt hashed)
INSERT INTO users (id, username, password, role, nama, is_active)
VALUES (UUID(), 'admin', '$2a$12$...', 'admin', 'Administrator', true);
```

### Build & Production

```bash
npm run build
npm run start
```

### Testing

```bash
npm run test           # Run semua tests (210 tests)
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npm run typecheck      # TypeScript check
npx playwright test    # E2E tests (36 tests)
```

## Environment Variables

| Variabel | Wajib | Fungsi |
|----------|-------|--------|
| `MYSQL_HOST` | Ya | Host MySQL |
| `MYSQL_PORT` | Ya | Port MySQL |
| `MYSQL_USER` | Ya | Username MySQL |
| `MYSQL_PASSWORD` | Ya | Password MySQL |
| `MYSQL_DATABASE` | Ya | Nama database |
| `TOKEN_SECRET` | Ya | Secret untuk JWT (random hex 32 bytes) |
| `BMKG_API_URL` | Ya | URL API BMKG |
| `BMKG_CACHE_TTL` | Tidak | Cache TTL (ms) |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Tidak | Nomor WhatsApp |

## Database

14 tabel: `users`, `login_logs`, `captcha_sessions`, `rate_limits`, `token_blacklist`, `prakiraan_categories`, `prakiraan_images`, `kegiatan_documents`, `hero_images`, `struktur_organisasi`, `buku_tamu`, `layanan_cards`, `display`, `publications`.

Migration: `npx drizzle-kit push`

## Role Pengguna

| Role | Akses |
|------|-------|
| `admin` | Full akses (manajemen users, semua CRUD) |
| `user` | Terbatas (dashboard, history login, ganti password) |

## Struktur Project

```
app/
├── api/                    # API routes
│   ├── admin/              # Admin endpoints (protected)
│   ├── captcha/            # Server-side CAPTCHA
│   ├── submit/             # Public endpoints
│   ├── weather/            # Weather proxy
│   └── bmkg/               # BMKG API proxy
├── admin/                  # Admin pages
├── about/                  # About pages
├── prakiraan/              # Prakiraan pages
├── layanan/                # Layanan page
├── kegiatan/               # Kegiatan page
├── kontak/                 # Kontak page
└── buku_tamu/              # Buku tamu page
components/                 # Reusable components
db/                         # Database schema + connection
hooks/                      # Custom React hooks
lib/                        # Utilities (auth, validation, storage)
services/                   # Business logic layer
types/                      # TypeScript types
scripts/                    # Seed + test scripts
```

<!--  -->
