# Peternakan Binaan — Login Admin (Rewrite)

## Langkah 1 — Upload ke GitHub
1. Extract zip ini.
2. Buat repo baru di GitHub (atau pakai repo lama, hapus isi lama dulu).
3. Upload semua file & folder ini ke repo lewat GitHub web UI (drag & drop atau "Add file" > "Upload files").

## Langkah 2 — Setting Firebase
1. Buka Firebase Console → project **peternakanbinaan-prm-tlangu**.
2. **Authentication → Users** → pastikan ada user admin dengan email yang benar (contoh: `admin@prmtlangu.id`), cek ejaan pelan-pelan biar ga typo lagi kayak kemarin.
3. **Project Settings (ikon gear) → General** → scroll ke bawah ke "Your apps". Kalau belum ada web app, klik "Add app" → pilih Web (</> icon).
4. Copy nilai-nilai berikut dari `firebaseConfig` yang muncul:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

## Langkah 3 — Masukin key di Vercel
1. Buka project ini di Vercel → **Settings → Environment Variables**.
2. Tambahkan 6 variable ini satu-satu (nama harus PERSIS sama):
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   ```
3. Isi masing-masing dengan value dari Langkah 2.
4. Klik **Save**, lalu **Redeploy** project (Deployments → titik tiga → Redeploy).

## Kalau masih gagal login
1. Buka website yang sudah live → klik kanan → **Inspect** → tab **Console**.
2. Coba login lagi.
3. Lihat baris yang muncul: `Firebase Project ID terbaca: ...` — pastikan itu sama dengan project ID Firebase kamu.
4. Kalau ada error, akan muncul baris `Login error code: ...` — screenshot itu dan kirim ke saya, itu langsung nunjukin sumber masalahnya.
