import type { SVGProps } from 'react'

const P = {
  beranda: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  isi: 'M12 5v14M5 12h14',
  setoran: 'M5 4h14v16l-3-2-2 2-2-2-2 2-2-2-3 2zM9 9h6M9 13h6',
  riwayat: 'M12 7v5l3 2M3.5 12a8.5 8.5 0 1 0 2.5-6M3 4v4h4',
  profil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  rekap: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  kiri: 'M15 18l-6-6 6-6',
  kanan: 'M9 18l6-6-6-6',
  salin: 'M9 9h10v12H9zM5 15V3h10',
  centang: 'M5 12.5l4.5 4.5L19 7',
  unduh: 'M12 4v11m0 0-4-4m4 4 4-4M5 20h14',
  bulan: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  matahari: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  keluar: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  gembok: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  panah: 'M5 12h14m-5-5 5 5-5 5',
}

export type NamaIkon = keyof typeof P

export function Ikon({ nama, ...props }: { nama: NamaIkon } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={P[nama]} />
    </svg>
  )
}
