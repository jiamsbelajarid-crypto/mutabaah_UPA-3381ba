export type AmalanKey =
  | 'tilawah'
  | 'shaum'
  | 'tahajud'
  | 'hafalan'
  | 'buku'
  | 'jamaah'
  | 'dzikir'
  | 'riyadhoh'

export interface Amalan {
  key: AmalanKey
  nama: string
  satuan: string
  targetPekan: number
  input: 'angka' | 'pilihan'
  maks: number
  warna: string
}

export const AMALAN: Amalan[] = [
  { key: 'tilawah', nama: "Tilawah Al Qur'an", satuan: 'halaman', targetPekan: 70, input: 'angka', maks: 2000, warna: '#4B3BFF' },
  { key: 'shaum', nama: 'Shaum sunnah', satuan: 'hari', targetPekan: 2, input: 'pilihan', maks: 7, warna: '#8A5CFF' },
  { key: 'tahajud', nama: 'Tahajud mandiri', satuan: 'malam', targetPekan: 3, input: 'pilihan', maks: 7, warna: '#2E8BFF' },
  { key: 'hafalan', nama: "Hapalan Al Qur'an & Hadis", satuan: 'ayat/hadis', targetPekan: 7, input: 'angka', maks: 500, warna: '#0FBF92' },
  { key: 'buku', nama: 'Membaca buku Islamy', satuan: 'halaman', targetPekan: 75, input: 'angka', maks: 2000, warna: '#FF8A3D' },
  { key: 'jamaah', nama: 'Shalat berjamaah', satuan: 'waktu', targetPekan: 35, input: 'angka', maks: 35, warna: '#E04BD8' },
  { key: 'dzikir', nama: "Dzikir Al Ma'tsurat pagi & petang", satuan: 'sesi', targetPekan: 14, input: 'angka', maks: 14, warna: '#FFB820' },
  { key: 'riyadhoh', nama: 'Riyadhoh', satuan: 'hari', targetPekan: 2, input: 'pilihan', maks: 7, warna: '#FF5A6E' },
]

export type Nilai = Record<AmalanKey, number>
export type Target = Record<AmalanKey, number>

export const TARGET_DEFAULT: Target = Object.fromEntries(
  AMALAN.map((a) => [a.key, a.targetPekan]),
) as Target

export const nilaiKosong = (): Nilai =>
  Object.fromEntries(AMALAN.map((a) => [a.key, 0])) as Nilai
