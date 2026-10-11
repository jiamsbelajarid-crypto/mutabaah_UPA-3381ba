import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Dashboard Supabase memberi nama NEXT_PUBLIC_*; Vite hanya membaca VITE_* secara bawaan.
  // Kedua awalan diterima. Jangan pernah memakai awalan ini untuk kunci rahasia (service_role).
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
