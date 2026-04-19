-- ============================================================
-- CometStats — Initial Schema
-- Migration: 001_initial_schema.sql
--
-- Run this in the Supabase SQL Editor (or via supabase db push
-- if you have the CLI set up).
--
-- Tables: players, seasons, games, batting_lines, pitching_lines
-- Extras: updated_at triggers, RLS policies, computed-stat views
-- ============================================================


-- ── Extensions ────────────────────────────────────────────────────────────────
-- uuid_generate_v4() is available by default; gen_random_uuid() is preferred
-- in Postgres 13+ and requires no extension.


-- ── Helper: auto-update updated_at ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PLAYERS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS players (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  number      INT,                          -- jersey number
  positions   TEXT[],                       -- e.g. ['P', 'SS', 'OF']
  active      BOOLEAN     NOT NULL DEFAULT true,
  join_date   DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON players
  FOR SELECT USING (true);

CREATE POLICY "Admin write access" ON players
  FOR ALL USING (auth.role() = 'authenticated');


-- ═══════════════════════════════════════════════════════════════════════════════
-- SEASONS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS seasons (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  year         INT         NOT NULL,
  league_name  TEXT,
  start_date   DATE,
  end_date     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(year, league_name)
);

-- RLS
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON seasons
  FOR SELECT USING (true);

CREATE POLICY "Admin write access" ON seasons
  FOR ALL USING (auth.role() = 'authenticated');


-- ═══════════════════════════════════════════════════════════════════════════════
-- GAMES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS games (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id        UUID        NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  date             DATE        NOT NULL,
  opponent         TEXT        NOT NULL,
  home_away        TEXT        NOT NULL CHECK (home_away IN ('home', 'away')),
  our_score        INT,
  opponent_score   INT,
  -- result is computed; stored for easy querying
  result           TEXT GENERATED ALWAYS AS (
    CASE
      WHEN our_score IS NULL OR opponent_score IS NULL THEN NULL
      WHEN our_score > opponent_score                  THEN 'W'
      WHEN our_score < opponent_score                  THEN 'L'
      ELSE                                                  'T'
    END
  ) STORED,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_games_season_id ON games(season_id);
CREATE INDEX idx_games_date      ON games(date DESC);

CREATE TRIGGER trg_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON games
  FOR SELECT USING (true);

CREATE POLICY "Admin write access" ON games
  FOR ALL USING (auth.role() = 'authenticated');


-- ═══════════════════════════════════════════════════════════════════════════════
-- BATTING LINES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS batting_lines (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id     UUID        NOT NULL REFERENCES games(id)   ON DELETE CASCADE,

  -- Counting stats
  ab          INT         NOT NULL DEFAULT 0,   -- at bats
  h           INT         NOT NULL DEFAULT 0,   -- hits
  doubles     INT         NOT NULL DEFAULT 0,   -- 2B
  triples     INT         NOT NULL DEFAULT 0,   -- 3B
  hr          INT         NOT NULL DEFAULT 0,   -- home runs
  rbi         INT         NOT NULL DEFAULT 0,
  bb          INT         NOT NULL DEFAULT 0,   -- walks (base on balls)
  hbp         INT         NOT NULL DEFAULT 0,   -- hit by pitch
  so          INT         NOT NULL DEFAULT 0,   -- strikeouts
  r           INT         NOT NULL DEFAULT 0,   -- runs scored
  sb          INT         NOT NULL DEFAULT 0,   -- stolen bases
  cs          INT         NOT NULL DEFAULT 0,   -- caught stealing

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(player_id, game_id)
);

CREATE INDEX idx_batting_lines_player_id ON batting_lines(player_id);
CREATE INDEX idx_batting_lines_game_id   ON batting_lines(game_id);

CREATE TRIGGER trg_batting_lines_updated_at
  BEFORE UPDATE ON batting_lines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE batting_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON batting_lines
  FOR SELECT USING (true);

CREATE POLICY "Admin write access" ON batting_lines
  FOR ALL USING (auth.role() = 'authenticated');


-- ═══════════════════════════════════════════════════════════════════════════════
-- PITCHING LINES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pitching_lines (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id     UUID        NOT NULL REFERENCES games(id)   ON DELETE CASCADE,

  -- Counting stats
  -- ip stored as tenths of an inning (e.g. 5.2 = 5⅔ innings).
  -- Baseball convention: .1 = 1 out, .2 = 2 outs, never .3
  ip          NUMERIC(5,1) NOT NULL DEFAULT 0,
  h           INT          NOT NULL DEFAULT 0,   -- hits allowed
  er          INT          NOT NULL DEFAULT 0,   -- earned runs
  bb          INT          NOT NULL DEFAULT 0,   -- walks
  so          INT          NOT NULL DEFAULT 0,   -- strikeouts
  hbp         INT          NOT NULL DEFAULT 0,   -- hit batters
  outcome     TEXT         CHECK (outcome IN ('W', 'L', 'S', 'ND', NULL)),
                                                  -- Win/Loss/Save/No Decision
  pc          INT,                               -- pitch count (nullable)

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE(player_id, game_id)
);

CREATE INDEX idx_pitching_lines_player_id ON pitching_lines(player_id);
CREATE INDEX idx_pitching_lines_game_id   ON pitching_lines(game_id);

CREATE TRIGGER trg_pitching_lines_updated_at
  BEFORE UPDATE ON pitching_lines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE pitching_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON pitching_lines
  FOR SELECT USING (true);

CREATE POLICY "Admin write access" ON pitching_lines
  FOR ALL USING (auth.role() = 'authenticated');


-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPUTED STAT VIEWS
-- Stats are never stored — always derived from raw lines.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Season batting stats per player ──────────────────────────────────────────
CREATE OR REPLACE VIEW season_batting_stats AS
SELECT
  bl.player_id,
  p.name                                         AS player_name,
  p.number                                       AS player_number,
  g.season_id,
  s.year                                         AS season_year,

  -- Counting totals
  COUNT(bl.id)                                   AS games_played,
  SUM(bl.ab)                                     AS ab,
  SUM(bl.h)                                      AS h,
  SUM(bl.doubles)                                AS doubles,
  SUM(bl.triples)                                AS triples,
  SUM(bl.hr)                                     AS hr,
  SUM(bl.rbi)                                    AS rbi,
  SUM(bl.bb)                                     AS bb,
  SUM(bl.hbp)                                    AS hbp,
  SUM(bl.so)                                     AS so,
  SUM(bl.r)                                      AS r,
  SUM(bl.sb)                                     AS sb,
  SUM(bl.cs)                                     AS cs,

  -- Singles derived
  SUM(bl.h - bl.doubles - bl.triples - bl.hr)    AS singles,

  -- Batting average: H / AB  (NULL if AB = 0)
  CASE WHEN SUM(bl.ab) = 0 THEN NULL
       ELSE ROUND(SUM(bl.h)::NUMERIC / SUM(bl.ab), 3)
  END                                            AS avg,

  -- On-base percentage: (H + BB + HBP) / (AB + BB + HBP)
  CASE WHEN SUM(bl.ab + bl.bb + bl.hbp) = 0 THEN NULL
       ELSE ROUND(
         SUM(bl.h + bl.bb + bl.hbp)::NUMERIC /
         SUM(bl.ab + bl.bb + bl.hbp), 3)
  END                                            AS obp,

  -- Slugging: TB / AB
  -- TB = singles + 2*2B + 3*3B + 4*HR
  CASE WHEN SUM(bl.ab) = 0 THEN NULL
       ELSE ROUND(
         SUM(
           (bl.h - bl.doubles - bl.triples - bl.hr)  -- singles
           + 2 * bl.doubles
           + 3 * bl.triples
           + 4 * bl.hr
         )::NUMERIC / SUM(bl.ab), 3)
  END                                            AS slg,

  -- OPS = OBP + SLG (computed inline to avoid referencing derived columns)
  CASE
    WHEN SUM(bl.ab + bl.bb + bl.hbp) = 0 OR SUM(bl.ab) = 0 THEN NULL
    ELSE ROUND(
      (SUM(bl.h + bl.bb + bl.hbp)::NUMERIC / SUM(bl.ab + bl.bb + bl.hbp))
      +
      (SUM(
        (bl.h - bl.doubles - bl.triples - bl.hr)
        + 2 * bl.doubles
        + 3 * bl.triples
        + 4 * bl.hr
      )::NUMERIC / SUM(bl.ab)), 3)
  END                                            AS ops

FROM batting_lines bl
JOIN players p ON p.id = bl.player_id
JOIN games   g ON g.id = bl.game_id
JOIN seasons s ON s.id = g.season_id
GROUP BY bl.player_id, p.name, p.number, g.season_id, s.year;


-- ── Season pitching stats per player ─────────────────────────────────────────
CREATE OR REPLACE VIEW season_pitching_stats AS
SELECT
  pl.player_id,
  p.name                                         AS player_name,
  p.number                                       AS player_number,
  g.season_id,
  s.year                                         AS season_year,

  -- Counting totals
  COUNT(pl.id)                                   AS appearances,
  SUM(CASE WHEN pl.outcome = 'W' THEN 1 ELSE 0 END) AS wins,
  SUM(CASE WHEN pl.outcome = 'L' THEN 1 ELSE 0 END) AS losses,
  SUM(CASE WHEN pl.outcome = 'S' THEN 1 ELSE 0 END) AS saves,
  SUM(pl.ip)                                     AS ip,
  SUM(pl.h)                                      AS h,
  SUM(pl.er)                                     AS er,
  SUM(pl.bb)                                     AS bb,
  SUM(pl.so)                                     AS so,
  SUM(pl.hbp)                                    AS hbp,
  SUM(pl.pc)                                     AS total_pitches,

  -- ERA: (ER / IP) * 9  — NULL if IP = 0
  CASE WHEN SUM(pl.ip) = 0 THEN NULL
       ELSE ROUND((SUM(pl.er)::NUMERIC / SUM(pl.ip)) * 9, 2)
  END                                            AS era,

  -- WHIP: (BB + H) / IP — NULL if IP = 0
  CASE WHEN SUM(pl.ip) = 0 THEN NULL
       ELSE ROUND(SUM(pl.bb + pl.h)::NUMERIC / SUM(pl.ip), 2)
  END                                            AS whip,

  -- K/9: (SO / IP) * 9
  CASE WHEN SUM(pl.ip) = 0 THEN NULL
       ELSE ROUND((SUM(pl.so)::NUMERIC / SUM(pl.ip)) * 9, 1)
  END                                            AS k_per_9

FROM pitching_lines pl
JOIN players p ON p.id = pl.player_id
JOIN games   g ON g.id = pl.game_id
JOIN seasons s ON s.id = g.season_id
GROUP BY pl.player_id, p.name, p.number, g.season_id, s.year;


-- ── Career batting stats per player (all seasons) ────────────────────────────
CREATE OR REPLACE VIEW career_batting_stats AS
SELECT
  bl.player_id,
  p.name                                         AS player_name,
  p.number                                       AS player_number,
  COUNT(DISTINCT g.season_id)                    AS seasons_played,
  COUNT(bl.id)                                   AS games_played,
  SUM(bl.ab)   AS ab,
  SUM(bl.h)    AS h,
  SUM(bl.doubles) AS doubles,
  SUM(bl.triples) AS triples,
  SUM(bl.hr)   AS hr,
  SUM(bl.rbi)  AS rbi,
  SUM(bl.bb)   AS bb,
  SUM(bl.hbp)  AS hbp,
  SUM(bl.so)   AS so,
  SUM(bl.r)    AS r,
  SUM(bl.sb)   AS sb,
  SUM(bl.cs)   AS cs,
  CASE WHEN SUM(bl.ab) = 0 THEN NULL
       ELSE ROUND(SUM(bl.h)::NUMERIC / SUM(bl.ab), 3)
  END          AS avg,
  CASE WHEN SUM(bl.ab + bl.bb + bl.hbp) = 0 THEN NULL
       ELSE ROUND(SUM(bl.h + bl.bb + bl.hbp)::NUMERIC / SUM(bl.ab + bl.bb + bl.hbp), 3)
  END          AS obp,
  CASE WHEN SUM(bl.ab) = 0 THEN NULL
       ELSE ROUND(
         SUM((bl.h - bl.doubles - bl.triples - bl.hr) + 2*bl.doubles + 3*bl.triples + 4*bl.hr)::NUMERIC
         / SUM(bl.ab), 3)
  END          AS slg
FROM batting_lines bl
JOIN players p ON p.id = bl.player_id
JOIN games   g ON g.id = bl.game_id
GROUP BY bl.player_id, p.name, p.number;


-- ── Career pitching stats per player (all seasons) ───────────────────────────
CREATE OR REPLACE VIEW career_pitching_stats AS
SELECT
  pl.player_id,
  p.name                                         AS player_name,
  p.number                                       AS player_number,
  COUNT(DISTINCT g.season_id)                    AS seasons_pitched,
  COUNT(pl.id)                                   AS appearances,
  SUM(CASE WHEN pl.outcome = 'W' THEN 1 ELSE 0 END) AS wins,
  SUM(CASE WHEN pl.outcome = 'L' THEN 1 ELSE 0 END) AS losses,
  SUM(CASE WHEN pl.outcome = 'S' THEN 1 ELSE 0 END) AS saves,
  SUM(pl.ip)  AS ip,
  SUM(pl.h)   AS h,
  SUM(pl.er)  AS er,
  SUM(pl.bb)  AS bb,
  SUM(pl.so)  AS so,
  CASE WHEN SUM(pl.ip) = 0 THEN NULL
       ELSE ROUND((SUM(pl.er)::NUMERIC / SUM(pl.ip)) * 9, 2)
  END          AS era,
  CASE WHEN SUM(pl.ip) = 0 THEN NULL
       ELSE ROUND(SUM(pl.bb + pl.h)::NUMERIC / SUM(pl.ip), 2)
  END          AS whip
FROM pitching_lines pl
JOIN players p ON p.id = pl.player_id
JOIN games   g ON g.id = pl.game_id
GROUP BY pl.player_id, p.name, p.number;
