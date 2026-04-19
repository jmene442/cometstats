import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch recent games
  const { data: games } = await supabase
    .from('games')
    .select('*, seasons(year, league_name)')
    .order('date', { ascending: false })
    .limit(10)

  // Fetch player count
  const { count: playerCount } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Dashboard
        </h1>
        <Link href="/admin/games/new" className="btn btn-primary">
          + Enter Game Stats
        </Link>
      </div>

      {/* Stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {games?.length ?? 0}
          </div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Games recorded
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {playerCount ?? 0}
          </div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Active players
          </div>
        </div>
      </div>

      {/* Recent games */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Games</h2>
        {!games || games.length === 0 ? (
          <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No games yet.{' '}
            <Link href="/admin/games/new" style={{ color: 'var(--color-primary)' }}>
              Enter the first one →
            </Link>
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Opponent</th>
                <th>H/A</th>
                <th className="num">Score</th>
                <th className="num">Result</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>
                    {new Date(game.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td>{game.opponent}</td>
                  <td style={{ textTransform: 'capitalize' }}>{game.home_away}</td>
                  <td className="num">
                    {game.our_score != null && game.opponent_score != null
                      ? `${game.our_score}–${game.opponent_score}`
                      : '—'}
                  </td>
                  <td className="num">
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          game.result === 'W'
                            ? 'var(--color-success)'
                            : game.result === 'L'
                              ? 'var(--color-danger)'
                              : 'var(--color-muted)',
                      }}
                    >
                      {game.result ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
