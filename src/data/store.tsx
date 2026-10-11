import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { TARGET_DEFAULT, type Nilai, type Target } from '../lib/amalan'
import { DAFTAR_UPA, PROFIL_CONTOH, entriContoh, setoranContoh, type Profil } from './fixtures'

// Penyimpanan sementara di perangkat untuk pratinjau.
// Di milestone Supabase, fungsi-fungsi di sini diganti panggilan ke tabel
// weekly_entries, monthly_submissions, profiles, dan targets.

interface State {
  masuk: boolean
  profil: Profil
  entries: Record<string, Nilai>
  setoran: Record<string, string>
  targetPribadi: Partial<Target>
}

interface Store extends State {
  upa: (typeof DAFTAR_UPA)[number]
  target: Target
  bolehTargetPribadi: boolean
  masukDemo: (nama?: string) => void
  keluar: () => void
  simpanPekan: (weekStart: string, nilai: Nilai) => void
  setor: (ym: string) => void
  ubahProfil: (p: Partial<Profil>) => void
  ubahTargetPribadi: (t: Partial<Target>) => void
}

const KUNCI = 'mutabaah-pratinjau-v1'

function awal(): State {
  try {
    const raw = localStorage.getItem(KUNCI)
    if (raw) return JSON.parse(raw)
  } catch {
    /* abaikan data rusak */
  }
  return {
    masuk: false,
    profil: PROFIL_CONTOH,
    entries: entriContoh(),
    setoran: setoranContoh(),
    targetPribadi: {},
  }
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(awal)

  useEffect(() => {
    localStorage.setItem(KUNCI, JSON.stringify(state))
  }, [state])

  const store = useMemo<Store>(() => {
    const upa = DAFTAR_UPA.find((u) => u.id === state.profil.upa_id) ?? DAFTAR_UPA[0]
    return {
      ...state,
      upa,
      // Prioritas target: user > upa > default.
      target: { ...TARGET_DEFAULT, ...state.targetPribadi },
      bolehTargetPribadi: true,
      masukDemo: (nama) =>
        setState((s) => ({ ...s, masuk: true, profil: nama ? { ...s.profil, nama } : s.profil })),
      keluar: () => setState((s) => ({ ...s, masuk: false })),
      simpanPekan: (w, nilai) => setState((s) => ({ ...s, entries: { ...s.entries, [w]: nilai } })),
      setor: (ym) =>
        setState((s) => ({ ...s, setoran: { ...s.setoran, [ym]: new Date().toISOString() } })),
      ubahProfil: (p) => setState((s) => ({ ...s, profil: { ...s.profil, ...p } })),
      ubahTargetPribadi: (t) => setState((s) => ({ ...s, targetPribadi: t })),
    }
  }, [state])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore harus dipakai di dalam StoreProvider')
  return s
}
