import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LABEL_PERAN } from '../data/fixtures'
import { useStore } from '../data/store'
import { bulanIni, geserBulan, hariIniJakarta, namaBulan } from '../lib/pekan'
import { persen, rekapBulan } from '../lib/skor'
import { Cincin, GrafikPekan, ProgresAmalan } from '../components/Grafik'
import { Pemilih } from '../components/Navigasi'
import { Ikon } from '../components/Ikon'

function sapaan() {
  const jam = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false }).format(new Date()),
  )
  if (jam < 11) return 'Selamat pagi'
  if (jam < 15) return 'Selamat siang'
  if (jam < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default function Beranda() {
  const { profil, upa, entries, target } = useStore()
  const [ym, setYm] = useState(bulanIni())
  const r = rekapBulan(ym, entries, target)
  const diAtas = r.capaian >= r.targetHinggaKini
  const bulanBerjalan = ym === bulanIni()
  const tglHariIni = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(hariIniJakarta()))

  return (
    <div className="grid gap-4 pt-4">
      <section className="hero animasi-naik relative overflow-hidden rounded-[28px] p-5 text-white shadow-xl shadow-primer/25">
        <div aria-hidden="true" className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium capitalize text-white/75">{tglHariIni}</p>
            <p className="mt-1 text-sm text-white/85">{sapaan()},</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{profil.nama}</h1>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{LABEL_PERAN[profil.role]}</span>
        </div>
        <p className="relative mt-0.5 text-sm text-white/80">{upa.nama}</p>

        <div className="relative mt-5 flex items-center gap-5">
          <Cincin nilai={r.capaian} />
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                diAtas ? 'bg-mint text-white' : 'bg-[#FFB820] text-[#14163A]'
              }`}
            >
              {diAtas ? <Ikon nama="centang" width={14} height={14} /> : null}
              {diAtas ? 'Di atas target' : 'Perlu dikejar'}
            </span>
            <p className="mt-2 text-sm leading-snug text-white/90">
              Target hingga pekan ini <b>{persen(r.targetHinggaKini)}</b>
              <br />
              Capaian Anda <b>{persen(r.capaian)}</b>
            </p>
            {bulanBerjalan && (
              <Link to="/isi" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-primer transition hover:bg-white/90">
                Isi pekan ini <Ikon nama="panah" width={16} height={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <Pemilih
        label={namaBulan(ym)}
        sub={`${r.pekan.length} pekan`}
        onPrev={() => setYm(geserBulan(ym, -1))}
        onNext={() => setYm(geserBulan(ym, 1))}
        nextDisabled={ym >= bulanIni()}
        labelPrev="Bulan sebelumnya"
        labelNext="Bulan berikutnya"
      />

      <section className="kartu p-5" aria-labelledby="judul-pekan">
        <h2 id="judul-pekan" className="mb-5 font-bold">Capaian per pekan</h2>
        <GrafikPekan data={r.skorPerPekan} />
      </section>

      <section className="kartu p-5" aria-labelledby="judul-amalan">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="judul-amalan" className="font-bold">Progres amalan</h2>
          <p className="text-xs text-muted">bulan ini / target bulanan</p>
        </div>
        <ProgresAmalan totals={r.totals} targetBulan={r.targetBulan} />
      </section>
    </div>
  )
}
