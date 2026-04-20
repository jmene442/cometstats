# Baseball Stats App — User Stories & Technical Requirements

**Version:** 1.0  
**Date:** April 2026  
**Status:** Pre-Development  
**Related Document:** Baseball Stats App Project Plan v0.3

---

## Overview

This document defines the user stories and technical requirements for the Baseball Stats Web App across all four development phases. User stories are written from the perspective of each role interacting with the system. Technical requirements specify the measurable, testable behaviors the system must exhibit to support those stories.

**Roles referenced in this document:**

- **Admin** — the single person responsible for data entry; authenticated access only
- **Visitor** — any unauthenticated user browsing the public site (players, fans, coaches)
- **Player** — a registered team member with a personal account (Phase 4)
- **League Admin** — an elevated role managing multiple teams (Phase 4)

---

## Phase 1 — Foundation & Data Entry

### User Stories

**US-101** — As an **admin**, I want to log in with my email and password, so that only I can access data entry functions.

**US-102** — As an **admin**, I want to create a new season record (year, start date, end date, league name), so that games can be organized by season.

**US-103** — As an **admin**, I want to add players to the roster with their name, jersey number, and positions, so that I can assign stats to the correct individuals.

**US-104** — As an **admin**, I want to mark a player as inactive, so that they no longer appear in active roster selections without losing their historical data.

**US-105** — As an **admin**, I want to create a game record including date, opponent, home/away designation, and final score, so that game history is tracked.

**US-106** — As an **admin**, I want to enter per-player batting stats for a game (AB, H, 2B, 3B, HR, RBI, BB, HBP, SO, R, SB, CS), so that individual offensive performance is recorded.

**US-107** — As an **admin**, I want to enter per-player pitching stats for a game (IP, H, ER, BB, SO, HBP, W/L/S, and optionally pitch count), so that individual pitching performance is recorded.

**US-108** — As an **admin**, I want to edit a previously entered game or player line, so that I can correct mistakes without re-entering the entire game.

**US-109** — As an **admin**, I want to be automatically logged out after a period of inactivity, so that the admin panel is not left exposed on a shared device.

---

### Technical Requirements

**TR-101** — The system shall authenticate admin users via email/password using Supabase Auth.

**TR-102** — All admin data-entry routes shall be protected; unauthenticated requests shall be redirected to the login page.

**TR-103** — The system shall implement the following PostgreSQL tables via Supabase: `players`, `seasons`, `games`, `batting_lines`, `pitching_lines`. Each table shall have appropriate primary keys and foreign key constraints enforcing referential integrity.

**TR-104** — The `players` table shall store: `id`, `name`, `jersey_number`, `positions` (array), `active` (boolean), `join_date`.

**TR-105** — The `seasons` table shall store: `id`, `year`, `start_date`, `end_date`, `league_name`.

**TR-106** — The `games` table shall store: `id`, `date`, `opponent`, `home_away`, `team_score`, `opponent_score`, `season_id` (FK → seasons).

**TR-107** — The `batting_lines` table shall store: `id`, `player_id` (FK), `game_id` (FK), `ab`, `h`, `doubles`, `triples`, `hr`, `rbi`, `bb`, `hbp`, `so`, `r`, `sb`, `cs`.

**TR-108** — The `pitching_lines` table shall store: `id`, `player_id` (FK), `game_id` (FK), `ip`, `h`, `er`, `bb`, `so`, `hbp`, `decision` (W/L/S/ND), `pitch_count` (nullable integer).

**TR-109** — Aggregate and derived statistics (AVG, OBP, SLG, OPS, ERA, WHIP, etc.) shall be computed dynamically at query time from base records. They shall not be stored as columns in the database.

**TR-110** — The frontend shall be built with Next.js and deployed on Vercel. The API layer shall use Hono running on Vercel serverless functions. Both shall be written in TypeScript.

**TR-111** — The system shall pass a smoke test: one complete game entered (batting and pitching lines for all participating players), with all derived stat queries returning correct values.

---

