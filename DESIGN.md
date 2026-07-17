# DESIGN.md — T-Rex (Tracker Expense)

> Project learning-by-doing: aplikasi tracker pengeluaran harian.
> Tujuannya belajar membuat web app Next.js end-to-end (auth, database, CRUD, UI mobile).

## 1. Tujuan Produk
Aplikasi web untuk mencatat pengeluaran harian, melihat ringkasan per kategori,
dan mengelola (edit/hapus) catatan. Dipakai harian terutama dari mobile.

## 2. Fitur
- Login dengan Google OAuth (wajib sebelum pakai app).
- Input pengeluaran: jumlah, kategori, tanggal, catatan.
- Ringkasan: total hari ini, total bulan ini, breakdown per kategori (visualisasi CSS bar, tanpa library chart).
- List pengeluaran dengan filter per bulan.
- Edit & hapus pengeluaran (hanya milik sendiri).

## 3. Stack & Alasan
| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15 (App Router, TS) | Konvensi modern, server actions, mudah deploy |
| Styling | Tailwind CSS | Cepat, mobile-first |
| Auth | Auth.js v5 (`next-auth@beta`) | Standar, Google provider simpel |
| DB (dev) | SQLite + Prisma | Lokal, ringan, gampang belajar |
| DB (prod) | Turso | Syntax SQLite sama, optimal Vercel + mobile |
| Chart | CSS/div bars | 0 dependency tambahan, tetap lancar |

**Catatan ringan:** tidak pakai library chart (recharts/chart.js) supaya bundle kecil & web lancar.

## 4. Struktur Folder (rencana)
```
uangku/
├── DESIGN.md
├── prisma/
│   └── schema.prisma          # model User, Account, Session, VerificationToken, Expense
├── src/
│   ├── auth.ts                # authConfig (Google, Prisma adapter, session db)
│   ├── middleware.ts          # proteksi /dashboard, /expenses*
│   ├── app/
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   ├── page.tsx           # redirect ke dashboard/login
│   │   ├── login/page.tsx     # tombol Login dengan Google
│   │   ├── dashboard/page.tsx # ringkasan + CSS bars
│   │   ├── expenses/page.tsx  # list + filter + edit/hapus
│   │   └── actions.ts         # server actions CRUD expense
│   ├── components/
│   │   ├── ExpenseForm.tsx    # input pengeluaran
│   │   └── BottomNav.tsx      # navigasi bawah mobile + logout
│   └── ...
└── .env                       # AUTH_SECRET, AUTH_GOOGLE_*, DATABASE_URL
```

## 5. Data Model (Prisma)
- Auth.js standar: `User`, `Account`, `Session`, `VerificationToken`.
- Bisnis:
  ```
  Expense {
    id        String   @id @default(cuid())
    userId    String
    amount    Int
    category  String
    note      String?
    date      DateTime
    createdAt DateTime @default(now())
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }
  ```

## 6. Auth Flow
1. User buka `/` → redirect ke `/login` kalau belum auth, atau `/dashboard` kalau sudah.
2. Klik "Login dengan Google" → Session disimpan.
3. Middleware melindungi `/dashboard` & `/expenses*`.
4. Navbar/bottom nav menyediakan tombol logout.

## 7. Environment Variables
```
AUTH_SECRET=...            # generate: npx auth secret
AUTH_GOOGLE_ID=...         # dari Google Cloud Console
AUTH_GOOGLE_SECRET=...     # dari Google Cloud Console
DATABASE_URL="file:./dev.db"   # dev (SQLite)
# prod: url Turso (libsql://...)
```

## 8. Cara Menjalankan (dev)
```bash
npm install
npx prisma migrate dev --name init
npm run dev          # http://localhost:3000
```
Google OAuth callback (dev): `http://localhost:3000/api/auth/callback/google`

## 9. Deploy (Vercel + Turso)
1. Buat database Turso, ambil `DATABASE_URL` (libsql).
2. Set env `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_*` di Vercel.
3. Build command jalankan `prisma migrate deploy`.
4. Pastikan Google OAuth authorized redirect ke `https://<domain>/api/auth/callback/google`.

## 10. Prinsip
- Mobile-first: bottom nav, tombol besar, input numeric (`inputMode="decimal"`).
- Ringan: hindari dependency besar, visualisasi pakai CSS.
- Keamanan: setiap aksi CRUD memvalidasi kepemilikan `userId`.
