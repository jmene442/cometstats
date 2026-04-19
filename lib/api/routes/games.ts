import { Hono } from 'hono'
import { createAdminClient } from '@/lib/supabase/server'
import type { GameInsert, BattingLineInsert, PitchingLineInsert } from '@/lib/types/database'

const games = new Hono()

// GET /api/games — list games, optionally filtered by season
games.get('/', async (c) => {
  const supabase = createAdminClient()
  const seasonId = c.req.query('season_id')

  let query = supabase
    .from('games')
    .select('*, seasons(year, league_name)')
    .order('date', { ascending: false })

  if (seasonId) {
    query = query.eq('season_id', seasonId)
  }

  const { data, error } = await query
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// GET /api/games/:id — single game with all batting and pitching lines
games.get('/:id', async (c) => {
  const supabase = createAdminClient()
  const id = c.req.param('id')

  const [gameResult, battingResult, pitchingResult] = await Promise.all([
    supabase
      .from('games')
      .select('*, seasons(year, league_name)')
      .eq('id', id)
      .single(),
    supabase
      .from('batting_lines')
      .select('*, players(name, number)')
      .eq('game_id', id)
      .order('players(name)'),
    supabase
      .from('pitching_lines')
      .select('*, players(name, number)')
      .eq('game_id', id)
      .order('players(name)'),
  ])

  if (gameResult.error) return c.json({ error: gameResult.error.message }, 404)

  return c.json({
    game:          gameResult.data,
    batting_lines: battingResult.data ?? [],
    pitching_lines: pitchingResult.data ?? [],
  })
})

// ── POST /api/games ────────────────────────────────────────────────────────────
// Creates a game + all batting/pitching lines in a single request.
//
// Request body shape:
// {
//   game: GameInsert,
//   batting_lines: BattingLineInsert[],   // player_id + stats (game_id injected)
//   pitching_lines: PitchingLineInsert[], // player_id + stats (game_id injected)
// }
games.post('/', async (c) => {
  const supabase = createAdminClient()

  const body = await c.req.json<{
    game: GameInsert
    batting_lines: Omit<BattingLineInsert, 'game_id'>[]
    pitching_lines: Omit<PitchingLineInsert, 'game_id'>[]
  }>()

  // 1. Insert the game
  const { data: newGame, error: gameError } = await supabase
    .from('games')
    .insert(body.game)
    .select()
    .single()

  if (gameError) return c.json({ error: gameError.message }, 400)

  const gameId = newGame.id

  // 2. Insert batting lines (attach game_id)
  if (body.batting_lines.length > 0) {
    const { error: battingError } = await supabase
      .from('batting_lines')
      .insert(body.batting_lines.map((bl) => ({ ...bl, game_id: gameId })))

    if (battingError) {
      // Roll back — delete the just-created game so DB stays consistent
      await supabase.from('games').delete().eq('id', gameId)
      return c.json({ error: `Batting lines: ${battingError.message}` }, 400)
    }
  }

  // 3. Insert pitching lines (attach game_id)
  if (body.pitching_lines.length > 0) {
    const { error: pitchingError } = await supabase
      .from('pitching_lines')
      .insert(body.pitching_lines.map((pl) => ({ ...pl, game_id: gameId })))

    if (pitchingError) {
      await supabase.from('games').delete().eq('id', gameId)
      return c.json({ error: `Pitching lines: ${pitchingError.message}` }, 400)
    }
  }

  return c.json({ game: newGame, game_id: gameId }, 201)
})

// DELETE /api/games/:id — remove a game and all its lines (cascade handles lines)
games.delete('/:id', async (c) => {
  const supabase = createAdminClient()
  const { error } = await supabase.from('games').delete().eq('id', c.req.param('id'))
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ success: true })
})

export default games
