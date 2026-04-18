# Baseball Stats Web App — Project Plan
**Version:** 0.2  
**Date:** April 2026  
**Status:** Pre-Development  
**Type:** Living Document

---

## 1. Project Overview

A web application to record, store, and display baseball statistics for a single recreational team — functioning as a personal baseball reference card. The application will present game data in multiple views: individual player cards, per-game summaries, and season-level leaderboards. Data entry will be handled privately by an admin; all other users will access a public, read-only site.

The initial scope is one team. Future iterations may expand to a full recreational league with multiple teams, league-wide standings, and additional user roles (coaches, league admins).

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js (React) | SSR, file-based routing, strong ecosystem. Aligns with user preference. |
| Hosting | Vercel | Native Next.js integration, zero-config deploys, serverless functions available. |
| Backend API | Node.js · Hono | Lightweight modern framework. Keeps stack to a single language (JS/TS throughout). Runs natively on Vercel serverless — no separate host needed. Fully capable of all required stat computation. |
| Database | PostgreSQL via Supabase | Relational model suits structured baseball data. Supabase adds hosted Postgres, auth, and file storage in one service. |
| Auth | Supabase Auth | Built-in with Supabase. Handles admin login now; extensible for player accounts later. |
| File Storage | Supabase Storage | For scoresheet photo uploads. Same Supabase project — no extra service needed. |
| OCR (Phase 3) | Google Vision API or AWS Textract | Best-in-class handwriting recognition for paper scoresheet processing. |

---

## 3. Core Data Model

The model captures baseball's natural hierarchy: seasons contain games, games contain player performances.

| Entity / Table | Key Fields |
|---|---|
| Players | name, number, positions, active status, join date |
| Seasons | year, start/end date, league name |
| Games | date, opponent, home/away, final score, season FK |
| Batting Lines | player FK, game FK — AB, H, 2B, 3B, HR, RBI, BB, HBP, SO, R, SB, CS |
| Pitching Lines | player FK, game FK — IP, H, ER, BB, SO, HBP, W/L/S, PC *(pitch count, nullable)* |
| Fielding Events | *(deferred — post Phase 1 implementation; requires dedicated scorekeeper)* |

> Season and career aggregate stats (AVG, ERA, OPS, etc.) will be **computed dynamically** from base records — not stored — so stats are always accurate and up-to-date.

---

## 4. Development Phases

### Phase 1 — Foundation & Data Entry
**Goal:** Get one real game's data into the database and confirm the schema works end-to-end.

| Task | Description | Notes |
|---|---|---|
| Repo & CI Setup | Create monorepo (Next.js + FastAPI), configure Vercel deployment, set up linting. | Use GitHub; Vercel deploys on push to main |
| Supabase Project | Provision Postgres instance, configure connection pooling, set up auth for admin login. | Free tier sufficient to start |
| Database Schema | Implement Players, Seasons, Games, Batting Lines, Pitching Lines tables with FK constraints. | Most critical step — review before any code |
| Admin Auth | Protect data entry routes behind Supabase Auth. Single admin user to start. | Email/password login |
| Manual Entry Form | Build admin-facing form to enter game results and per-player stats after each game. | Foundation for later OCR correction UI |
| Smoke Test | Enter one complete game, verify all stat queries return correct totals. | Go/no-go gate for Phase 2 |

### Phase 2 — Public Stats Views
**Goal:** Players can visit the site and see their stats, game results, and season leaderboards.

| Task | Description | Notes |
|---|---|---|
| Player Cards | Per-player page showing season stats, game-by-game log, and career totals. | Baseball-reference style layout |
| Game Summaries | Per-game page showing box score, batting/pitching lines for all players. | Include win/loss, date, opponent |
| Season Stats Table | Sortable table of all batting and pitching stats for the current season. | Sortable by any column |
| Leaderboards | Top-N lists: BA, HR, RBI, ERA, strikeouts, etc. | Configurable N |
| Stat Computation | Hono endpoints calculating derived stats: AVG, OBP, SLG, OPS, ERA, WHIP. | Computed on the fly from raw data |
| Responsive Design | Ensure all views are usable on mobile — players will check stats on phones. | Mobile-first CSS |

### Phase 3 — Scoresheet Data Ingestion
**Goal:** Streamline data entry via scoresheet photo upload with OCR and a human review step.

| Task | Description | Notes |
|---|---|---|
| Photo Upload | Admin can upload a photo of the paper scoresheet to Supabase Storage. | Accept JPG, PNG, HEIC |
| OCR Processing | Send image to Google Vision or AWS Textract; parse structured stat fields. | Pilot with 5 known scoresheets first |
| Review & Edit UI | Present OCR output as a pre-filled editable form — admin corrects errors before saving. | Reuses the Phase 1 entry form |
| Approval Workflow | Stats only commit to the DB after admin review and confirmation. | No auto-commit from raw OCR |
| Scoresheet Archive | Store original photos alongside the game record for reference. | Supabase Storage bucket |

### Phase 4 — Expansion & Polish
**Goal:** Extend the app to support a full recreational league and richer features.

| Task | Description | Notes |
|---|---|---|
| Multi-Team Support | Add Teams table; associate players and games with teams. Update all views. | Schema migration required |
| League Standings | Season standings table for all teams in the league. | W-L record, run differential |
| Player Accounts | Allow players to log in to see personal dashboards, career stats, milestones. | Supabase Auth, new user role |
| Advanced Metrics | Add OPS+, ERA+, and other park/league-adjusted stats. | Requires league average baselines |
| Notifications | Optional: notify players when new game stats are posted. | Email or in-app |

---

## 5. Key Risks

- **Scoresheet legibility** — Paper scoresheets are inconsistently marked. OCR accuracy may be low. The review/edit UI in Phase 3 is essential and should not be skipped or rushed.
- **Schema design** — Changing the database schema after data has been entered is costly. Spend extra time in Phase 1 validating the model against several real scoresheets before committing.
- **Scoring convention variance** — Rec league scoring may use non-standard abbreviations. Document your team's conventions before building the entry form.
- **Stat definitions** — Decide early which stats to track (e.g. is fielding required in Phase 1?). Scope creep in the data model is a common trap.
- **Multi-team migration** — Adding multi-team support in Phase 4 will require a schema migration. Avoid hard-coding single-team assumptions in Phase 1 tables.

---

## 6. Open Decisions

| Decision | Notes |
|---|---|
| Data entry method | Manual form only at first, or design with OCR in mind from day one? (Recommended: design for future OCR from the start.) |
| Fielding stats | Deferred post-Phase 1. Requires dedicated scorekeeper; incomplete data is worse than none. |
| Designated Hitter | Does your rec league use a DH rule? Affects batting line assignment. |
| Scoring conventions | Document your team's scoresheet shorthand before building the entry form. |
| Domain / branding | What will the site be called? Custom domain on Vercel? |
| Player onboarding | How will other players get access when player accounts roll out in Phase 4? |

---

## 7. Revision History

| Version | Date | Notes |
|---|---|---|
| 0.1 | April 2026 | Initial project plan — pre-development. Tech stack, data model, and four-phase roadmap established. |
| 0.2 | April 2026 | Backend switched from Python · FastAPI to Node.js · Hono. Consolidates stack to a single language; Hono runs natively on Vercel, eliminating need for a separate API host. |
| 0.2 | April 2026 | Data model confirmed. Batting lines updated to include HBP, CS. Pitching lines updated to include HBP and nullable pitch count. Fielding events deferred post-Phase 1. |

---

*This is a living document. Update it as decisions are made, phases complete, or scope changes. Increment the version number and add a row to the Revision History with each meaningful update.*
