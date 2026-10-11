import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { DAFTAR_UPA, KECAMATAN } from '../data/fixtures'
import { useStore } from '../data/store'
import { Ikon } from '../components/Ikon'

type Mode = 'masuk' | 'daftar' | 'lupa'

const inputKelas =
  'w-full rounded-2xl border border-line bg-bg px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:border-primer focus:outline-none focus-visible:ring-4 focus-visible:ring-primer/20'

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-koral" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export default function Masuk() {
  const [mode, setMode] = useState<Mode>('masuk')
  const [err, setErr] = useState<Record<string, string>>({})
  const [info, setInfo] = useState('')
  const { masukDemo } = useStore()
  const nav = useNavigate()

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const er: Record<string, string> = {}
    if (mode === 'lupa') {
      if (!f.email?.includes('@')) er.email = 'Masukkan alamat email yang terdaftar, contoh: nama@email.com.'
      setErr(er)
      if (!Object.keys(er).length)
        setInfo('Tautan atur ulang password sudah dikirim. Buka email Anda dan ikuti petunjuknya.')
      return
    }
    if (mode === 'daftar') {
      if ((f.nama ?? '').trim().length < 3) er.nama = 'Tulis nama lengkap minimal 3 huruf.'
      if (!f.upa) er.upa = 'Pilih UPA tempat Anda bergabung.'
      if (!f.email?.includes('@')) er.email = 'Masukkan email aktif untuk pemulihan password.'
    }
    if (!/^[a-z0-9_.]{3,20}$/.test(f.username ?? ''))
      er.username = 'Gunakan 3–20 huruf kecil, angka, titik, atau garis bawah tanpa spasi.'
    if ((f.password ?? '').length < 8) er.password = 'Password minimal 8 karakter. Tambahkan beberapa karakter lagi.'
    setErr(er)
    if (Object.keys(er).length) return
    masukDemo(mode === 'daftar' ? f.nama.trim() : undefined)
    nav('/beranda')
  }

  const ganti = (m: Mode) => {
    setMode(m)
    setErr({})
    setInfo('')
  }

  return (
    <div className="pt-safe grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="hero relative overflow-hidden px-6 pb-16 pt-12 text-white lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[#FFB820]/20 blur-2xl" />
        <div className="relative mx-auto max-w-md lg:mx-0">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="h-11 w-11 rounded-2xl ring-2 ring-white/40" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">{KECAMATAN}</p>
          </div>
          <h1 className="mt-8 text-4xl font-extrabold leading-[1.1] tracking-tight lg:text-5xl">
            Mutabaah
            <br />
            Yaumiyah
          </h1>
          <p className="mt-4 max-w-sm text-base text-white/85">
            Catat amalan harian Anda sepekan sekali, pantau capaian bulan ini, dan setorkan rekapnya ke
            pembina dalam satu ketukan.
          </p>
          <ul className="mt-8 hidden gap-3 text-sm lg:grid">
            {['8 amalan pekanan dengan target jelas', 'Rekap otomatis siap kirim ke WhatsApp', 'Data pribadi hanya terlihat oleh Anda dan pembina'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
                  <Ikon nama="centang" width={16} height={16} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="-mt-8 px-4 pb-10 lg:mt-0 lg:flex lg:items-center lg:justify-center lg:px-10">
        <div className="kartu animasi-naik relative mx-auto w-full max-w-md p-6">
          {mode !== 'lupa' ? (
            <div role="tablist" aria-label="Pilih masuk atau daftar" className="mb-6 grid grid-cols-2 rounded-2xl bg-soft p-1">
              {(['masuk', 'daftar'] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  type="button"
                  aria-selected={mode === m}
                  onClick={() => ganti(m)}
                  className={`rounded-xl py-2.5 text-sm font-bold transition ${
                    mode === m ? 'bg-card text-primer shadow-sm dark:text-[#b4a9ff]' : 'text-muted'
                  }`}
                >
                  {m === 'masuk' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-xl font-extrabold">Atur ulang password</h2>
              <p className="mt-1 text-sm text-muted">Masukkan email akun Anda. Kami kirimkan tautan untuk membuat password baru.</p>
            </div>
          )}

          <form onSubmit={kirim} noValidate className="grid gap-4" key={mode}>
            {mode === 'daftar' && (
              <>
                <Field id="nama" label="Nama lengkap" error={err.nama}>
                  <input id="nama" name="nama" autoComplete="name" className={inputKelas} placeholder="mis. Ahmad Fauzan" aria-invalid={!!err.nama} />
                </Field>
                <Field id="upa" label="UPA" error={err.upa}>
                  <select id="upa" name="upa" defaultValue="" className={inputKelas} aria-invalid={!!err.upa}>
                    <option value="" disabled>
                      Pilih UPA Anda
                    </option>
                    {DAFTAR_UPA.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama}
                      </option>
                    ))}
                  </select>
                </Field>
                <fieldset>
                  <legend className="mb-1.5 text-sm font-semibold">Peran</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {['anggota', 'binaan'].map((r, i) => (
                      <label key={r} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-line bg-bg px-4 py-3 text-sm font-semibold capitalize has-[:checked]:border-primer has-[:checked]:bg-primer/8 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primer/20">
                        <input type="radio" name="role" value={r} defaultChecked={i === 0} className="accent-[#4B3BFF]" />
                        {r}
                      </label>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-muted">Peran pembina, koordinator, dan admin diberikan oleh admin.</p>
                </fieldset>
              </>
            )}

            {(mode === 'daftar' || mode === 'lupa') && (
              <Field id="email" label="Email" error={err.email}>
                <input id="email" name="email" type="email" autoComplete="email" inputMode="email" className={inputKelas} placeholder="nama@email.com" aria-invalid={!!err.email} />
              </Field>
            )}

            {mode !== 'lupa' && (
              <>
                <Field id="username" label="Username" error={err.username} hint={mode === 'daftar' ? 'Huruf kecil tanpa spasi, mis. fauzan' : undefined}>
                  <input id="username" name="username" autoComplete="username" autoCapitalize="none" className={inputKelas} placeholder="username" aria-invalid={!!err.username} />
                </Field>
                <Field id="password" label="Password" error={err.password} hint={mode === 'daftar' ? 'Minimal 8 karakter' : undefined}>
                  <input id="password" name="password" type="password" autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'} className={inputKelas} placeholder="••••••••" aria-invalid={!!err.password} />
                </Field>
              </>
            )}

            {info && (
              <p className="rounded-2xl bg-mint/12 px-4 py-3 text-sm font-medium text-[#08785c] dark:text-mint" role="status">
                {info}
              </p>
            )}

            <button type="submit" className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-primer py-3.5 font-bold text-white shadow-lg shadow-primer/30 transition hover:bg-[#3a2be6] active:scale-[0.99]">
              {mode === 'masuk' ? 'Masuk' : mode === 'daftar' ? 'Buat akun' : 'Kirim tautan atur ulang'}
              <Ikon nama="panah" width={18} height={18} />
            </button>

            {mode === 'masuk' && (
              <button type="button" onClick={() => ganti('lupa')} className="justify-self-center text-sm font-semibold text-primer dark:text-[#b4a9ff]">
                Lupa password?
              </button>
            )}
            {mode === 'lupa' && (
              <button type="button" onClick={() => ganti('masuk')} className="justify-self-center text-sm font-semibold text-primer dark:text-[#b4a9ff]">
                Kembali ke halaman masuk
              </button>
            )}
          </form>
          <p className="mt-6 rounded-2xl bg-soft px-4 py-3 text-xs text-muted">
            Mode pratinjau: isi username dan password apa saja (min. 8 karakter) untuk mencoba aplikasi dengan data contoh.
          </p>
        </div>
      </section>
    </div>
  )
}