## Phase 2 — Public Stats Views

### User Stories

**US-201** — As a **visitor**, I want to browse a roster of all active players, so that I can find a specific player quickly.

**US-202** — As a **visitor**, I want to view a player card showing their season batting and pitching stats, so that I can see how they're performing this year.

**US-203** — As a **visitor**, I want to see a game-by-game stat log on a player's page, so that I can track their performance over time.

**US-204** — As a **visitor**, I want to see career totals on a player's page, so that I can understand their long-term contribution to the team.

**US-205** — As a **visitor**, I want to view a game's full box score — including batting and pitching lines for all players — so that I can review what happened in any game.

**US-206** — As a **visitor**, I want to view a sortable season stats table (batting and pitching), so that I can compare all players side by side and rank them by any statistic.

**US-207** — As a **visitor**, I want to see leaderboards showing the top players in key categories (BA, HR, RBI, ERA, SO), so that I can quickly identify standout performers.

**US-208** — As a **visitor**, I want the site to be fully usable on my phone, so that I can check stats from the dugout or bleachers.

---

### Technical Requirements

**TR-201** — The system shall expose a public roster page listing all active players with links to individual player cards.

**TR-202** — Each player card page shall display: current-season batting stats, current-season pitching stats (if applicable), game-by-game stat log for the season, and career totals.

**TR-203** — The system shall expose a game index page listing all games in the current season, each linking to a full box score page.

**TR-204** — Each box score page shall display: game metadata (date, opponent, result), a full batting line table, and a full pitching line table for all players who appeared in that game.

**TR-205** — The season stats table shall be sortable client-side by any column, in ascending or descending order.

**TR-206** — The leaderboard shall support a configurable top-N display (default: 5) for the following stats: BA, HR, RBI, ERA, SO, WHIP, SB.

**TR-207** — The Hono API shall expose endpoints computing the following derived stats on demand:
- Batting: AVG (H/AB), OBP ((H+BB+HBP)/(AB+BB+HBP+SF)), SLG (TB/AB), OPS (OBP+SLG)
- Pitching: ERA ((ER/IP)×9), WHIP ((BB+H)/IP)

**TR-208** — All public-facing views shall be read-only and accessible without authentication.

**TR-209** — All pages shall be responsive and usable on screens 375px wide and above (mobile-first CSS). Tables shall be horizontally scrollable on small screens.

**TR-210** — The site shall use server-side rendering (SSR) via Next.js for all public stat pages to ensure fast initial loads and good SEO.

---

## Phase 3 — Scoresheet Data Ingestion

### User Stories

**US-301** — As an **admin**, I want to upload a photo of the paper scoresheet after each game, so that I can avoid manually typing every individual stat field.

**US-302** — As an **admin**, I want the system to pre-populate the data entry form with values extracted from the scoresheet photo, so that I only need to review and correct errors rather than enter data from scratch.

**US-303** — As an **admin**, I want to see the original scoresheet photo displayed alongside the editable form, so that I can easily reference it while correcting OCR errors.

**US-304** — As an **admin**, I want to confirm and submit the corrected data explicitly, so that no unreviewed stats are ever written to the database automatically.

**US-305** — As an **admin**, I want the original scoresheet photos stored with the game record, so that I can reference the source document later if a discrepancy is found.

**US-306** — As an **admin**, I want the system to improve its accuracy on our specific scoresheet style over time, so that I spend less time correcting OCR errors as the season progresses.

---

### Technical Requirements

**TR-301** — The admin upload interface shall accept JPG, PNG, and HEIC image formats. Images shall be stored in a dedicated Supabase Storage bucket.

**TR-302** — The system shall maintain a zone map defining pixel coordinate regions for each stat field, based on the fixed layout of the team's printed scoresheet book. The zone map shall be defined once and reused for every upload.

**TR-303** — Upon upload, the system shall send the image to Google Vision API or AWS Textract for OCR processing. Values shall be extracted from the predefined coordinate zones only (zone-based extraction, not free-form document parsing).

