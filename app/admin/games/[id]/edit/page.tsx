import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GameEntryForm from '@/components/admin/GameEntryForm'

export const metadata: Metadata = { title: 'Edit Game Stats' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditGamePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [gameResult, playersResult, seasonsResult, battingResult, pitchingResult] =
    await Promise.all([
      supabase.from('games').select('*').eq('id', id).single(),
      supabase.from('players').select('*').eq('active', true).order('name'),
      supabase.from('seasons').select('*').order('year', { ascending: false }),
      supabase.from('batting_lines').select('*').eq('game_id', id),
      supabase.from('pitching_lines').select('*').eq('game_id', id),
    ])

  if (gameResult.error || !gameResult.data) notFound()

  const game = gameResult.data
  const players = playersResult.data ?? []
  const seasons = seasonsResult.data ?? []

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Edit Game Stats
        </h1>
        <p style={{ color: 'var(--color-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          {new Date(game.date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          · {game.home_away === 'home' ? 'vs.' : '@'} {game.opponent}
        </p>
      </div>

      <GameEntryForm
        players={players}
        seasons={seasons}
        initialData={{
          game,
          batting_lines: battingResult.data ?? [],
          pitching_lines: pitchingResult.data ?? [],
        }}
      />
    </div>
  )
}
