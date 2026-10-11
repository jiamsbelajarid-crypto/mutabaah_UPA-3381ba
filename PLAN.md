# Roadmap Mutabaah Yaumiyah

Aplikasi dibangun bertahap: tampilan produk lebih dulu agar alur pengguna bisa dicoba dan
disempurnakan, lalu data, autentikasi, dan keamanan menyusul di atas fondasi yang sudah teruji.

## Milestone 1 — Tampilan produk (selesai)
- Masuk / Daftar / Lupa password (validasi lengkap, pilihan UPA dari daftar, peran anggota/binaan).
- Beranda: hero gradien, cincin capaian, penanda "Di atas target / Perlu dikejar", grafik per pekan
  dengan garis target 100%, progres per amalan, navigasi bulan.
- Isi: pemilih pekan (tidak bisa melewati pekan ini), formulir 8 amalan, validasi min/maks.
- Setoran: rekap otomatis, Setor/Perbarui setoran, Salin teks rekap WhatsApp.
- Riwayat, Profil (nama, target pribadi, mode gelap, keluar), Rekap UPA (CSV) & Rekap Kecamatan.
- Logika pekan & skor final di `src/lib/` (pekan ikut bulan hari Kamis, zona Asia/Jakarta).
- Data contoh di `src/data/fixtures.ts`, state di `src/data/store.tsx` (localStorage).

## Milestone 2 — Skema database & RLS
- `supabase/migrations/0001_init.sql`: tabel `upa`, `profiles`, `weekly_entries`, `targets`,
  `monthly_submissions` beserta CHECK min/maks dan UNIQUE(user_id, week_start).
- Fungsi helper `auth_role()` / `auth_upa()` (SECURITY DEFINER, `search_path` terkunci).
- RLS: pemilik baca/tulis data sendiri; pembina read-only untuk upa_id yang sama; admin kelola
  `upa`, `targets` default/upa, dan `profiles.role`/`upa_id`.
- Trigger `BEFORE UPDATE` pada `profiles` yang menolak perubahan `role`/`upa_id` oleh non-admin.
- Trigger `handle_new_user` pada `auth.users`: membuat profil dari metadata sign up dan
  memaksa role ke `anggota` bila metadata berisi peran lain.
- Fungsi `rekap_kecamatan(month)` SECURITY DEFINER untuk koordinator/admin (hanya agregat).
- Seed: 1 kecamatan, 2 UPA, target default 8 amalan.

## Milestone 3 — Autentikasi Supabase
- Klien `@supabase/supabase-js` dari `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
- Login dengan username (lookup email via RPC aman) atau email; daftar; lupa & atur ulang password.
- Ganti `masukDemo` dengan sesi Supabase; guard rute berdasarkan peran dari `profiles`.

## Milestone 4 — Data nyata untuk pengguna
- Ganti fungsi di `store.tsx` dengan query: upsert `weekly_entries`, upsert `monthly_submissions`,
  resolusi target (user > upa > default), update nama.
- Status simpan, loading, dan pesan galat jaringan yang jelas.

## Milestone 5 — Rekap pembina & koordinator
- Rekap UPA dari `weekly_entries` (dibatasi RLS) + status setoran; ekspor CSV.
- Rekap Kecamatan dari RPC `rekap_kecamatan`.

## Milestone 6 — Panel Admin
- Kelola UPA (tambah/ubah), daftar pengguna & ubah peran/UPA, atur target default & per UPA,
  izin target pribadi.

## Milestone 7 — Penyempurnaan
- README lengkap (setup Supabase, admin pertama via SQL, env Netlify), PWA/ikon, uji aksesibilitas.

Catatan: penyimpanan memakai Supabase sesuai permintaan. Jika ingin semuanya di satu platform,
Netlify Database (Postgres) + Netlify Identity bisa menjadi alternatif pada Milestone 2–3.
