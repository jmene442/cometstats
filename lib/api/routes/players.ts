import { Hono } from 'hono'
import { createAdminClient } from '@/lib/supabase/server'
import type { PlayerInsert } from '@/lib/types/database'

const players = new Hono()

// GET /api/players — list all active players
players.get('/', async (c) => {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// GET /api/players/:id — single player
players.get('/:id', async (c) => {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', c.req.param('id'))
    .single()

  if (error) return c.json({ error: error.message }, 404)
  return c.json(data)
})

// POST /api/players — create a player
players.post('/', async (c) => {
  const body = await c.req.json<PlayerInsert>()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('players')
    .insert(body)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json(data, 201)
})

// PATCH /api/players/:id — update a player
players.patch('/:id', async (c) => {
  const body = await c.req.json<Partial<PlayerInsert>>()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('players')
    .update(body)
    .eq('id', c.req.param('id'))
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json(data)
})

export default players
