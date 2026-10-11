// Semua tanggal ditangani sebagai string 'YYYY-MM-DD' (zona Asia/Jakarta),
// lalu dihitung memakai Date UTC agar bebas dari zona waktu perangkat.

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const toDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
const toStr = (d: Date) => d.toISOString().slice(0, 10)

export const tambahHari = (s: string, n: number) => {
  const d = toDate(s)
  d.setUTCDate(d.getUTCDate() + n)
  return toStr(d)
}

export function hariIniJakarta(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Tanggal Senin dari pekan yang memuat tanggal s. */
export function seninDari(s: string): string {
  const offset = (toDate(s).getUTCDay() + 6) % 7
  return tambahHari(s, -offset)
}

/** Bulan ('YYYY-MM') tempat sebuah pekan dihitung: bulan hari Kamis-nya. */
export const bulanDariPekan = (weekStart: string) => tambahHari(weekStart, 3).slice(0, 7)

/** Daftar week_start (Senin) yang masuk ke bulan ym. */
export function pekanDalamBulan(ym: string): string[] {
  let kamis = `${ym}-01`
  while (toDate(kamis).getUTCDay() !== 4) kamis = tambahHari(kamis, 1)
  const hasil: string[] = []
  while (kamis.slice(0, 7) === ym) {
    hasil.push(tambahHari(kamis, -3))
    kamis = tambahHari(kamis, 7)
  }
  return hasil
}

export const pekanIni = () => seninDari(hariIniJakarta())
export const bulanIni = () => bulanDariPekan(pekanIni())

export function geserBulan(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + n, 1))
  return toStr(d).slice(0, 7)
}

export function namaBulan(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return `${BULAN[m - 1]} ${y}`
}

export function rentangPekan(weekStart: string): string {
  const a = toDate(weekStart)
  const b = toDate(tambahHari(weekStart, 6))
  const sama = a.getUTCMonth() === b.getUTCMonth()
  const kiri = sama ? `${a.getUTCDate()}` : `${a.getUTCDate()} ${BULAN_PENDEK[a.getUTCMonth()]}`
  return `${kiri}–${b.getUTCDate()} ${BULAN_PENDEK[b.getUTCMonth()]} ${b.getUTCFullYear()}`
}

/** Nomor pekan (1-based) dalam bulannya, mis. "P2". */
export function labelPekan(weekStart: string): string {
  const idx = pekanDalamBulan(bulanDariPekan(weekStart)).indexOf(weekStart)
  return `P${idx + 1}`
}
