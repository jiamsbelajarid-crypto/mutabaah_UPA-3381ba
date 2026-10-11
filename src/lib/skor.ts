import { AMALAN, type Nilai, type Target } from './amalan'
import { pekanDalamBulan, pekanIni } from './pekan'

const rasio = (nilai: number, target: number) => (target <= 0 ? 1 : Math.min(1, nilai / target))

/** Skor pekan = rata-rata min(1, nilai/target pekanan) untuk 8 amalan. */
export function skorPekan(nilai: Nilai | undefined, target: Target): number {
  if (!nilai) return 0
  return AMALAN.reduce((s, a) => s + rasio(nilai[a.key], target[a.key]), 0) / AMALAN.length
}

export interface RekapBulan {
  pekan: string[]
  totals: Nilai
  targetBulan: Target
  capaian: number
  /** Proporsi pekan yang sudah dimulai (target hingga pekan ini). */
  targetHinggaKini: number
  skorPerPekan: { weekStart: string; skor: number; mendatang: boolean }[]
}

export function rekapBulan(ym: string, entries: Record<string, Nilai>, target: Target): RekapBulan {
  const pekan = pekanDalamBulan(ym)
  const kini = pekanIni()
  const totals = Object.fromEntries(
    AMALAN.map((a) => [a.key, pekan.reduce((s, w) => s + (entries[w]?.[a.key] ?? 0), 0)]),
  ) as Nilai
  const targetBulan = Object.fromEntries(
    AMALAN.map((a) => [a.key, target[a.key] * pekan.length]),
  ) as Target
  const capaian =
    AMALAN.reduce((s, a) => s + rasio(totals[a.key], targetBulan[a.key]), 0) / AMALAN.length
  const dimulai = pekan.filter((w) => w <= kini).length
  return {
    pekan,
    totals,
    targetBulan,
    capaian,
    targetHinggaKini: dimulai / pekan.length,
    skorPerPekan: pekan.map((w) => ({
      weekStart: w,
      skor: skorPekan(entries[w], target),
      mendatang: w > kini,
    })),
  }
}

export const persen = (x: number) => `${Math.round(x * 100)}%`
