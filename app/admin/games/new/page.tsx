import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import GameEntryForm from '@/components/admin/GameEntryForm'

export const metadata: Metadata = { title: 'Enter Game Stats' }

export default async function NewGamePage() {
  const supabase = await createClient()

  const [playersResult, seasonsResult] = await Promise.all([
    supabase.from('players').select('*').eq('active', true).order('name'),
    supabase.from('seasons').select('*').order('year', { ascending: false }),
  ])

  const players = playersResult.data ?? []
  const seasons = seasonsResult.data ?? []

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Enter Game Stats
        </h1>
        <p style={{ color: 'var(--color-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Fill in the game info, then add each player&apos;s batting and pitching lines.
        </p>
      </div>

      {/* Warn if no players or seasons exist yet */}
      {players.length === 0 && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          No active players found. Add players in your Supabase dashboard (or via the API) before
          entering game stats.
        </div>
      )}
      {seasons.length === 0 && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          No seasons found. Create a season first using the API: POST /api/seasons
        </div>
      )}

      <GameEntryForm players={players} seasons={seasons} />
    </div>
  )
}
