import { Ikon } from './Ikon'

export function Pemilih({
  label,
  sub,
  onPrev,
  onNext,
  nextDisabled,
  labelPrev,
  labelNext,
}: {
  label: string
  sub?: string
  onPrev: () => void
  onNext: () => void
  nextDisabled?: boolean
  labelPrev: string
  labelNext: string
}) {
  const tombol =
    'grid h-11 w-11 place-items-center rounded-full bg-soft text-ink transition hover:bg-primer hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-soft disabled:hover:text-ink'
  return (
    <div className="kartu flex items-center justify-between gap-2 p-2">
      <button type="button" className={tombol} onClick={onPrev} aria-label={labelPrev}>
        <Ikon nama="kiri" />
      </button>
      <div className="text-center" aria-live="polite">
        <p className="font-bold">{label}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
      <button
        type="button"
        className={tombol}
        onClick={onNext}
        disabled={nextDisabled}
        aria-label={labelNext}
      >
        <Ikon nama="kanan" />
      </button>
    </div>
  )
}
