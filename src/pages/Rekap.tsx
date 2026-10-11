import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { KECAMATAN, LABEL_PERAN, rekapKecamatanContoh, rekapUpaContoh, type BarisRekapUpa } from '../data/fixtures'
import { useStore } from '../data/store'
import { bulanIni, geserBulan, namaBulan } from '../lib/pekan'
import { persen } from '../lib/skor'
import { JudulHalaman } from '../components/Layout'
import { Pemilih } from '../components/Navigasi'
import { Bar } from '../components/Grafik'
import { Ikon } from '../components/Ikon'

function unduhCsv(ym: string, upa: string, rows: BarisRekapUpa[]) {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
  const isi = [
    ['Nama', 'Peran', 'Capaian (%)', 'Status setoran'].join(','),
    ...rows.map((r) => [esc(r.nama), LABEL_PERAN[r.role], Math.round(r.capaian * 100), r.sudahSetor ? 'Sudah setor' : 'Belum setor'].join(',')),
  ].join('\n')
  const url = URL.createObjectURL(new Blob(['﻿' + isi], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `rekap-${upa.toLowerCase().replace(/\s+/g, '-')}-${ym}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function Ringkas({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="kartu p-4">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-0.5 text-2xl font-extrabold">{nilai}</p>
    </div>
  )
}

function RekapUpa({ ym }: { ym: string }) {
  const { upa } = useStore()
  const rows = rekapUpaContoh(ym)
  const rata = rows.reduce((s, r) => s + r.capaian, 0) / rows.length
  const setor = rows.filter((r) => r.sudahSetor).length
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Ringkas label="Anggota" nilai={String(rows.length)} />
        <Ringkas label="Rata-rata" nilai={persen(rata)} />
        <Ringkas label="Sudah setor" nilai={`${setor}/${rows.length}`} />
      </div>
      <section className="kartu overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-5 pb-3">
          <h2 className="font-bold">{upa.nama}</h2>
          <button
            type="button"
            onClick={() => unduhCsv(ym, upa.nama, rows)}
            className="flex items-center gap-1.5 rounded-xl bg-soft px-3 py-2 text-sm font-bold hover:bg-line"
          >
            <Ikon nama="unduh" width={16} height={16} /> Ekspor CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <caption className="sr-only">Capaian anggota dan binaan {upa.nama} bulan {namaBulan(ym)}</caption>
            <thead>
              <tr className="border-y border-line bg-soft/60 text-left text-xs text-muted">
                <th scope="col" className="px-5 py-2.5 font-semibold">Nama</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Capaian</th>
                <th scope="col" className="px-5 py-2.5 text-right font-semibold">Setoran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.nama}>
                  <th scope="row" className="px-5 py-3 text-left font-semibold">
                    {r.nama}
                    <span className="block text-xs font-normal text-muted">{LABEL_PERAN[r.role]}</span>
                  </th>
                  <td className="w-2/5 px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <Bar nilai={r.capaian} />
                      <span className="w-10 shrink-0 text-right font-bold">{persen(r.capaian)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        r.sudahSetor ? 'bg-mint/15 text-[#08785c] dark:text-mint' : 'bg-koral/12 text-[#c22c40] dark:text-koral'
                      }`}
                    >
                      {r.sudahSetor ? 'Sudah' : 'Belum'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function RekapKecamatan({ ym }: { ym: string }) {
  const rows = rekapKecamatanContoh(ym).sort((a, b) => b.rataCapaian - a.rataCapaian)
  const total = rows.reduce((s, r) => s + r.jumlahAnggota, 0)
  const setor = rows.reduce((s, r) => s + r.sudahSetor, 0)
  const rata = rows.reduce((s, r) => s + r.rataCapaian * r.jumlahAnggota, 0) / total
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Ringkas label="UPA" nilai={String(rows.length)} />
        <Ringkas label="Rata-rata" nilai={persen(rata)} />
        <Ringkas label="Sudah setor" nilai={`${setor}/${total}`} />
      </div>
      <section className="kartu p-5">
        <h2 className="font-bold">Perbandingan antar UPA</h2>
        <p className="mb-4 text-xs text-muted">Hanya angka agregat per UPA. Isian pribadi tidak ditampilkan.</p>
        <ul className="grid gap-4">
          {rows.map((r, i) => (
            <li key={r.upa.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">
                  <span className="mr-2 text-muted">{i + 1}.</span>
                  {r.upa.nama}
                </p>
                <p className="text-sm font-extrabold">{persen(r.rataCapaian)}</p>
              </div>
              <Bar nilai={r.rataCapaian} tinggi={12} warna="#8A5CFF" />
              <p className="mt-1 text-xs text-muted">
                {r.sudahSetor} dari {r.jumlahAnggota} orang sudah setor
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default function Rekap() {
  const { profil } = useStore()
  const [ym, setYm] = useState(bulanIni())
  const bolehUpa = profil.role === 'pembina' || profil.role === 'admin'
  const bolehKec = profil.role === 'koordinator' || profil.role === 'admin'
  const [tab, setTab] = useState<'upa' | 'kecamatan'>(bolehUpa ? 'upa' : 'kecamatan')

  if (!bolehUpa && !bolehKec) return <Navigate to="/beranda" replace />
  const aktif = bolehUpa && bolehKec ? tab : bolehUpa ? 'upa' : 'kecamatan'

  return (
    <div>
      <JudulHalaman judul={aktif === 'upa' ? 'Rekap UPA' : 'Rekap Kecamatan'} sub={aktif === 'upa' ? 'Capaian anggota dan binaan di UPA Anda.' : KECAMATAN} />
      <div className="grid gap-4">
        {bolehUpa && bolehKec && (
          <div role="tablist" aria-label="Jenis rekap" className="grid grid-cols-2 rounded-2xl bg-soft p-1">
            {(['upa', 'kecamatan'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={aktif === t}
                onClick={() => setTab(t)}
                className={`rounded-xl py-2.5 text-sm font-bold transition ${aktif === t ? 'bg-card text-primer shadow-sm dark:text-[#b4a9ff]' : 'text-muted'}`}
              >
                {t === 'upa' ? 'UPA' : 'Kecamatan'}
              </button>
            ))}
          </div>
        )}
        <Pemilih
          label={namaBulan(ym)}
          onPrev={() => setYm(geserBulan(ym, -1))}
          onNext={() => setYm(geserBulan(ym, 1))}
          nextDisabled={ym >= bulanIni()}
          labelPrev="Bulan sebelumnya"
          labelNext="Bulan berikutnya"
        />
        {aktif === 'upa' ? <RekapUpa ym={ym} /> : <RekapKecamatan ym={ym} />}
      </div>
    </div>
  )
}