**TR-304** — OCR results shall populate a pre-filled, fully editable review form — identical in structure to the Phase 1 manual entry form — before any data is written to the database.

**TR-305** — No batting or pitching stats shall be committed to the database without explicit admin confirmation on the review form.

**TR-306** — Admin corrections to OCR output shall be logged alongside the original OCR values as labeled training data, stored for future model fine-tuning.

**TR-307** — The system shall be piloted against 5 previously entered (and therefore verifiable) scoresheets before being used for new game entry in production.

**TR-308** — The original scoresheet photo shall be linked to the corresponding game record and accessible from the game's admin view.

**TR-309** — The OCR zone map shall focus on the batting totals columns and pitching columns of the scoresheet. The inning-by-inning grid shall be excluded from extraction scope in Phase 3.

---

## Phase 4 — Expansion & Polish

### User Stories

**US-401** — As a **league admin**, I want to manage multiple teams within the application, so that I can track stats across an entire recreational league.

**US-402** — As a **league admin**, I want to view a season standings table for all teams in the league, so that I can see who is in first place.

**US-403** — As a **player**, I want to create an account and log in, so that I can access a personal dashboard with my stats and career milestones.

**US-404** — As a **player**, I want to receive a notification when new game stats are posted, so that I don't have to manually check the site after every game.

**US-405** — As a **visitor**, I want to see advanced metrics (OPS+, ERA+) for players, so that I can understand performance relative to league averages.

---

### Technical Requirements

**TR-401** — The database schema shall be extended with a `teams` table. The `players` and `games` tables shall be updated with a `team_id` foreign key. A schema migration script shall be written and tested in a staging environment before execution in production.

**TR-402** — The league standings page shall display: team name, wins, losses, win percentage, runs scored, runs allowed, and run differential for the current season, sortable by any column.

**TR-403** — Supabase Auth shall be extended to support a `player` role in addition to the existing `admin` role. Players shall self-register using email/password and be associated with a player record by the admin.

**TR-404** — Each player's personal dashboard shall display: season stats, career stats, and a list of personal milestones (e.g., career HR, career hits thresholds).

**TR-405** — The notification system shall support at minimum email notifications triggered when an admin publishes new game stats. In-app notifications are optional in Phase 4.

**TR-406** — Advanced metrics (OPS+, ERA+) shall be computed using league average baselines derived from the aggregated stats of all teams in the current season. These values shall be computed on demand by the API.

**TR-407** — All single-team assumptions introduced in Phases 1–3 (e.g., hardcoded team references, missing `team_id` columns) shall be identified and resolved as part of the Phase 4 migration. A compatibility checklist shall be produced before development begins.

---

## Appendix: Requirements Traceability

| User Story | Technical Requirement(s) |
|---|---|
| US-101 | TR-101, TR-102 |
| US-102 | TR-103, TR-105 |
| US-103 | TR-103, TR-104 |
| US-104 | TR-104 |
| US-105 | TR-103, TR-106 |
| US-106 | TR-103, TR-107 |
| US-107 | TR-103, TR-108 |
| US-108 | TR-102, TR-107, TR-108 |
| US-109 | TR-101 |
| US-201 | TR-201 |
| US-202 | TR-202, TR-207 |
| US-203 | TR-202 |
| US-204 | TR-202, TR-207 |
| US-205 | TR-203, TR-204 |
| US-206 | TR-205, TR-207 |
| US-207 | TR-206, TR-207 |
| US-208 | TR-209 |
| US-301 | TR-301, TR-302 |
| US-302 | TR-303, TR-304 |
| US-303 | TR-304 |
| US-304 | TR-305 |
| US-305 | TR-308 |
| US-306 | TR-306, TR-307 |
| US-401 | TR-401 |
| US-402 | TR-402 |
| US-403 | TR-403, TR-404 |
| US-404 | TR-405 |
| US-405 | TR-406 |

---

*Version 1.0 — April 2026. This document should be updated as scope decisions are finalized, open items resolved, or requirements change between phases.*
