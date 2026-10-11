import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../data/store'
import { AMALAN, nilaiKosong, type Amalan, type AmalanKey, type Nilai } from '../lib/amalan'
import { bulanDariPekan, labelPekan, namaBulan, pekanIni, rentangPekan, seninDari, tambahHari } from '../lib/pekan'
import { persen, skorPekan } from '../lib/skor'
import { JudulHalaman } from '../components/Layout'
import { Pemilih } from '../components/Navigasi'
import { Bar } from '../components/Grafik'
import { Ikon } from '../components/Ikon'

type Teks = Record<AmalanKey, string>

const keTeks = (n: Nilai) => Object.fromEntries(AMALAN.map((a) => [a.key, String(n[a.key])])) as Teks

function galat(a: Amalan, v: string): string | undefined {
  if (v.trim() === '') return `Isi angka 0 bila belum ada ${a.satuan}.`
  const n = Number(v)
  if (!Number.isInteger(n)) return 'Gunakan bilangan bulat tanpa koma.'
  if (n < 0) return 'Nilai tidak boleh negatif.'
  if (n > a.maks) return `Maksimal ${a.maks} ${a.satuan} per pekan. Periksa kembali angkanya.`
}

export default function Isi() {
  const { entries, simpanPekan, target } = useStore()
  const [params, setParams] = useSearchParams()
  const kini = pekanIni()
  const diminta = params.get('w')
  const w = diminta && /^\d{4}-\d{2}-\d{2}$/.test(diminta) && seninDari(diminta) <= kini ? seninDari(diminta) : kini

  const [teks, setTeks] = useState<Teks>(() => keTeks(entries[w] ?? nilaiKosong()))
  const [terkirim, setTerkirim] = useState(false)
  const [pesan, setPesan] = useState('')

  useEffect(() => {
    setTeks(keTeks(entries[w] ?? nilaiKosong()))
    setTerkirim(false)
    setPesan('')
  }, [w])

  const galatList = Object.fromEntries(AMALAN.map((a) => [a.key, galat(a, teks[a.key])]))
  const adaGalat = AMALAN.some((a) => galatList[a.key])
  const nilaiSementara = Object.fromEntries(AMALAN.map((a) => [a.key, Math.max(0, Number(teks[a.key]) || 0)])) as Nilai
  const skor = skorPekan(nilaiSementara, target)
  const tersimpan = entries[w]
  const berubah = AMALAN.some((a) => String(tersimpan?.[a.key] ?? 0) !== teks[a.key])

  const pindah = (n: number) => setParams({ w: tambahHari(w, n * 7) })
  const ubah = (k: AmalanKey, v: string) => {
    setTeks((t) => ({ ...t, [k]: v }))
    setPesan('')
  }

  function kirim(e: FormEvent) {
    e.preventDefault()
    setTerkirim(true)
    if (adaGalat) {
      setPesan('')
      const pertama = AMALAN.find((a) => galatList[a.key])
      document.getElementById(`in-${pertama?.key}`)?.focus()
      return
    }
    simpanPekan(w, nilaiSementara)
    setPesan(`Tersimpan. Anda bisa melanjutkan isian ${labelPekan(w)} kapan saja.`)
  }

  return (
    <div>
      <JudulHalaman judul="Isi mutabaah" sub="Satu formulir untuk total satu pekan. Boleh dicicil, simpan kapan saja." />
      <div className="grid gap-4">
        <Pemilih
          label={`${labelPekan(w)} · ${namaBulan(bulanDariPekan(w))}`}
          sub={rentangPekan(w) + (w === kini ? ' · pekan ini' : '')}
          onPrev={() => pindah(-1)}
          onNext={() => pindah(1)}
          nextDisabled={w >= kini}
          labelPrev="Pekan sebelumnya"
          labelNext="Pekan berikutnya"
        />

        <div className="kartu flex items-center gap-4 p-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted">Skor pekan ini</p>
            <p className="text-2xl font-extrabold">{persen(skor)}</p>
          </div>
          <div className="w-1/2">
            <Bar nilai={skor} tinggi={10} />
            <p className="mt-1.5 text-right text-xs text-muted">
              {tersimpan ? (berubah ? 'Ada perubahan belum disimpan' : 'Semua perubahan tersimpan') : 'Belum ada isian'}
            </p>
          </div>
        </div>

        <form onSubmit={kirim} noValidate className="grid gap-3">
          {AMALAN.map((a) => {
            const g = terkirim ? galatList[a.key] : galat(a, teks[a.key]) && teks[a.key] !== '' ? galatList[a.key] : undefined
            const n = Number(teks[a.key]) || 0
            return (
              <fieldset key={a.key} className="kartu p-4">
                <div className="flex items-start justify-between gap-3">
                  <legend className="contents">
                    <span className="flex items-center gap-2.5">
                      <i className="h-8 w-1.5 rounded-full" style={{ background: a.warna }} aria-hidden="true" />
                      <span>
                        <span className="block font-bold leading-tight">{a.nama}</span>
                        <span className="text-xs text-muted">
                          Target {target[a.key]} {a.satuan}/pekan · maks {a.maks}
                        </span>
                      </span>
                    </span>
                  </legend>
                  {n >= target[a.key] && (
                    <span className="shrink-0 rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-bold text-[#08785c] dark:text-mint">Tercapai</span>
                  )}
                </div>

                {a.input === 'pilihan' ? (
                  <div className="mt-3 grid grid-cols-8 gap-1.5" role="radiogroup" aria-label={`${a.nama}, jumlah ${a.satuan}`}>
                    {Array.from({ length: 8 }, (_, i) => (
                      <label key={i} className="relative">
                        <input
                          id={i === 0 ? `in-${a.key}` : undefined}
                          type="radio"
                          name={a.key}
                          value={i}
                          checked={teks[a.key] === String(i)}
                          onChange={() => ubah(a.key, String(i))}
                          className="peer sr-only"
                        />
                        <span className="grid h-11 cursor-pointer place-items-center rounded-xl bg-soft text-sm font-bold transition peer-checked:bg-primer peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-kuning">
                          {i}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => ubah(a.key, String(Math.max(0, n - 1)))}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-soft text-xl font-bold hover:bg-line"
                      aria-label={`Kurangi ${a.nama}`}
                    >
                      −
                    </button>
                    <label className="relative flex-1">
                      <span className="sr-only">{a.nama} ({a.satuan})</span>
                      <input
                        id={`in-${a.key}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={a.maks}
                        value={teks[a.key]}
                        onChange={(e) => ubah(a.key, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        aria-invalid={!!g}
                        aria-describedby={g ? `err-${a.key}` : undefined}
                        className={`h-11 w-full rounded-xl border bg-bg pl-4 pr-24 text-lg font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-primer/20 ${g ? 'border-koral' : 'border-line focus:border-primer'}`}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">{a.satuan}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => ubah(a.key, String(Math.min(a.maks, n + 1)))}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-soft text-xl font-bold hover:bg-line"
                      aria-label={`Tambah ${a.nama}`}
                    >
                      +
                    </button>
                  </div>
                )}
                {g && (
                  <p id={`err-${a.key}`} className="mt-2 text-xs font-medium text-koral" role="alert">
                    {g}
                  </p>
                )}
              </fieldset>
            )
          })}

          <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+84px)] z-10 mt-2">
            {pesan && (
              <p role="status" className="animasi-naik mb-2 flex items-center gap-2 rounded-2xl bg-mint px-4 py-3 text-sm font-semibold text-white shadow-lg">
                <Ikon nama="centang" width={18} height={18} /> {pesan}
              </p>
            )}
            {terkirim && adaGalat && (
              <p role="alert" className="mb-2 rounded-2xl bg-koral px-4 py-3 text-sm font-semibold text-white shadow-lg">
                Ada isian yang perlu diperbaiki. Periksa kolom bertanda merah lalu simpan lagi.
              </p>
            )}
            <button type="submit" className="w-full rounded-2xl bg-primer py-4 font-bold text-white shadow-xl shadow-primer/30 transition hover:bg-[#3a2be6] active:scale-[0.99]">
              {w === kini ? 'Simpan mutabaah pekan ini' : `Simpan mutabaah ${labelPekan(w)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
