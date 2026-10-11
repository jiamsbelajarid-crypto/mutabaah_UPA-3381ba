import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LABEL_PERAN, type Peran } from '../data/fixtures'
import { useStore } from '../data/store'
import { AMALAN, TARGET_DEFAULT, type Target } from '../lib/amalan'
import { JudulHalaman } from '../components/Layout'
import { Ikon } from '../components/Ikon'

function useTema() {
  const [gelap, setGelap] = useState(() => document.documentElement.classList.contains('dark'))
  const ubah = (g: boolean) => {
    document.documentElement.classList.toggle('dark', g)
    localStorage.setItem('tema', g ? 'gelap' : 'terang')
    setGelap(g)
  }
  return [gelap, ubah] as const
}

const input =
  'w-full rounded-2xl border border-line bg-bg px-4 py-3 text-base focus:border-primer focus:outline-none focus-visible:ring-4 focus-visible:ring-primer/20'

export default function Profil() {
  const { profil, upa, ubahProfil, keluar, target, ubahTargetPribadi, bolehTargetPribadi } = useStore()
  const [nama, setNama] = useState(profil.nama)
  const [errNama, setErrNama] = useState('')
  const [pesan, setPesan] = useState('')
  const [tgt, setTgt] = useState<Record<string, string>>(() => Object.fromEntries(AMALAN.map((a) => [a.key, String(target[a.key])])))
  const [errTgt, setErrTgt] = useState('')
  const [gelap, setGelap] = useTema()
  const nav = useNavigate()

  function simpanNama(e: FormEvent) {
    e.preventDefault()
    if (nama.trim().length < 3) return setErrNama('Tulis nama lengkap minimal 3 huruf.')
    setErrNama('')
    ubahProfil({ nama: nama.trim() })
    setPesan('Nama berhasil diperbarui.')
  }

  function simpanTarget(e: FormEvent) {
    e.preventDefault()
    const salah = AMALAN.find((a) => {
      const n = Number(tgt[a.key])
      return !Number.isInteger(n) || n < 1 || n > a.maks
    })
    if (salah) return setErrTgt(`Target ${salah.nama} harus 1–${salah.maks}. Perbaiki lalu simpan lagi.`)
    setErrTgt('')
    const pribadi: Partial<Target> = {}
    for (const a of AMALAN) if (Number(tgt[a.key]) !== TARGET_DEFAULT[a.key]) pribadi[a.key] = Number(tgt[a.key])
    ubahTargetPribadi(pribadi)
    setPesan('Target pribadi tersimpan.')
  }

  return (
    <div>
      <JudulHalaman judul="Profil" />
      <div className="grid gap-4">
        <section className="kartu flex items-center gap-4 p-5">
          <div className="hero grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-extrabold text-white">
            {profil.nama.split(' ').map((s) => s[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold">{profil.nama}</p>
            <p className="text-sm text-muted">@{profil.username} · {upa.nama}</p>
            <span className="mt-1 inline-block rounded-full bg-primer/10 px-2.5 py-0.5 text-xs font-bold text-primer dark:bg-primer/30 dark:text-white">
              {LABEL_PERAN[profil.role]}
            </span>
          </div>
        </section>

        {pesan && (
          <p role="status" className="animasi-naik rounded-2xl bg-mint/12 px-4 py-3 text-sm font-medium text-[#08785c] dark:text-mint">
            {pesan}
          </p>
        )}

        <form onSubmit={simpanNama} noValidate className="kartu grid gap-3 p-5">
          <label htmlFor="nama" className="font-bold">Nama lengkap</label>
          <input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className={input} aria-invalid={!!errNama} />
          {errNama && <p role="alert" className="text-xs font-medium text-koral">{errNama}</p>}
          <button className="rounded-2xl bg-primer py-3 font-bold text-white hover:bg-[#3a2be6]">Simpan nama</button>
        </form>

        <form onSubmit={simpanTarget} noValidate className="kartu p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold">Target pribadi per pekan</h2>
              <p className="text-xs text-muted">Samakan dengan nilai default untuk mengikuti target UPA.</p>
            </div>
            {!bolehTargetPribadi && <Ikon nama="gembok" className="text-muted" />}
          </div>
          {bolehTargetPribadi ? (
            <>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {AMALAN.map((a) => (
                  <label key={a.key} className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-2.5">
                    <span className="text-sm font-semibold leading-tight">
                      {a.nama}
                      <span className="block text-[11px] font-normal text-muted">default {TARGET_DEFAULT[a.key]} {a.satuan}</span>
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={a.maks}
                      value={tgt[a.key]}
                      onChange={(e) => setTgt((t) => ({ ...t, [a.key]: e.target.value }))}
                      className="h-10 w-20 rounded-xl border border-line bg-card text-center font-bold focus:border-primer focus:outline-none"
                    />
                  </label>
                ))}
              </div>
              {errTgt && <p role="alert" className="mt-2 text-xs font-medium text-koral">{errTgt}</p>}
              <button className="mt-3 w-full rounded-2xl bg-primer py-3 font-bold text-white hover:bg-[#3a2be6]">Simpan target pribadi</button>
            </>
          ) : (
            <p className="text-sm text-muted">Admin belum mengizinkan target pribadi. Target mengikuti pengaturan UPA.</p>
          )}
        </form>

        <section className="kartu divide-y divide-line">
          <div className="flex items-center justify-between gap-3 p-5">
            <span className="flex items-center gap-3 font-bold">
              <Ikon nama={gelap ? 'bulan' : 'matahari'} /> Mode gelap
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={gelap}
              aria-label="Mode gelap"
              onClick={() => setGelap(!gelap)}
              className={`relative h-8 w-14 rounded-full transition ${gelap ? 'bg-primer' : 'bg-line'}`}
            >
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${gelap ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="p-5">
            <label htmlFor="pratinjau-peran" className="font-bold">Pratinjau sebagai peran</label>
            <p className="mb-2 text-xs text-muted">Khusus mode pratinjau. Di aplikasi asli, peran hanya bisa diubah admin.</p>
            <select
              id="pratinjau-peran"
              value={profil.role}
              onChange={(e) => ubahProfil({ role: e.target.value as Peran })}
              className={input}
            >
              {(Object.keys(LABEL_PERAN) as Peran[]).map((r) => (
                <option key={r} value={r}>{LABEL_PERAN[r]}</option>
              ))}
            </select>
          </div>
          <div className="p-5">
            <button
              type="button"
              onClick={() => { keluar(); nav('/') }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-koral/30 py-3 font-bold text-koral transition hover:bg-koral/8"
            >
              <Ikon nama="keluar" width={18} height={18} /> Keluar
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
