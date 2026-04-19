// CometStats — Hono app
// Mounted at /api/* via the Next.js catch-all route handler.

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import games   from './routes/games'
import players from './routes/players'
import seasons from './routes/seasons'

const app = new Hono().basePath('/api')

// Middleware
app.use('*', logger())
app.use('*', cors({ origin: process.env.NEXT_PUBLIC_APP_URL ?? '*' }))

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Routes
app.route('/games',   games)
app.route('/players', players)
app.route('/seasons', seasons)

export default app
