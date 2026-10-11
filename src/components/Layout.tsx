import { NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../data/store'
import { Ikon, type NamaIkon } from './Ikon'

const MENU: { to: string; label: string; ikon: NamaIkon }[] = [
  { to: '/beranda', label: 'Beranda', ikon: 'beranda' },
  { to: '/isi', label: 'Isi', ikon: 'isi' },
  { to: '/setoran', label: 'Setoran', ikon: 'setoran' },
  { to: '/riwayat', label: 'Riwayat', ikon: 'riwayat' },
  { to: '/profil', label: 'Profil', ikon: 'profil' },
]

export function Layout() {
  const { profil } = useStore()
  const bolehRekap = ['pembina', 'koordinator', 'admin'].includes(profil.role)
  const menu = bolehRekap
    ? [...MENU.slice(0, 4), { to: '/rekap', label: 'Rekap', ikon: 'rekap' as NamaIkon }, MENU[4]]
    : MENU

  return (
    <div className="min-h-dvh">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-card focus:px-4 focus:py-2"
      >
        Lompat ke konten
      </a>
      <main id="konten" className="pt-safe mx-auto w-full max-w-xl px-4 pb-32 md:max-w-3xl">
        <Outlet />
      </main>
      <nav
        aria-label="Navigasi utama"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/90 backdrop-blur-xl"
      >
        <ul className="mx-auto flex max-w-xl justify-around px-1 md:max-w-3xl">
          {menu.map((m) => (
            <li key={m.to} className="flex-1">
              <NavLink
                to={m.to}
                className={({ isActive }) =>
                  `group flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                    isActive ? 'text-primer dark:text-[#a99cff]' : 'text-muted hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-8 w-12 place-items-center rounded-full transition-colors ${
                        isActive ? 'bg-primer/12 dark:bg-primer/30' : ''
                      }`}
                    >
                      <Ikon nama={m.ikon} width={20} height={20} />
                    </span>
                    {m.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export function JudulHalaman({ judul, sub }: { judul: string; sub?: string }) {
  return (
    <header className="pb-4 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight">{judul}</h1>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </header>
  )
}
