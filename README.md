# Laundry App

Aplikasi manajemen bon laundry: input nomor bon, nama karyawan, tanggal,
jumlah bon, total bon — lengkap dengan tabel daftar bon dan grafik jumlah
bon per tanggal.

## Cara pakai

1. **Buat project Next.js baru** (kalau belum):
   ```bash
   npx create-next-app@latest laundry-app
   ```
   Pilih: TypeScript = No, App Router = Yes, Tailwind = Yes.

2. **Install dependency tambahan**:
   ```bash
   npm install @supabase/supabase-js chart.js react-chartjs-2
   ```

3. **Salin semua file di paket ini** ke dalam project kamu, mengikuti
   struktur folder yang sama:
   - `lib/supabase.js`
   - `app/api/bon/route.js`
   - `app/api/bon/[id]/route.js`
   - `app/components/FormBon.js`
   - `app/components/TabelBon.js`
   - `app/components/ChartBon.js`
   - `app/page.js` (timpa file default)

4. **Setup Supabase**
   - Buat project baru di https://supabase.com
   - Buka SQL Editor, jalankan isi `supabase-schema.sql`
   - Ambil Project URL & anon key dari Settings → API
   - Buat file `.env.local` di root project (contoh ada di
     `.env.local.example`) dan isi dengan URL & key kamu

5. **Jalankan lokal**:
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000

6. **Deploy ke Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```
   Jangan lupa tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` di Vercel Dashboard →
   Project Settings → Environment Variables, lalu redeploy.

## Catatan

- Policy RLS di `supabase-schema.sql` mengizinkan akses publik penuh
  (cocok untuk penggunaan internal/prototipe cepat). Kalau aplikasi ini
  akan dipakai banyak orang atau perlu login, tambahkan Supabase Auth
  dan sesuaikan policy-nya.
- Semua kode pakai JavaScript murni (tanpa TypeScript), sesuai
  permintaan.
