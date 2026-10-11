import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from './data/store'
import { Layout } from './components/Layout'
import Masuk from './pages/Masuk'
import Beranda from './pages/Beranda'
import Isi from './pages/Isi'
import Setoran from './pages/Setoran'
import Riwayat from './pages/Riwayat'
import Profil from './pages/Profil'
import Rekap from './pages/Rekap'

export default function App() {
  const { masuk } = useStore()
  return (
    <Routes>
      <Route path="/" element={masuk ? <Navigate to="/beranda" replace /> : <Masuk />} />
      <Route element={masuk ? <Layout /> : <Navigate to="/" replace />}>
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/isi" element={<Isi />} />
        <Route path="/setoran" element={<Setoran />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/rekap" element={<Rekap />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
