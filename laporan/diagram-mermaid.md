# Diagram Mermaid — BMKG Maritim Tegal Dashboard

Semua kode mermaid di bawah ini bisa langsung di-paste ke **draw.io** via **Extras → Edit Diagram → Advanced → Mermaid** atau **app.diagrams.net**.

---

## 1. Use Case Diagram

```mermaid
usecaseDiagram
    actor "Admin" as Admin
    actor "User" as User

    package "Dashboard Administrasi BMKG" {
        usecase "Login" as UC1
        usecase "Lihat Dashboard" as UC2
        usecase "Kelola Prakiraan Cuaca" as UC3
        usecase "Kelola Publikasi" as UC4
        usecase "Kelola Dokumentasi Kegiatan" as UC5
        usecase "Kelola Hero Slider" as UC6
        usecase "Kelola Struktur Organisasi" as UC7
        usecase "Kelola Layanan" as UC8
        usecase "Kelola Buku Tamu" as UC9
        usecase "Kelola Display Manager" as UC10
        usecase "Kelola Manajemen Pengguna" as UC11
        usecase "Lihat Riwayat Aktivitas" as UC12
        usecase "Pengaturan Akun" as UC13
        usecase "Logout" as UC14
    }

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC12
    User --> UC13
    User --> UC14
```

---

## 2. Sequence Diagram — Autentikasi Login (JWT + CAPTCHA Server-Side)

```mermaid
sequenceDiagram
    actor User as User (Browser)
    participant FE as Frontend (React)
    participant MW as Middleware
    participant API as API Route
    participant DB as MySQL

    User->>FE: Buka /admin/login
    FE->>DB: GET /api/captcha (generate captcha text)
    DB-->>FE: captchaId
    FE->>DB: GET /api/captcha/test?captchaId=xxx
    DB-->>FE: captcha text (server-side)
    FE->>FE: Render captcha di canvas
    User->>FE: Input username, password, captcha
    FE->>MW: POST /api/admin/login + captchaId + captchaAnswer
    MW->>MW: Skip auth (login = public)
    MW->>API: Forward request
    API->>API: Rate limit check (5x/menit per IP)
    API->>DB: Validate captcha (cek is_used + text match)
    API->>DB: Set is_used = TRUE (one-time use)
    API->>DB: SELECT user WHERE username=?
    DB-->>API: User data
    API->>API: bcrypt.compare(password, hash)
    API->>API: createSessionToken (JWT + jti)
    API->>API: Set cookie admin_token + csrf_token
    API->>DB: INSERT login_logs
    API-->>FE: 200 + cookies
    FE->>FE: Redirect ke /admin/dashboard
```

---

## 3. Sequence Diagram — Logout (Token Blacklist)

```mermaid
sequenceDiagram
    actor User as User (Browser)
    participant FE as Frontend
    participant MW as Middleware
    participant API as API Route
    participant DB as MySQL

    User->>FE: Klik Logout
    FE->>MW: POST /api/admin/logout
    MW->>MW: Verify token (JWT)
    MW->>DB: SELECT jti FROM token_blacklist
    MW->>DB: INSERT jti ke token_blacklist
    MW->>API: Forward request
    API->>API: Clear admin_token cookie
    API->>API: Clear csrf_token cookie
    API-->>FE: 200 Success
    FE->>FE: Redirect ke /admin/login
    Note over MW,DB: Request berikutnya akan dicek blacklist
```

---

## 4. Sequence Diagram — CRUD Prakiraan (Create)

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant FE as Frontend
    participant MW as Middleware
    participant API as API Route
    participant Storage as Sharp + Storage
    participant DB as MySQL

    Admin->>FE: Input data + upload gambar
    FE->>MW: POST /api/admin/prakiraan-images
    MW->>MW: Verify JWT token
    MW->>MW: Check token_blacklist
    MW->>MW: Verify CSRF token
    MW->>MW: Check RBAC role
    MW->>API: Forward request
    API->>API: Validate input (Zod)
    API->>Storage: uploadFile(gambar)
    Storage->>Storage: Convert to WebP
    Storage-->>API: { url, path }
    API->>DB: INSERT prakiraan_images
    API->>DB: INSERT login_logs (activity)
    API-->>FE: 200 + data
    FE->>Admin: Tampilkan notifikasi
```

---

## 5. Sequence Diagram — Auto Logout

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant Swal as SweetAlert
    participant API as API Route
    participant DB as MySQL

    FE->>FE: User idle 40 detik
    FE->>Swal: Popup "Sesi Akan Berakhir"
    alt User klik "Saya masih di sini"
        Swal-->>FE: Reset timer
    else Tidak ada respon (20 detik)
        Swal->>FE: Timer habis
        FE->>API: POST /api/admin/logout
        API->>API: Verify token (JWT)
        API->>DB: INSERT jti ke token_blacklist
        API->>API: Clear cookies
        FE->>FE: Redirect ke /admin/login
    end
```

---

## 6. Activity Diagram — Proses Login

