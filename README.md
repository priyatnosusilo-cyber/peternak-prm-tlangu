# Peternakan Binaan PRM Tlangu Sukorejo — Administrasi Pakan

App admin-only untuk catat pembelian pakan, pembayaran anggota, dan kas kelompok.
Stack: React + Vite + Tailwind + Firebase (Auth + Firestore) + Vercel.

**Firebase config sudah diisi** di `src/firebase.js`, terhubung ke project `peternak-prm-tlangu`. Tidak perlu diubah lagi.

## 1. Pastikan Firebase sudah siap

1. **Authentication → Users** — pastikan user admin sudah ada (email + password).
2. **Firestore Database** — pastikan database sudah dibuat (mode production, region asia).

## 2. Firestore Security Rules

Di Firestore → tab **Rules**, pakai rule berikut (hanya user yang login yang bisa akses):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 3. Install & jalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`, login pakai email admin yang tadi dibuat di Firebase Auth.

## 4. Tambah 5 anggota awal

Setelah login, buka tab **Anggota** → tambahkan satu-satu:
Pak Nasikin, Mbah Yono, Pak Agus, Mas Anhar, Mas Agus.

Harga pakan default sudah diset Rp7.500/kg — bisa diubah di tab Dashboard.

## 5. Deploy ke Vercel

```bash
npm run build
```

Push project ini ke repo GitHub (overwrite repo lama), lalu Vercel akan auto-redeploy.
Vercel akan otomatis deteksi Vite — **tidak perlu setting Environment Variables**, karena config Firebase sudah langsung tertulis di `src/firebase.js`.

## Struktur Fitur

- **Dashboard** — total pembelian, pembayaran, saldo kelompok, saldo kas, grafik 6 bulan.
- **Input** — input mingguan per anggota (satu minggu satu layar), navigasi minggu prev/next, hitung otomatis.
- **Anggota** — kelola daftar anggota + rekap total kg/pembelian/pembayaran/saldo/status.
- **Kas** — catat uang masuk/keluar kelompok, saldo berjalan otomatis.
- **Laporan** — rekap bulanan/tahunan, export Excel & PDF (dengan logo Muhammadiyah).
