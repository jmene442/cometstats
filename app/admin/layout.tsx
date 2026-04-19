import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/login/actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Belt-and-suspenders check (middleware handles this too)
  if (!user) redirect('/auth/login')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav bar */}
      <header
        style={{
          background: 'var(--color-primary)',
          color: '#fff',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚾</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
            CometStats Admin
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a
            href="/admin"
            style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.875rem' }}
          >
            Dashboard
          </a>
          <a
            href="/admin/games/new"
            style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.875rem' }}
          >
            + New Game
          </a>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
            {user.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
        <div className="container">{children}</div>
      </main>
    </div>
  )
}
