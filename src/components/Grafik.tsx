import { AMALAN, type Nilai, type Target } from '../lib/amalan'
import { labelPekan, rentangPekan } from '../lib/pekan'
import { persen } from '../lib/skor'

export function Cincin({ nilai, ukuran = 132 }: { nilai: number; ukuran?: number }) {
  const s = 12
  const r = (ukuran - s) / 2
  const k = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: ukuran, height: ukuran }}>
      <svg viewBox={`0 0 ${ukuran} ${ukuran}`} className="-rotate-90" role="img" aria-label={`Capaian ${persen(nilai)}`}>
        <circle cx={ukuran / 2} cy={ukuran / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth={s} />
        <circle
          cx={ukuran / 2}
          cy={ukuran / 2}
          r={r}
          fill="none"
          stroke="url(#cincin)"
          strokeWidth={s}
          strokeLinecap="round"
          strokeDasharray={k}
          strokeDashoffset={k * (1 - Math.min(1, nilai))}
          style={{ transition: 'stroke-dashoffset .8s ease' }}
        />
        <defs>
          <linearGradient id="cincin" x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#FFE08A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-3xl font-extrabold leading-none">{persen(nilai)}</p>
          <p className="mt-1 text-[11px] font-medium text-white/80">bulan ini</p>
        </div>
      </div>
    </div>
  )
}

export function GrafikPekan({
  data,
}: {
  data: { weekStart: string; skor: number; mendatang: boolean }[]
}) {
  const T = 132
  const kolom = 'flex flex-1 justify-center'
  return (
    <figure>
      <div className="flex gap-2 pb-1.5">
        {data.map((d) => (
          <span key={d.weekStart} className={`${kolom} text-[11px] font-bold ${d.mendatang ? 'text-muted/60' : ''}`}>
            {d.mendatang ? '–' : persen(d.skor)}
          </span>
        ))}
      </div>
      <div className="relative" style={{ height: T }}>
        <ul className="absolute inset-0 flex items-end gap-2">
          {data.map((d) => (
            <li key={d.weekStart} className={kolom}>
              <div
                className={`w-full max-w-11 rounded-t-xl rounded-b-md transition-[height] duration-700 ${
                  d.mendatang ? 'bg-soft' : d.skor >= 1 ? 'bg-mint' : 'bg-linear-to-t from-primer to-ungu'
                }`}
                style={{ height: d.mendatang ? T : Math.max(4, Math.min(1, d.skor) * T), opacity: d.mendatang ? 0.6 : 1 }}
                title={`${labelPekan(d.weekStart)} · ${rentangPekan(d.weekStart)}`}
              />
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 border-t-2 border-dashed border-kuning" />
      </div>
      <div className="flex gap-2 pt-1.5">
        {data.map((d) => (
          <span key={d.weekStart} className={`${kolom} text-xs font-semibold ${d.mendatang ? 'text-muted/60' : 'text-muted'}`}>
            {labelPekan(d.weekStart)}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${labelPekan(d.weekStart)}: ${d.mendatang ? 'belum dimulai' : persen(d.skor)}`).join(', ')}
      </figcaption>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><i className="inline-block w-4 border-t-2 border-dashed border-kuning" /> Target pekanan 100%</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-full bg-mint" /> Target tercapai</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-full bg-primer" /> Belum tercapai</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-full bg-soft ring-1 ring-line" /> Pekan mendatang</span>
      </div>
    </figure>
  )
}

export function Bar({ nilai, warna, tinggi = 8 }: { nilai: number; warna?: string; tinggi?: number }) {
  const v = Math.min(1, nilai)
  return (
    <div className="w-full overflow-hidden rounded-full bg-soft" style={{ height: tinggi }}>
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${v * 100}%`, background: v >= 1 ? '#0FBF92' : (warna ?? '#4B3BFF') }}
      />
    </div>
  )
}

export function ProgresAmalan({ totals, targetBulan }: { totals: Nilai; targetBulan: Target }) {
  return (
    <ul className="divide-y divide-line">
      {AMALAN.map((a) => {
        const r = targetBulan[a.key] ? totals[a.key] / targetBulan[a.key] : 1
        return (
          <li key={a.key} className="py-3 first:pt-0 last:pb-0">
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold">{a.nama}</p>
              <p className="shrink-0 text-xs text-muted">
                <b className="text-sm text-ink">{totals[a.key]}</b> / {targetBulan[a.key]} {a.satuan}
              </p>
            </div>
            <Bar nilai={r} warna={a.warna} />
          </li>
        )
      })}
    </ul>
  )
}
