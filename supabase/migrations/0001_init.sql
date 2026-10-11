-- =====================================================================
-- Mutabaah Yaumiyah — skema awal, fungsi helper, trigger, dan RLS.
-- Jalankan sekali di Supabase SQL Editor (atau `supabase db push`).
-- Peran: anggota, binaan, pembina, koordinator, admin.
-- Keamanan peran ditegakkan di sini (RLS + trigger), bukan hanya di UI.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tabel
-- ---------------------------------------------------------------------

create table public.upa (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null unique check (length(btrim(nama)) between 3 and 80),
  kecamatan   text not null check (length(btrim(kecamatan)) between 3 and 80),
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  nama                  text not null check (length(btrim(nama)) between 3 and 80),
  username              text not null unique check (username ~ '^[a-z0-9_.]{3,20}$'),
  role                  text not null default 'anggota'
                        check (role in ('anggota', 'binaan', 'pembina', 'koordinator', 'admin')),
  upa_id                uuid references public.upa (id) on delete set null,
  boleh_target_pribadi  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index profiles_upa_idx on public.profiles (upa_id);

-- Satu baris per pengguna per pekan; week_start selalu hari Senin.
create table public.weekly_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  week_start  date not null check (extract(isodow from week_start) = 1),
  tilawah     integer not null default 0 check (tilawah  between 0 and 2000),
  shaum       integer not null default 0 check (shaum    between 0 and 7),
  tahajud     integer not null default 0 check (tahajud  between 0 and 7),
  hafalan     integer not null default 0 check (hafalan  between 0 and 500),
  buku        integer not null default 0 check (buku     between 0 and 2000),
  jamaah      integer not null default 0 check (jamaah   between 0 and 35),
  dzikir      integer not null default 0 check (dzikir   between 0 and 14),
  riyadhoh    integer not null default 0 check (riyadhoh between 0 and 7),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, week_start)
);
create index weekly_entries_week_idx on public.weekly_entries (week_start);

-- Target pekanan. Prioritas: user (jika diizinkan admin) > upa > default.
create table public.targets (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null check (scope in ('default', 'upa', 'user')),
  upa_id      uuid references public.upa (id) on delete cascade,
  user_id     uuid references public.profiles (id) on delete cascade,
  tilawah     integer not null check (tilawah  between 0 and 2000),
  shaum       integer not null check (shaum    between 0 and 7),
  tahajud     integer not null check (tahajud  between 0 and 7),
  hafalan     integer not null check (hafalan  between 0 and 500),
  buku        integer not null check (buku     between 0 and 2000),
  jamaah      integer not null check (jamaah   between 0 and 35),
  dzikir      integer not null check (dzikir   between 0 and 14),
  riyadhoh    integer not null check (riyadhoh between 0 and 7),
  updated_at  timestamptz not null default now(),
  check (
    (scope = 'default' and upa_id is null     and user_id is null) or
    (scope = 'upa'     and upa_id is not null and user_id is null) or
    (scope = 'user'    and upa_id is null     and user_id is not null)
  )
);
create unique index targets_default_unik on public.targets (scope) where scope = 'default';
create unique index targets_upa_unik     on public.targets (upa_id) where scope = 'upa';
create unique index targets_user_unik    on public.targets (user_id) where scope = 'user';

-- Setoran bulanan; month = tanggal 1 bulan tersebut (bulan ditentukan hari Kamis pekan).
create table public.monthly_submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  month         date not null check (extract(day from month) = 1),
  submitted_at  timestamptz not null default now(),
  unique (user_id, month)
);
create index monthly_submissions_month_idx on public.monthly_submissions (month);

-- ---------------------------------------------------------------------
-- Fungsi helper (SECURITY DEFINER, search_path dikunci)
-- ---------------------------------------------------------------------

create or replace function public.auth_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = auth.uid()
$$;

create or replace function public.auth_upa()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select p.upa_id from public.profiles p where p.id = auth.uid()
$$;

-- UPA milik pengguna lain; dipakai policy pembina tanpa membuka tabel profiles.
create or replace function public.upa_pengguna(uid uuid)
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select p.upa_id from public.profiles p where p.id = uid
$$;

-- Senin pekan ini menurut zona Asia/Jakarta.
create or replace function public.pekan_ini_jakarta()
returns date
language sql stable
set search_path = ''
as $$
  select d - (extract(isodow from d)::int - 1)
  from (select (now() at time zone 'Asia/Jakarta')::date as d) s
$$;

