# AGENTS.md

Mutabaah Yaumiyah — SPA React + Vite + TypeScript + Tailwind v4, di-deploy ke Netlify.
Antarmuka berbahasa Indonesia; nama variabel/fungsi juga Bahasa Indonesia (mis. `rekapBulan`, `pekanIni`).

**Lanjutkan dari [PLAN.md](PLAN.md).** Milestone 1 (tampilan) selesai; berikutnya Milestone 2 (Supabase SQL + RLS).

## Struktur
- `src/lib/amalan.ts` — definisi 8 amalan (key, satuan, target pekanan, maks, warna).
- `src/lib/pekan.ts` — logika tanggal: string `YYYY-MM-DD`, hitung via Date UTC, "hari ini" dari
  Intl zona Asia/Jakarta. Pekan masuk bulan hari Kamis-nya.
- `src/lib/skor.ts` — skor pekan, capaian bulan, target hingga pekan ini. Logika final; pakai ulang.
- `src/data/fixtures.ts` — SEMUA data contoh. Hapus/ganti saat data nyata masuk.
- `src/data/store.tsx` — context state (localStorage). Antarmukanya (`simpanPekan`, `setor`,
  `ubahProfil`, `ubahTargetPribadi`, `target`) dirancang agar bisa diganti panggilan Supabase.
- `src/components/` — Layout + nav bawah, Grafik (Cincin, GrafikPekan, Bar, ProgresAmalan), Pemilih, Ikon.
- `src/pages/` — Masuk, Beranda, Isi, Setoran, Riwayat, Profil, Rekap.

## Konvensi
- Warna lewat token Tailwind di `src/index.css` (`bg-bg`, `bg-card`, `text-ink`, `text-muted`,
  `bg-soft`, `border-line`, `primer`, `ungu`, `mint`, `kuning`, `koral`). Token netral berubah otomatis
  di mode gelap (kelas `.dark` di `<html>`, disimpan di localStorage `tema`).
- Kelas `.kartu` untuk kartu (radius 20px), `.hero` untuk gradien indigo-ungu.
- Pesan galat harus menjelaskan cara memperbaikinya; tombol memakai kalimat aktif.
- Fokus keyboard memakai outline kuning global; hormati `prefers-reduced-motion` dan safe-area.

## Keputusan penting
- Keamanan peran WAJIB di RLS/trigger Postgres, bukan hanya UI. Sign up hanya anggota/binaan.
- Koordinator hanya lewat fungsi agregat SECURITY DEFINER; jangan beri akses tabel mentah.
- Hanya `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di frontend; tidak ada service_role.
- Pemilih "Pratinjau sebagai peran" di Profil hanya untuk mode pratinjau — hapus saat auth nyata.
