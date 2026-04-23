'use client'

// A single row in the batting or pitching stat entry table.
// Renders as a <tr> — must be used inside a <tbody>.

import type { Player, BattingLine, PitchingLine } from '@/lib/types/database'

// ── Batting row ───────────────────────────────────────────────────────────────

interface BattingRowProps {
  player: Player
  index: number
  onRemove: (playerId: string) => void
  initialValues?: Partial<BattingLine>
}

export function BattingStatRow({ player, index, onRemove, initialValues }: BattingRowProps) {
  const n = (field: string) => `batting[${index}][${field}]`
  const iv = initialValues ?? {}
  const inputProps = (field: keyof BattingLine) => ({
    type: 'number' as const,
    min: '0',
    defaultValue: String(iv[field] ?? 0),
    className: 'form-input',
    style: { width: '52px', padding: '4px 6px', textAlign: 'center' as const },
  })

  return (
    <tr>
      <td style={{ paddingRight: '0.5rem', whiteSpace: 'nowrap' }}>
        <input type="hidden" name={`batting[${index}][player_id]`} value={player.id} />
        <span style={{ fontWeight: 600 }}>#{player.number ?? '—'}</span>{' '}
        <span>{player.name}</span>
      </td>
      <td><input {...inputProps('ab')} name={n('ab')} /></td>
      <td><input {...inputProps('h')} name={n('h')} /></td>
      <td><input {...inputProps('doubles')} name={n('doubles')} /></td>
      <td><input {...inputProps('triples')} name={n('triples')} /></td>
      <td><input {...inputProps('hr')} name={n('hr')} /></td>
      <td><input {...inputProps('rbi')} name={n('rbi')} /></td>
      <td><input {...inputProps('bb')} name={n('bb')} /></td>
      <td><input {...inputProps('hbp')} name={n('hbp')} /></td>
      <td><input {...inputProps('so')} name={n('so')} /></td>
      <td><input {...inputProps('r')} name={n('r')} /></td>
      <td><input {...inputProps('sb')} name={n('sb')} /></td>
      <td><input {...inputProps('cs')} name={n('cs')} /></td>
      <td>
        <button
          type="button"
          onClick={() => onRemove(player.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-danger)',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0 4px',
          }}
          title="Remove player"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

// ── Pitching row ──────────────────────────────────────────────────────────────

interface PitchingRowProps {
  player: Player
  index: number
  onRemove: (playerId: string) => void
  initialValues?: Partial<PitchingLine>
}

export function PitchingStatRow({ player, index, onRemove, initialValues }: PitchingRowProps) {
  const n = (field: string) => `pitching[${index}][${field}]`
  const iv = initialValues ?? {}
  const inputProps = (field: keyof PitchingLine) => ({
    type: 'number' as const,
    min: '0',
    defaultValue: String(iv[field] ?? 0),
    className: 'form-input',
    style: { width: '52px', padding: '4px 6px', textAlign: 'center' as const },
  })

  return (
    <tr>
      <td style={{ paddingRight: '0.5rem', whiteSpace: 'nowrap' }}>
        <input type="hidden" name={`pitching[${index}][player_id]`} value={player.id} />
        <span style={{ fontWeight: 600 }}>#{player.number ?? '—'}</span>{' '}
        <span>{player.name}</span>
      </td>
      {/* IP — allow decimal (e.g. 5.2 = 5⅔ innings) */}
      <td>
        <input
          type="number"
          name={n('ip')}
          min="0"
          step="0.1"
          defaultValue={String(iv.ip ?? 0)}
          className="form-input"
          style={{ width: '60px', padding: '4px 6px', textAlign: 'center' }}
        />
      </td>
      <td><input {...inputProps('h')} name={n('h')} /></td>
      <td><input {...inputProps('er')} name={n('er')} /></td>
      <td><input {...inputProps('bb')} name={n('bb')} /></td>
      <td><input {...inputProps('so')} name={n('so')} /></td>
      <td><input {...inputProps('hbp')} name={n('hbp')} /></td>
      {/* Outcome: W / L / S / ND */}
      <td>
        <select
          name={n('outcome')}
          defaultValue={iv.outcome ?? ''}
          className="form-select"
          style={{ width: '60px', padding: '4px 6px' }}
        >
          <option value="">—</option>
          <option value="W">W</option>
          <option value="L">L</option>
          <option value="S">S</option>
          <option value="ND">ND</option>
        </select>
      </td>
      {/* Pitch count */}
      <td>
        <input
          type="number"
          name={n('pc')}
          min="0"
          defaultValue={iv.pc != null ? String(iv.pc) : ''}
          placeholder="—"
          className="form-input"
          style={{ width: '52px', padding: '4px 6px', textAlign: 'center' }}
        />
      </td>
      <td>
        <button
          type="button"
          onClick={() => onRemove(player.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-danger)',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0 4px',
          }}
          title="Remove pitcher"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}
