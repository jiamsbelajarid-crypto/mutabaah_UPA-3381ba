import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../data/store'
import { bulanIni, geserBulan, labelPekan, namaBulan, pekanIni, rentangPekan } from '../lib/pekan'
import { persen, rekapBulan } from '../lib/skor'
import { JudulHalaman } from '../components/Layout'
import { Pemilih } from '../components/Navigasi'
import { Bar } from '../components/Grafik'

export default function Riwayat() {
  const { entries, target } = useStore()
  const [ym, setYm] = useState(bulanIni())
  const r = rekapBulan(ym, entries, target)
  const kini = pekanIni()

  return (
    <div>
      <JudulHalaman judul="Riwayat" sub="Pekan-pekan dalam bulan terpilih." />
      <div className="grid gap-4">
        <Pemilih
          label={namaBulan(ym)}
          sub={`Capaian ${persen(r.capaian)}`}
          onPrev={() => setYm(geserBulan(ym, -1))}
          onNext={() => setYm(geserBulan(ym, 1))}
          nextDisabled={ym >= bulanIni()}
          labelPrev="Bulan sebelumnya"
          labelNext="Bulan berikutnya"
        />
        <ul className="grid gap-3">
          {r.skorPerPekan.map((s) => {
            const ada = !!entries[s.weekStart]
            return (
              <li key={s.weekStart} className={`kartu flex items-center gap-4 p-4 ${s.mendatang ? 'opacity-55' : ''}`}>
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-extrabold ${
                    s.skor >= 1 ? 'bg-mint text-white' : 'bg-primer/10 text-primer dark:bg-primer/30 dark:text-white'
                  }`}
                >
                  {labelPekan(s.weekStart)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {rentangPekan(s.weekStart)}
                      {s.weekStart === kini && <span className="ml-1.5 text-xs font-bold text-primer dark:text-[#b4a9ff]">· pekan ini</span>}
                    </p>
                    <p className="text-sm font-bold">{s.mendatang ? '–' : persen(s.skor)}</p>
                  </div>
                  <div className="mt-2">
                    <Bar nilai={s.skor} tinggi={8} />
                  </div>
                </div>
                {s.mendatang ? (
                  <span className="w-16 text-center text-xs font-semibold text-muted">Belum</span>
                ) : (
                  <Link
                    to={`/isi?w=${s.weekStart}`}
                    className={`w-16 rounded-xl py-2 text-center text-sm font-bold transition ${
                      ada ? 'bg-soft text-ink hover:bg-line' : 'bg-primer text-white hover:bg-[#3a2be6]'
                    }`}
                    aria-label={`${ada ? 'Ubah' : 'Isi'} ${labelPekan(s.weekStart)} ${rentangPekan(s.weekStart)}`}
                  >
                    {ada ? 'Ubah' : 'Isi'}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
