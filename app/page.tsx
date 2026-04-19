// Public home page — placeholder until Phase 2 builds out the stats views.

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CometStats — Home',
}

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
        ⚾ CometStats
      </h1>
      <p style={{ color: 'var(--color-muted)', fontSize: '1.125rem', textAlign: 'center' }}>
        Stats coming soon. Check back after the first game!
      </p>
      <Link href="/admin" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Admin →
      </Link>
    </main>
  )
}