```mermaid
flowchart TD
    A[Buka Halaman Login] --> B[Fetch CAPTCHA dari Server]
    B --> C[Render CAPTCHA di Canvas]
    C --> D[Input Username + Password + CAPTCHA]
    D --> E{CAPTCHA Valid?}
    E -->|Tidak| F[Error: CAPTCHA salah] --> D
    E -->|Ya| G{Rate Limit OK?}
    G -->|Tidak| H[Error: 429 Too Many Requests]
    G -->|Ya| I{User Exist?}
    I -->|Tidak| J[Error: Username/Password salah]
    I -->|Ya| K{User Aktif?}
    K -->|Tidak| L[Error: Akun dinonaktifkan]
    K -->|Ya| M{Password Match?}
    M -->|Tidak| N[Log: Login gagal] --> J
    M -->|Ya| O[Buat JWT Token + jti]
    O --> P[Set Cookie: admin_token + csrf_token]
    P --> Q[Log: Login berhasil]
    Q --> R[Redirect ke Dashboard]
```

---

## 7. Activity Diagram — Proses Logout

```mermaid
flowchart TD
    A[Klik Logout] --> B[Verify JWT Token]
    B --> C{Token Valid?}
    C -->|Tidak| D[Clear Cookies]
    C -->|Ya| E[Ambil jti dari Token]
    E --> F[INSERT jti ke token_blacklist]
    F --> G[Log Activity: Logout]
    G --> D
    D --> H[Redirect ke /admin/login]
```

---

## 8. Activity Diagram — RBAC Check

```mermaid
flowchart TD
    A[Request Masuk] --> B{Path = /api/admin/*?}
    B -->|Tidak| C[Allow - Public Page]
    B -->|Ya| D{Path = /api/admin/login?}
    D -->|Ya| E[Allow - Public Login]
    D -->|Tidak| F{Method = GET + Public?}
    F -->|Ya| G[Allow - Public Content]
    F -->|Tidak| H{Token Valid?}
    H -->|Tidak| I[401 Unauthorized]
    H -->|Ya| J{Token di-Blacklist?}
    J -->|Ya| K[401 Session Invalidated]
    J -->|Tidak| L{Method = DELETE/PATCH/PUT?}
    L -->|Tidak| M[Allow - Read Only]
    L -->|Ya| N{Role = admin?}
    N -->|Tidak| O[403 Forbidden]
    N -->|Ya| P{CSRF Token Valid?}
    P -->|Tidak| Q[403 Invalid CSRF]
    P -->|Ya| R[Allow + Attach User Headers]
```

---

## 9. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users {
        varchar id PK
        varchar username UK
        text password
        varchar role
        varchar nama
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    login_logs {
        varchar id PK
        varchar user_id FK
        varchar username
        varchar ip_address
        text user_agent
        varchar aktivitas
        timestamp created_at
    }

    token_blacklist {
        varchar jti PK
        timestamp expires_at
    }

    captcha_sessions {
        varchar id PK
        varchar text
        boolean is_used
        timestamp created_at
        timestamp expires_at
    }

    rate_limits {
        varchar id PK
        int count
        timestamp reset_at
    }

    prakiraan_categories {
        varchar id PK
        varchar name
        varchar slug UK
        text description
        varchar icon
        timestamp created_at
        timestamp updated_at
    }

    prakiraan_images {
        varchar id PK
        varchar title
        text url
        varchar slug
        text explanation
        timestamp waktu_mulai
        timestamp waktu_berakhir
        text next_url
        text next_explanation
        timestamp next_waktu_mulai
        timestamp next_waktu_berakhir
        varchar display_type
        json gallery_images
        int prioritas
        varchar category_id FK
        varchar uploader
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    kegiatan_documents {
        varchar id PK
        varchar title
        text description
        varchar category
        text url
        text file_path
        varchar file_type
        date event_date
        json image_urls
        text youtube_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    hero_images {
        varchar id PK
        varchar name
        text url
        int order_index
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    struktur_organisasi {
        varchar id PK
        varchar jabatan
        varchar nama
        varchar inisial
        text deskripsi
        int urutan
        timestamp created_at
        timestamp updated_at
    }

    buku_tamu {
        varchar id PK
        varchar nama
        varchar email
        varchar no_telepon
        varchar instansi
        text keperluan
        text foto_url
        text foto_data
        timestamp created_at
        timestamp updated_at
    }

    layanan_cards {
        varchar id PK
        varchar nama_layanan
        text deskripsi
        text url_google_form
        text cover_url
        timestamp created_at
        timestamp updated_at
    }

    display {
        varchar id PK
        varchar title
        text url
        int order
        varchar uploader
        timestamp waktu_berakhir
        timestamp created_at
    }

    publications {
        varchar id PK
        varchar title
        text description
        text url
        text file_path
        text cover_url
        varchar uploader
        timestamp created_at
    }

    users ||--o{ login_logs : "mencatat aktivitas"
    prakiraan_categories ||--o{ prakiraan_images : "memiliki kategori"
```
