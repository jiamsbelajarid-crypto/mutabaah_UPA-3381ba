# Mutabaah Yaumiyah

Aplikasi web pencatatan ibadah pekanan untuk komunitas UPA tingkat kecamatan. Anggota dan binaan
mengisi 8 amalan sepekan sekali, memantau capaian bulanan, lalu menyetor rekap ke pembina.
Pembina melihat rekap UPA-nya, koordinator melihat perbandingan agregat antar UPA.

## Teknologi
- React 19 + Vite + TypeScript, React Router
- Tailwind CSS v4 (mode terang/gelap, font Plus Jakarta Sans)
- Grafik SVG/CSS buatan sendiri (tanpa library grafik)
- Hosting Netlify (`netlify.toml`: build `npm run build`, publish `dist`, redirect SPA)
- Rencana: Supabase (Auth + Postgres + RLS)

## Menjalankan secara lokal
```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # hasil di folder dist/
```
Saat ini aplikasi berjalan dalam **mode pratinjau** dengan data contoh yang disimpan di browser.
Masuk dengan username dan password apa saja (password minimal 8 karakter). Di halaman Profil
ada pilihan "Pratinjau sebagai peran" untuk mencoba menu Rekap sebagai pembina/koordinator/admin.

## Aturan perhitungan
- Pekan = Senin–Ahad, disimpan sebagai tanggal Senin (`week_start`).
- Pekan masuk ke bulan tempat hari Kamis-nya berada (Oktober 2026 punya 5 pekan).
- Target bulanan = target pekanan × jumlah pekan bulan itu.
- Skor pekan = rata-rata min(1, nilai/target) untuk 8 amalan; capaian bulan dihitung serupa.
- Target hingga pekan ini = pekan yang sudah dimulai / jumlah pekan bulan itu. Zona Asia/Jakarta.

## Environment variable
Salin `.env.example` menjadi `.env.local` dan isi:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Jangan pernah memakai `service_role` key di frontend. Di Netlify, isi kedua variabel di
**Project configuration → Environment variables**, lalu deploy ulang.

## Roadmap
Lihat [PLAN.md](PLAN.md). Langkah berikutnya: migrasi SQL Supabase lengkap dengan RLS dan seed,
lalu autentikasi, data nyata, rekap, dan panel admin. Panduan membuat project Supabase,
menjalankan SQL, mengaktifkan email/password, dan membuat admin pertama ditambahkan ke README
ini bersama migrasi tersebut.