revoke execute on function public.auth_role()         from public, anon;
revoke execute on function public.auth_upa()          from public, anon;
revoke execute on function public.upa_pengguna(uuid)  from public, anon;
grant  execute on function public.auth_role()         to authenticated;
grant  execute on function public.auth_upa()          to authenticated;
grant  execute on function public.upa_pengguna(uuid)  to authenticated;
grant  execute on function public.pekan_ini_jakarta() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Trigger
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at       before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger weekly_entries_updated_at before update on public.weekly_entries
  for each row execute function public.set_updated_at();
create trigger targets_updated_at        before update on public.targets
  for each row execute function public.set_updated_at();

-- Hanya admin yang boleh mengubah role, upa_id, username, dan izin target pribadi.
-- Koneksi langsung dari SQL Editor (role postgres) tetap boleh, untuk membuat admin pertama.
create or replace function public.jaga_kolom_profil()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') and coalesce(public.auth_role(), '') <> 'admin' then
    if new.id is distinct from old.id then
      raise exception 'ID profil tidak dapat diubah.' using errcode = '42501';
    end if;
    if new.role is distinct from old.role then
      raise exception 'Peran hanya dapat diubah oleh admin. Hubungi admin untuk mengganti peran.'
        using errcode = '42501';
    end if;
    if new.upa_id is distinct from old.upa_id then
      raise exception 'UPA hanya dapat diubah oleh admin. Hubungi admin untuk pindah UPA.'
        using errcode = '42501';
    end if;
    if new.username is distinct from old.username then
      raise exception 'Username hanya dapat diubah oleh admin. Hubungi admin bila perlu menggantinya.'
        using errcode = '42501';
    end if;
    if new.boleh_target_pribadi is distinct from old.boleh_target_pribadi then
      raise exception 'Izin target pribadi diatur oleh admin. Hubungi admin untuk mengaktifkannya.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_jaga_kolom before update on public.profiles
  for each row execute function public.jaga_kolom_profil();

-- Profil dibuat otomatis saat sign up. Peran SELALU 'anggota', apa pun isi metadata;
-- peran lain hanya diberikan admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  meta      jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_nama    text  := btrim(coalesce(meta ->> 'nama', ''));
  v_user    text  := lower(btrim(coalesce(meta ->> 'username', '')));
  v_upa_txt text  := btrim(coalesce(meta ->> 'upa_id', ''));
  v_upa     uuid;
