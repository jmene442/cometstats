// Next.js catch-all route handler — delegates all /api/* traffic to Hono.
// The `handle` adapter bridges Next.js Request/Response with Hono's internals.

import { handle } from 'hono/vercel'
import app from '@/lib/api/index'

export const runtime = 'nodejs'  // Use 'edge' if you want Vercel edge functions

export const GET    = handle(app)
export const POST   = handle(app)
export const PUT    = handle(app)
export const PATCH  = handle(app)
export const DELETE = handle(app)
