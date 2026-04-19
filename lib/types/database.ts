// ─────────────────────────────────────────────────────────────────────────────
// Database types — mirrors the Supabase schema exactly.
// Keep this file in sync with supabase/migrations/001_initial_schema.sql
// ─────────────────────────────────────────────────────────────────────────────

export type HomeAway = 'home' | 'away'
export type GameResult = 'W' | 'L' | 'T'
export type PitchingOutcome = 'W' | 'L' | 'S' | 'ND'

// ── Raw table rows ────────────────────────────────────────────────────────────

export interface Player {
  id: string
  name: string
  number: number | null
  positions: string[] | null
  active: boolean
  join_date: string | null   // ISO date string
  created_at: string
  updated_at: string
}

export interface Season {
  id: string
  year: number
  league_name: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface Game {
  id: string
  season_id: string
  date: string              // ISO date string
  opponent: string
  home_away: HomeAway
  our_score: number | null
  opponent_score: number | null
  result: GameResult | null // generated column
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BattingLine {
  id: string
  player_id: string
  game_id: string
  ab: number
  h: number
  doubles: number
  triples: number
  hr: number
  rbi: number
  bb: number
  hbp: number
  so: number
  r: number
  sb: number
  cs: number
  created_at: string
  updated_at: string
}

export interface PitchingLine {
  id: string
  player_id: string
  game_id: string
  ip: number
  h: number
  er: number
  bb: number
  so: number
  hbp: number
  outcome: PitchingOutcome | null
  pc: number | null
  created_at: string
  updated_at: string
}

// ── Insert types (omit generated/defaulted fields) ───────────────────────────

export type PlayerInsert = Omit<Player, 'id' | 'created_at' | 'updated_at'>
export type SeasonInsert = Omit<Season, 'id' | 'created_at'>
export type GameInsert   = Omit<Game,   'id' | 'result' | 'created_at' | 'updated_at'>

export type BattingLineInsert = Omit<BattingLine, 'id' | 'created_at' | 'updated_at'>
export type PitchingLineInsert = Omit<PitchingLine, 'id' | 'created_at' | 'updated_at'>

// ── View types (computed stat views) ─────────────────────────────────────────

export interface SeasonBattingStats {
  player_id: string
  player_name: string
  player_number: number | null
  season_id: string
  season_year: number
  games_played: number
  ab: number
  h: number
  doubles: number
  triples: number
  hr: number
  rbi: number
  bb: number
  hbp: number
  so: number
  r: number
  sb: number
  cs: number
  singles: number
  avg: number | null    // batting average
  obp: number | null    // on-base percentage
  slg: number | null    // slugging percentage
  ops: number | null    // OPS
}

export interface SeasonPitchingStats {
  player_id: string
  player_name: string
  player_number: number | null
  season_id: string
  season_year: number
  appearances: number
  wins: number
  losses: number
  saves: number
  ip: number
  h: number
  er: number
  bb: number
  so: number
  hbp: number
  total_pitches: number | null
  era: number | null
  whip: number | null
  k_per_9: number | null
}

// ── Supabase Database type for typed client ───────────────────────────────────

export interface Database {
  public: {
    Tables: {
      players: {
        Row: Player
        Insert: PlayerInsert
        Update: Partial<PlayerInsert>
      }
      seasons: {
        Row: Season
        Insert: SeasonInsert
        Update: Partial<SeasonInsert>
      }
      games: {
        Row: Game
        Insert: GameInsert
        Update: Partial<GameInsert>
      }
      batting_lines: {
        Row: BattingLine
        Insert: BattingLineInsert
        Update: Partial<BattingLineInsert>
      }
      pitching_lines: {
        Row: PitchingLine
        Insert: PitchingLineInsert
        Update: Partial<PitchingLineInsert>
      }
    }
    Views: {
      season_batting_stats:  { Row: SeasonBattingStats }
      season_pitching_stats: { Row: SeasonPitchingStats }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
