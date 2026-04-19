import { Hono } from 'hono'
import { createAdminClient } from '@/lib/supabase/server'
import type { SeasonInsert } from '@/lib/types/database'

const seasons = new Hono()

// GET /api/seasons
seasons.get('/', async (c) => {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false })

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// POST /api/seasons
seasons.post('/', async (c) => {
  const body = await c.req.json<SeasonInsert>()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('seasons')
    .insert(body)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json(data, 201)
})

export default seasons