begin
  if length(v_nama) < 3 then
    v_nama := left(coalesce(nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Pengguna baru'), 80);
    if length(v_nama) < 3 then v_nama := 'Pengguna baru'; end if;
  end if;

  if v_user = '' then
    v_user := 'user_' || left(replace(new.id::text, '-', ''), 8);
  elsif v_user !~ '^[a-z0-9_.]{3,20}$' then
    raise exception 'Username tidak valid. Gunakan 3–20 huruf kecil, angka, titik, atau garis bawah tanpa spasi.'
      using errcode = '22023';
  elsif exists (select 1 from public.profiles p where p.username = v_user) then
    raise exception 'Username "%" sudah dipakai. Pilih username lain.', v_user
      using errcode = '23505';
  end if;

  if v_upa_txt <> '' then
    if v_upa_txt !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'UPA tidak dikenali. Pilih UPA dari daftar yang tersedia.' using errcode = '22023';
    end if;
    v_upa := v_upa_txt::uuid;
    if not exists (select 1 from public.upa u where u.id = v_upa) then
      raise exception 'UPA tidak ditemukan. Pilih UPA dari daftar yang tersedia.' using errcode = '22023';
    end if;
  end if;

  insert into public.profiles (id, nama, username, role, upa_id)
  values (new.id, v_nama, v_user, 'anggota', v_upa);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tolak isian pekan mendatang (zona Asia/Jakarta).
create or replace function public.tolak_pekan_mendatang()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.week_start > public.pekan_ini_jakarta() then
    raise exception 'Pekan % belum dimulai. Isi pekan ini atau pekan sebelumnya.', new.week_start
      using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger weekly_entries_tolak_mendatang before insert or update on public.weekly_entries
  for each row execute function public.tolak_pekan_mendatang();

-- Tolak setoran bulan yang belum berjalan (bulan pekan ini = bulan hari Kamis-nya).
create or replace function public.tolak_bulan_mendatang()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.month > date_trunc('month', public.pekan_ini_jakarta() + 3)::date then
    raise exception 'Bulan % belum berjalan. Setorkan rekap bulan ini atau bulan sebelumnya.',
      to_char(new.month, 'YYYY-MM') using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger monthly_submissions_tolak_mendatang before insert or update on public.monthly_submissions
  for each row execute function public.tolak_bulan_mendatang();

-- ---------------------------------------------------------------------
-- Hak akses dasar + Row Level Security
-- ---------------------------------------------------------------------

revoke all on public.upa, public.profiles, public.weekly_entries, public.targets,
              public.monthly_submissions from anon, authenticated;

grant select                         on public.upa                 to anon, authenticated;
grant insert, update, delete         on public.upa                 to authenticated;
grant select, update, delete         on public.profiles            to authenticated;
grant select, insert, update, delete on public.weekly_entries      to authenticated;
grant select, insert, update, delete on public.targets             to authenticated;
grant select, insert, update, delete on public.monthly_submissions to authenticated;

alter table public.upa                 enable row level security;
alter table public.profiles            enable row level security;
alter table public.weekly_entries      enable row level security;
alter table public.targets             enable row level security;
alter table public.monthly_submissions enable row level security;

-- upa: daftar UPA terbuka (dipakai formulir daftar); hanya admin yang mengelola.
create policy upa_baca on public.upa for select to anon, authenticated using (true);
create policy upa_admin_tambah on public.upa for insert to authenticated
  with check (public.auth_role() = 'admin');
create policy upa_admin_ubah on public.upa for update to authenticated
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');
create policy upa_admin_hapus on public.upa for delete to authenticated
  using (public.auth_role() = 'admin');

-- profiles: diri sendiri; pembina read-only satu UPA; admin semua.
-- Profil dibuat hanya oleh trigger handle_new_user (tidak ada policy insert).
create policy profiles_baca_sendiri on public.profiles for select to authenticated
  using (id = auth.uid());
create policy profiles_baca_pembina on public.profiles for select to authenticated
  using (public.auth_role() = 'pembina' and upa_id = public.auth_upa());
create policy profiles_baca_admin on public.profiles for select to authenticated
  using (public.auth_role() = 'admin');
create policy profiles_ubah_sendiri on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_ubah_admin on public.profiles for update to authenticated
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');
create policy profiles_hapus_admin on public.profiles for delete to authenticated
  using (public.auth_role() = 'admin');

-- weekly_entries: pemilik baca/tulis; pembina read-only satu UPA; admin read-only.
create policy entri_pemilik on public.weekly_entries for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy entri_baca_pembina on public.weekly_entries for select to authenticated
  using (public.auth_role() = 'pembina' and public.upa_pengguna(user_id) = public.auth_upa());
create policy entri_baca_admin on public.weekly_entries for select to authenticated
  using (public.auth_role() = 'admin');

-- targets: semua pengguna membaca default & UPA-nya; target pribadi hanya bila diizinkan admin.
create policy target_baca on public.targets for select to authenticated
  using (
    scope = 'default'
    or (scope = 'upa'  and upa_id = public.auth_upa())
    or (scope = 'user' and user_id = auth.uid())
    or (scope = 'user' and public.auth_role() = 'pembina'
        and public.upa_pengguna(user_id) = public.auth_upa())
  );
create policy target_pribadi on public.targets for all to authenticated
  using (scope = 'user' and user_id = auth.uid())
  with check (
    scope = 'user' and user_id = auth.uid()
    and coalesce((select p.boleh_target_pribadi from public.profiles p where p.id = auth.uid()), false)
  );
create policy target_admin on public.targets for all to authenticated
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- monthly_submissions: pemilik baca/tulis; pembina read-only satu UPA; admin read-only.
create policy setoran_pemilik on public.monthly_submissions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy setoran_baca_pembina on public.monthly_submissions for select to authenticated
  using (public.auth_role() = 'pembina' and public.upa_pengguna(user_id) = public.auth_upa());
create policy setoran_baca_admin on public.monthly_submissions for select to authenticated
  using (public.auth_role() = 'admin');

-- Koordinator sengaja TIDAK punya policy pada tabel mentah; hanya lewat rekap_kecamatan().

-- ---------------------------------------------------------------------
-- Rekap kecamatan (agregat per UPA saja) — koordinator & admin
-- ---------------------------------------------------------------------

-- Rasio capaian satu amalan, sama dengan src/lib/skor.ts: min(1, nilai / target bulan).
create or replace function public.rasio_capaian(nilai bigint, target_pekan integer, jumlah_pekan integer)
returns numeric
language sql immutable
set search_path = ''
as $$
  select case
    when coalesce(target_pekan, 0) * jumlah_pekan <= 0 then 1::numeric
    else least(1::numeric, coalesce(nilai, 0)::numeric / (target_pekan * jumlah_pekan))
  end
$$;

-- month: 'YYYY-MM'. Pekan masuk bulan hari Kamis-nya. Anggota yang dihitung: anggota & binaan.
create or replace function public.rekap_kecamatan(month text)
returns table (
  upa_id          uuid,
  upa_nama        text,
  kecamatan       text,
  jumlah_anggota  integer,
  rata_capaian    numeric,
  sudah_setor     integer
)
language plpgsql stable security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_awal   date;
  v_kamis  date;
  v_n      integer;
begin
  if coalesce(public.auth_role(), '') not in ('koordinator', 'admin') then
    raise exception 'Rekap kecamatan hanya untuk koordinator atau admin. Minta admin menetapkan peran Anda.'
      using errcode = '42501';
  end if;
  if rekap_kecamatan.month is null or rekap_kecamatan.month !~ '^\d{4}-(0[1-9]|1[0-2])$' then
    raise exception 'Format bulan harus YYYY-MM, contoh: 2026-10.' using errcode = '22023';
  end if;

  v_awal  := to_date(rekap_kecamatan.month || '-01', 'YYYY-MM-DD');
  v_kamis := v_awal + ((4 - extract(isodow from v_awal)::int + 7) % 7);
  v_n     := ((((v_awal + interval '1 month')::date - 1) - v_kamis) / 7) + 1;

  return query
  with pekan as (
    select (g::date - 3) as w
    from generate_series(v_kamis, (v_awal + interval '1 month')::date - 1, interval '7 days') g
  ),
  anggota as (
    select p.id, p.upa_id, p.boleh_target_pribadi
    from public.profiles p
    where p.role in ('anggota', 'binaan') and p.upa_id is not null
  ),
  total as (
    select a.id, a.upa_id, a.boleh_target_pribadi,
           sum(e.tilawah) as tilawah, sum(e.shaum)  as shaum,  sum(e.tahajud) as tahajud,
           sum(e.hafalan) as hafalan, sum(e.buku)   as buku,   sum(e.jamaah)  as jamaah,
           sum(e.dzikir)  as dzikir,  sum(e.riyadhoh) as riyadhoh
    from anggota a
    left join public.weekly_entries e
      on e.user_id = a.id and e.week_start in (select pk.w from pekan pk)
    group by a.id, a.upa_id, a.boleh_target_pribadi
  ),
  skor as (
    select t.id, t.upa_id, (
        public.rasio_capaian(t.tilawah,  coalesce(tu.tilawah,  tp.tilawah,  td.tilawah),  v_n)
      + public.rasio_capaian(t.shaum,    coalesce(tu.shaum,    tp.shaum,    td.shaum),    v_n)
      + public.rasio_capaian(t.tahajud,  coalesce(tu.tahajud,  tp.tahajud,  td.tahajud),  v_n)
      + public.rasio_capaian(t.hafalan,  coalesce(tu.hafalan,  tp.hafalan,  td.hafalan),  v_n)
      + public.rasio_capaian(t.buku,     coalesce(tu.buku,     tp.buku,     td.buku),     v_n)
      + public.rasio_capaian(t.jamaah,   coalesce(tu.jamaah,   tp.jamaah,   td.jamaah),   v_n)
      + public.rasio_capaian(t.dzikir,   coalesce(tu.dzikir,   tp.dzikir,   td.dzikir),   v_n)
      + public.rasio_capaian(t.riyadhoh, coalesce(tu.riyadhoh, tp.riyadhoh, td.riyadhoh), v_n)
    ) / 8 as capaian
    from total t
    left join public.targets tu on tu.scope = 'user' and tu.user_id = t.id and t.boleh_target_pribadi
    left join public.targets tp on tp.scope = 'upa'  and tp.upa_id  = t.upa_id
    left join public.targets td on td.scope = 'default'
  )
  select u.id,
         u.nama,
         u.kecamatan,
         count(s.id)::integer,
         coalesce(round(avg(s.capaian), 4), 0),
         count(ms.id)::integer
  from public.upa u
  left join skor s on s.upa_id = u.id
  left join public.monthly_submissions ms on ms.user_id = s.id and ms.month = v_awal
  group by u.id, u.nama, u.kecamatan
  order by u.kecamatan, u.nama;
end;
$$;

revoke execute on function public.rekap_kecamatan(text) from public, anon;
grant  execute on function public.rekap_kecamatan(text) to authenticated;
