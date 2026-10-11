import { useState } from 'react'
import { useStore } from '../data/store'
import { AMALAN } from '../lib/amalan'
import { bulanIni, geserBulan, labelPekan, namaBulan } from '../lib/pekan'
import { persen, rekapBulan, type RekapBulan } from '../lib/skor'
import { JudulHalaman } from '../components/Layout'
import { Pemilih } from '../components/Navigasi'
import { Bar } from '../components/Grafik'
import { Ikon } from '../components/Ikon'

export function teksRekap(ym: string, nama: string, upa: string, r: RekapBulan) {
  const baris = [
    `*Mutabaah Yaumiyah — ${namaBulan(ym)}*`,
    `${nama} · ${upa}`,
    '',
    ...AMALAN.map((a) => {
      const t = r.targetBulan[a.key]
      const p = t ? Math.min(1, r.totals[a.key] / t) : 1
      return `• ${a.nama}: ${r.totals[a.key]}/${t} ${a.satuan} (${persen(p)})`
    }),
    '',
    '*Capaian per pekan*',
    ...r.skorPerPekan.map((s) => `${labelPekan(s.weekStart)}: ${s.mendatang ? 'belum dimulai' : persen(s.skor)}`),
    '',
    `*Capaian total: ${persen(r.capaian)}*`,
  ]
  return baris.join('\n')
}

const formatWaktu = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(iso))

export default function Setoran() {
  const { entries, target, profil, upa, setoran, setor } = useStore()
  const [ym, setYm] = useState(bulanIni())
  const [pesan, setPesan] = useState('')
  const r = rekapBulan(ym, entries, target)
  const waktu = setoran[ym]

  async function salin() {
    const t = teksRekap(ym, profil.nama, upa.nama, r)
    try {
      await navigator.clipboard.writeText(t)
      setPesan('Teks rekap tersalin. Tempel di grup WhatsApp UPA Anda.')
    } catch {
      setPesan('Browser menolak akses salin. Tekan lama teks pratinjau di bawah lalu pilih Salin.')
    }
  }

  return (
    <div>
      <JudulHalaman judul="Setoran bulanan" sub="Rekap otomatis dari isian pekanan Anda." />
      <div className="grid gap-4">
        <Pemilih
          label={namaBulan(ym)}
          sub={`${r.pekan.length} pekan`}
          onPrev={() => { setYm(geserBulan(ym, -1)); setPesan('') }}
          onNext={() => { setYm(geserBulan(ym, 1)); setPesan('') }}
          nextDisabled={ym >= bulanIni()}
          labelPrev="Bulan sebelumnya"
          labelNext="Bulan berikutnya"
        />

        <section className="kartu p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-muted">Capaian total</p>
              <p className="text-4xl font-extrabold tracking-tight">{persen(r.capaian)}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                waktu ? 'bg-mint/15 text-[#08785c] dark:text-mint' : 'bg-kuning/20 text-[#8a5d00] dark:text-kuning'
              }`}
            >
              {waktu ? 'Sudah disetor' : 'Belum disetor'}
            </span>
          </div>
          {waktu && <p className="mt-2 text-xs text-muted">Disetor {formatWaktu(waktu)}</p>}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setor(ym)
                setPesan(waktu ? 'Setoran diperbarui dengan data terbaru.' : `Setoran ${namaBulan(ym)} terkirim ke pembina.`)
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primer py-3.5 font-bold text-white shadow-lg shadow-primer/30 transition hover:bg-[#3a2be6]"
            >
              <Ikon nama="setoran" width={18} height={18} />
              {waktu ? 'Perbarui setoran' : 'Setor bulan ini'}
            </button>
            <button
              type="button"
              onClick={salin}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-primer/25 py-3 font-bold text-primer transition hover:bg-primer/8 dark:text-[#b4a9ff]"
            >
              <Ikon nama="salin" width={18} height={18} /> Salin teks rekap
            </button>
          </div>
          {pesan && (
            <p role="status" className="animasi-naik mt-3 rounded-2xl bg-mint/12 px-4 py-3 text-sm font-medium text-[#08785c] dark:text-mint">
              {pesan}
            </p>
          )}
        </section>

        <section className="kartu overflow-hidden" aria-labelledby="judul-rincian">
          <h2 id="judul-rincian" className="px-5 pt-5 font-bold">Rincian amalan</h2>
          <ul className="divide-y divide-line px-5 pb-2">
            {AMALAN.map((a) => {
              const t = r.targetBulan[a.key]
              const p = t ? r.totals[a.key] / t : 1
              return (
                <li key={a.key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 py-3">
                  <p className="text-sm font-semibold">{a.nama}</p>
                  <p className="text-sm font-bold">{persen(Math.min(1, p))}</p>
                  <div className="col-span-2 flex items-center gap-3">
                    <Bar nilai={p} warna={a.warna} />
                    <span className="shrink-0 text-xs text-muted">{r.totals[a.key]}/{t}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="kartu p-5" aria-labelledby="judul-pratinjau">
          <h2 id="judul-pratinjau" className="mb-3 font-bold">Pratinjau teks WhatsApp</h2>
          <pre className="whitespace-pre-wrap rounded-2xl bg-soft p-4 font-sans text-[13px] leading-relaxed">{teksRekap(ym, profil.nama, upa.nama, r)}</pre>
        </section>
      </div>
    </div>
  )
}
