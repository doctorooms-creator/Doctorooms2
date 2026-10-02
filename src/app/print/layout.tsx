import '@/styles/print.css'

export const metadata = {
  title: 'Print — Doctorooms',
  description: 'Printable document',
}

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
