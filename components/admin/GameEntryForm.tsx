'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BattingStatRow, PitchingStatRow } from './PlayerStatRow'
import type { Player, Season, Game, BattingLine, PitchingLine } from '@/lib/types/database'

interface InitialData {
  game: Game
  batting_lines: BattingLine[]
  pitching_lines: PitchingLine[]
}

interface Props {
  players: Player[]
  seasons: Season[]
  /** When provided, the form operates in edit mode (PATCH) instead of create mode (POST). */
  initialData?: InitialData
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Parse the flat FormData into structured batting/pitching arrays.
// FormData keys like batting[0][ab] → { player_id, ab, h, ... }
function parseStatRows(
  formData: FormData,
  prefix: 'batting' | 'pitching',
  count: number
) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const get = (f: string) => formData.get(`${prefix}[${i}][${f}]`)
    const num = (f: string) => {
      const v = get(f)
      if (v === null || v === '') return undefined
      return Number(v)
    }

    if (prefix === 'batting') {
      rows.push({
        player_id: get('player_id') as string,
        ab:       num('ab')  ?? 0,
        h:        num('h')   ?? 0,
        doubles:  num('doubles') ?? 0,
        triples:  num('triples') ?? 0,
        hr:       num('hr')  ?? 0,
        rbi:      num('rbi') ?? 0,
        bb:       num('bb')  ?? 0,
        hbp:      num('hbp') ?? 0,
        so:       num('so')  ?? 0,
        r:        num('r')   ?? 0,
        sb:       num('sb')  ?? 0,
        cs:       num('cs')  ?? 0,
      })
    } else {
      rows.push({
        player_id: get('player_id') as string,
        ip:       num('ip')  ?? 0,
        h:        num('h')   ?? 0,
        er:       num('er')  ?? 0,
        bb:       num('bb')  ?? 0,
        so:       num('so')  ?? 0,
        hbp:      num('hbp') ?? 0,
        outcome:  (get('outcome') as string) || null,
        pc:       num('pc')  ?? null,
      })
    }
  }
  return rows
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GameEntryForm({ players, seasons, initialData }: Props) {
  const router  = useRouter()
  const isEdit  = !!initialData
  const gameId  = initialData?.game.id

  // Pre-populate player lists from initialData when editing
  const [battingPlayers, setBattingPlayers] = useState<Player[]>(() => {
    if (!initialData) return []
    return initialData.batting_lines
      .map((bl) => players.find((p) => p.id === bl.player_id))
      .filter(Boolean) as Player[]
  })

  const [pitchingPlayers, setPitchingPlayers] = useState<Player[]>(() => {
    if (!initialData) return []
    return initialData.pitching_lines
      .map((pl) => players.find((p) => p.id === pl.player_id))
      .filter(Boolean) as Player[]
  })

  // Fast lookup: player_id → existing line data (for pre-filling stat inputs)
  const battingInitValues = useMemo(() => {
    if (!initialData) return {} as Record<string, BattingLine>
    return Object.fromEntries(initialData.batting_lines.map((bl) => [bl.player_id, bl]))
  }, [initialData])

  const pitchingInitValues = useMemo(() => {
    if (!initialData) return {} as Record<string, PitchingLine>
    return Object.fromEntries(initialData.pitching_lines.map((pl) => [pl.player_id, pl]))
  }, [initialData])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)

  // Players not yet added to a section
  const availableForBatting = players.filter(
    (p) => !battingPlayers.find((bp) => bp.id === p.id)
  )
  const availableForPitching = players.filter(
    (p) => !pitchingPlayers.find((pp) => pp.id === p.id)
  )

  function addBatter(playerId: string) {
    const player = players.find((p) => p.id === playerId)
    if (player) setBattingPlayers((prev) => [...prev, player])
  }

  function addPitcher(playerId: string) {
    const player = players.find((p) => p.id === playerId)
    if (player) setPitchingPlayers((prev) => [...prev, player])
  }

  function removeBatter(playerId: string) {
    setBattingPlayers((prev) => prev.filter((p) => p.id !== playerId))
  }

  function removePitcher(playerId: string) {
    setPitchingPlayers((prev) => prev.filter((p) => p.id !== playerId))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const batting_lines  = parseStatRows(formData, 'batting',  battingPlayers.length)
    const pitching_lines = parseStatRows(formData, 'pitching', pitchingPlayers.length)

    const payload = {
      game: {
        season_id:      formData.get('season_id')      as string,
        date:           formData.get('date')            as string,
        opponent:       formData.get('opponent')        as string,
        home_away:      formData.get('home_away')       as 'home' | 'away',
        our_score:      Number(formData.get('our_score')),
        opponent_score: Number(formData.get('opponent_score')),
        notes:          (formData.get('notes') as string) || null,
      },
      batting_lines,
      pitching_lines,
    }

    try {
      const url    = isEdit ? `/api/games/${gameId}` : '/api/games'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      setSuccess(true)
      setTimeout(() => router.push('/admin'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="alert alert-success" style={{ textAlign: 'center', padding: '2rem' }}>
        ✅ Game {isEdit ? 'updated' : 'saved'}! Redirecting to dashboard…
      </div>
    )
  }

  const ig = initialData?.game

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Game Info ── */}
      <section className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
          {isEdit ? 'Edit Game' : 'Game Info'}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Season */}
          <div className="form-group">
            <label className="form-label" htmlFor="season_id">Season</label>
            <select
              id="season_id"
              name="season_id"
              className="form-select"
              required
              defaultValue={ig?.season_id ?? ''}
            >
              <option value="">— select —</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.year}{s.league_name ? ` · ${s.league_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="form-input"
              defaultValue={ig?.date ?? new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Opponent */}
          <div className="form-group">
            <label className="form-label" htmlFor="opponent">Opponent</label>
            <input
              id="opponent"
              name="opponent"
              type="text"
              required
              className="form-input"
              placeholder="Opponent team name"
              defaultValue={ig?.opponent ?? ''}
            />
          </div>

          {/* Home / Away */}
          <div className="form-group">
            <label className="form-label" htmlFor="home_away">Home / Away</label>
            <select
              id="home_away"
              name="home_away"
              className="form-select"
              required
              defaultValue={ig?.home_away ?? 'home'}
            >
              <option value="home">Home</option>
              <option value="away">Away</option>
            </select>
          </div>

          {/* Our score */}
          <div className="form-group">
            <label className="form-label" htmlFor="our_score">Our Score</label>
            <input
              id="our_score"
              name="our_score"
              type="number"
              min="0"
              required
              className="form-input"
              defaultValue={ig?.our_score ?? 0}
            />
          </div>

          {/* Opponent score */}
          <div className="form-group">
            <label className="form-label" htmlFor="opponent_score">Opponent Score</label>
            <input
              id="opponent_score"
              name="opponent_score"
              type="number"
              min="0"
              required
              className="form-input"
              defaultValue={ig?.opponent_score ?? 0}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label" htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="form-input"
            placeholder="Rain delay, notable plays, etc."
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
            defaultValue={ig?.notes ?? ''}
          />
        </div>
      </section>

      {/* ── Batting Lines ── */}
      <section className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Batting Lines{' '}
            <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>
              ({battingPlayers.length} players)
            </span>
          </h2>

          {/* Add batter */}
          <select
            className="form-select"
            style={{ width: 'auto', maxWidth: '220px' }}
            value=""
            onChange={(e) => { if (e.target.value) addBatter(e.target.value) }}
          >
            <option value="">+ Add batter…</option>
            {availableForBatting.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.number ?? '?'} {p.name}
              </option>
            ))}
          </select>
        </div>

        {battingPlayers.length === 0 ? (
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
            Use the dropdown above to add batters.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th className="num">AB</th>
                  <th className="num">H</th>
                  <th className="num">2B</th>
                  <th className="num">3B</th>
                  <th className="num">HR</th>
                  <th className="num">RBI</th>
                  <th className="num">BB</th>
                  <th className="num">HBP</th>
                  <th className="num">SO</th>
                  <th className="num">R</th>
                  <th className="num">SB</th>
                  <th className="num">CS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {battingPlayers.map((player, i) => (
                  <BattingStatRow
                    key={player.id}
                    player={player}
                    index={i}
                    onRemove={removeBatter}
                    initialValues={battingInitValues[player.id]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Pitching Lines ── */}
      <section className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Pitching Lines{' '}
            <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>
              ({pitchingPlayers.length} pitchers)
            </span>
          </h2>

          <select
            className="form-select"
            style={{ width: 'auto', maxWidth: '220px' }}
            value=""
            onChange={(e) => { if (e.target.value) addPitcher(e.target.value) }}
          >
            <option value="">+ Add pitcher…</option>
            {availableForPitching.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.number ?? '?'} {p.name}
              </option>
            ))}
          </select>
        </div>

        {pitchingPlayers.length === 0 ? (
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
            Use the dropdown above to add pitchers.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th className="num">IP</th>
                  <th className="num">H</th>
                  <th className="num">ER</th>
                  <th className="num">BB</th>
                  <th className="num">SO</th>
                  <th className="num">HBP</th>
                  <th className="num">W/L/S</th>
                  <th className="num">PC</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pitchingPlayers.map((player, i) => (
                  <PitchingStatRow
                    key={player.id}
                    player={player}
                    index={i}
                    onRemove={removePitcher}
                    initialValues={pitchingInitValues[player.id]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Submit ── */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <a href="/admin" className="btn btn-secondary">
          Cancel
        </a>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Game'}
        </button>
      </div>
    </form>
  )
}
