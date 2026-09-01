import { PublicNavbar } from './public-navbar'
import { PublicFooter } from './public-footer'
import { AuthHydrator } from './auth-hydrator'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sync session cookie → client auth store so public pages can gate
          actions (e.g. Book Appointment) on real auth state after reloads. */}
      <AuthHydrator />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
