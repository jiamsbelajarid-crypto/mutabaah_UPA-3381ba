-- =====================================================================
-- Mutabaah Yaumiyah — data awal: 1 kecamatan, 2 UPA, target default.
-- Aman dijalankan ulang (tidak menggandakan data).
-- =====================================================================

insert into public.upa (nama, kecamatan) values
  ('UPA Al Fatih', 'Kecamatan Sukajadi'),
  ('UPA An Nur',   'Kecamatan Sukajadi')
on conflict (nama) do nothing;

insert into public.targets
  (scope, tilawah, shaum, tahajud, hafalan, buku, jamaah, dzikir, riyadhoh)
values
  ('default', 70, 2, 3, 7, 75, 35, 14, 2)
on conflict (scope) where scope = 'default' do nothing;
