// DATA CONTOH — seluruh data tiruan ada di file ini.
// Milestone berikutnya menggantinya dengan query Supabase (lihat PLAN.md).
import { AMALAN, type Nilai } from '../lib/amalan'
import { geserBulan, pekanDalamBulan, pekanIni, bulanIni } from '../lib/pekan'

export type Peran = 'anggota' | 'binaan' | 'pembina' | 'koordinator' | 'admin'

export interface Upa {
  id: string
  nama: string
  kecamatan: string
}

export interface Profil {
  id: string
  nama: string
  username: string
  role: Peran
  upa_id: string
}

export const KECAMATAN = 'Kecamatan Sukajadi'

export const DAFTAR_UPA: Upa[] = [
  { id: 'upa-1', nama: 'UPA Al Fatih', kecamatan: KECAMATAN },
  { id: 'upa-2', nama: 'UPA An Nur', kecamatan: KECAMATAN },
  { id: 'upa-3', nama: 'UPA Ar Rahman', kecamatan: KECAMATAN },
  { id: 'upa-4', nama: 'UPA Al Ikhlas', kecamatan: KECAMATAN },
]

export const PROFIL_CONTOH: Profil = {
  id: 'u-1',
  nama: 'Ahmad Fauzan',
  username: 'fauzan',
  role: 'anggota',
  upa_id: 'upa-1',
}

// Pseudo-acak deterministik agar data contoh stabil di setiap muat ulang.
function acak(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function nilaiAcak(seed: string, rajin: number, porsi = 1): Nilai {
  const r = acak(seed)
  return Object.fromEntries(
    AMALAN.map((a) => {
      const f = Math.max(0, rajin + (r() - 0.5) * 0.7) * porsi
      return [a.key, Math.min(a.maks, Math.round(a.targetPekan * f))]
    }),
  ) as Nilai
}

/** Isian pekanan pengguna contoh: dua bulan lalu sampai pekan ini (pekan ini baru sebagian). */
export function entriContoh(): Record<string, Nilai> {
  const kini = pekanIni()
  const hasil: Record<string, Nilai> = {}
  for (const ym of [geserBulan(bulanIni(), -2), geserBulan(bulanIni(), -1), bulanIni()]) {
    for (const w of pekanDalamBulan(ym)) {
      if (w > kini) continue
      hasil[w] = nilaiAcak(`fauzan-${w}`, 0.95, w === kini ? 0.45 : 1)
    }
  }
  return hasil
}

export function setoranContoh(): Record<string, string> {
  const lalu = geserBulan(bulanIni(), -1)
  const duaLalu = geserBulan(bulanIni(), -2)
  return {
    [duaLalu]: `${geserBulan(bulanIni(), -1)}-01T20:14:00+07:00`,
    [lalu]: `${bulanIni()}-02T21:03:00+07:00`,
  }
}

// ---- Rekap UPA (pembina) ----
const NAMA_UPA_1: [string, Peran][] = [
  ['Ahmad Fauzan', 'anggota'],
  ['Bilal Ramadhan', 'anggota'],
  ['Dimas Pratama', 'binaan'],
  ['Fikri Hidayat', 'anggota'],
  ['Hasan Basri', 'binaan'],
  ['Irfan Maulana', 'anggota'],
  ['Luthfi Hakim', 'binaan'],
  ['Rizky Aditya', 'anggota'],
]

export interface BarisRekapUpa {
  nama: string
  role: Peran
  capaian: number
  sudahSetor: boolean
  disetorPada?: string
}

export function rekapUpaContoh(ym: string): BarisRekapUpa[] {
  const sudahLewat = ym < bulanIni()
  return NAMA_UPA_1.map(([nama, role]) => {
    const r = acak(`${nama}-${ym}`)
    const capaian = Math.min(1, 0.45 + r() * 0.6) * (ym === bulanIni() ? 0.5 : 1)
    const sudahSetor = sudahLewat ? r() > 0.15 : r() > 0.85
    return {
      nama,
      role,
      capaian,
      sudahSetor,
      disetorPada: sudahSetor ? `${ym}-28` : undefined,
    }
  })
}

// ---- Rekap kecamatan (koordinator) — hanya agregat, tanpa data pribadi ----
export interface BarisRekapKecamatan {
  upa: Upa
  jumlahAnggota: number
  rataCapaian: number
  sudahSetor: number
}

export function rekapKecamatanContoh(ym: string): BarisRekapKecamatan[] {
  const jumlah = [8, 7, 9, 6]
  return DAFTAR_UPA.map((upa, i) => {
    const r = acak(`${upa.id}-${ym}`)
    const n = jumlah[i]
    return {
      upa,
      jumlahAnggota: n,
      rataCapaian: Math.min(1, 0.55 + r() * 0.4) * (ym === bulanIni() ? 0.5 : 1),
      sudahSetor: ym < bulanIni() ? Math.round(n * (0.6 + r() * 0.4)) : Math.round(n * r() * 0.3),
    }
  })
}

export const LABEL_PERAN: Record<Peran, string> = {
  anggota: 'Anggota',
  binaan: 'Binaan',
  pembina: 'Pembina',
  koordinator: 'Koordinator',
  admin: 'Admin',
}

