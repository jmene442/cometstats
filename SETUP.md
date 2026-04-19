# CometStats — Phase 1 Setup Guide

Your GitHub repo, Supabase project, and Vercel project are already created. This guide walks you through the remaining steps to get Phase 1 fully running.

---

## Step 1 — Install dependencies

```bash
cd cometstats
npm install
```

---

## Step 2 — Set environment variables

Copy the example file and fill in your Supabase values:

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → service_role key ⚠️ Keep secret |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

---

## Step 3 — Run the database migration

Open your Supabase project → **SQL Editor** → paste the entire contents of:

```
supabase/migrations/001_initial_schema.sql
```

Click **Run**. This creates all five tables, the four stat views, RLS policies, and updated_at triggers.

> **Tip:** If you ever need to reset and re-run it, add `DROP TABLE IF EXISTS ... CASCADE;` lines at the top for each table.

---

## Step 4 — Create the admin user

In Supabase: **Authentication** → **Users** → **Add user** → enter your email and a strong password. This is the login you'll use to enter stats.

---

## Step 5 — Create your first season

The game entry form requires at least one season to exist. Create it via the API once the app is running:

```bash
curl -X POST http://localhost:3000/api/seasons \
  -H "Content-Type: application/json" \
  -d '{"year": 2026, "league_name": "Rec League"}'
```

Or add it directly in Supabase: **Table Editor** → `seasons` → **Insert row**.

---

## Step 6 — Add your roster

Add players directly in Supabase: **Table Editor** → `players` → **Insert row**.

Minimum required fields: `name`. Optional: `number`, `positions`, `active` (defaults to `true`).

---

## Step 7 — Run locally

```bash
npm run dev
```

- Public home: http://localhost:3000
- Admin login: http://localhost:3000/auth/login
- Enter game stats: http://localhost:3000/admin/games/new

---

## Step 8 — Set Vercel environment variables

Your Vercel project is already linked (`.vercel/project.json`). Before deploying, add your env vars:

1. Go to [vercel.com](https://vercel.com) → your `cometstats` project → **Settings** → **Environment Variables**
2. Add the same variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → set this to your Vercel deployment URL

---

## Step 9 — Deploy

Push to your GitHub repo's `main` branch. Vercel will auto-deploy.

```bash
git add .
git commit -m "feat: Phase 1 scaffold"
git push origin main
```

---

## Smoke test checklist

After deploying (or running locally), verify each step:

- [ ] `/auth/login` — can sign in with the admin account
- [ ] `/admin` — dashboard loads, shows 0 games / player count
- [ ] `/api/health` — returns `{"status":"ok",...}`
- [ ] `/api/players` — returns your roster
- [ ] `/api/seasons` — returns your season
- [ ] `/admin/games/new` — form loads with your players and season in the dropdowns
- [ ] Enter a real game → click Save → redirects to dashboard → game appears in the list
- [ ] `SELECT * FROM season_batting_stats;` in Supabase SQL Editor → stats look correct
- [ ] `SELECT * FROM season_pitching_stats;` → ERA, WHIP compute correctly

✅ All green = Phase 1 complete. On to Phase 2!

---

## Project structure reference

```
cometstats/
├── app/
│   ├── api/[[...route]]/route.ts   ← Hono entry point
│   ├── auth/login/                 ← Login page + server action
│   ├── admin/                      ← Protected admin area
│   │   ├── layout.tsx              ← Nav bar, auth check
│   │   ├── page.tsx                ← Dashboard
│   │   └── games/new/page.tsx      ← Game entry form page
│   ├── layout.tsx                  ← Root layout
│   ├── page.tsx                    ← Public home (Phase 2 placeholder)
│   └── globals.css
├── components/admin/
│   ├── GameEntryForm.tsx           ← Main entry form component
│   └── PlayerStatRow.tsx           ← Batting + pitching row components
├── lib/
│   ├── api/
│   │   ├── index.ts                ← Hono app definition
│   │   └── routes/                 ← games, players, seasons handlers
│   ├── supabase/
│   │   ├── client.ts               ← Browser client
│   │   └── server.ts               ← Server client + admin client
│   └── types/database.ts           ← TypeScript types for all tables/views
├── middleware.ts                   ← Auth guard for /admin/*
├── supabase/migrations/
│   └── 001_initial_schema.sql      ← Run this in Supabase SQL Editor
└── .env.example                    ← Copy to .env.local
```
