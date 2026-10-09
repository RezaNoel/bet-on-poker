import type { GameState } from '../lib/gameState'
import { BOX_IDS } from '../lib/stages'

type Props = {
  state: GameState
}

function boxesLabel(boxes: number[]): string {
  if (boxes.length === 0) return 'none selected'
  return boxes.map((b) => `Box ${b}`).join(', ')
}

export function AnnounceScript({ state }: Props) {
  const lines: string[] = []

  if (state.stage === 'AnnouncePreflop') {
    const pairs = BOX_IDS.filter((b) => b in state.preflop.pocketPairs).map((b) => {
      const rank = state.preflop.pocketPairs[b]
      return `Box ${b}${rank ? ` (${rank}${rank})` : ''}`
    })
    lines.push(`Pocket pairs: ${pairs.length ? pairs.join(', ') : 'none'}`)
    const highs = BOX_IDS.filter((b) => b in state.preflop.highCards).map((b) => {
      const rank = state.preflop.highCards[b]
      return `Box ${b}${rank ? ` (${rank})` : ''}`
    })
    lines.push(`High cards: ${highs.length ? highs.join(', ') : 'none'}`)
    lines.push(`Straight possibilities: ${boxesLabel(state.preflop.straightPossibilities)}`)
    lines.push(`Flush possibilities: ${boxesLabel(state.preflop.flushPossibilities)}`)
  }

  if (state.stage === 'AnnounceFlop') {
    const f = state.flopCallouts
    lines.push(`Leading: ${boxesLabel(f.leadingBoxes)}`)
    for (const box of BOX_IDS) {
      const combos = f.madeCombos[box] ?? []
      if (combos.length) lines.push(`Box ${box} made: ${combos.join(', ')}`)
    }
    lines.push(`Straight draws: ${boxesLabel(f.straightDraws)}`)
    lines.push(`Flush draws: ${boxesLabel(f.flushDraws)}`)
    lines.push(`Straight possibilities: ${boxesLabel(f.straightPossibilities)}`)
    lines.push(`Flush possibilities: ${boxesLabel(f.flushPossibilities)}`)
  }

  if (state.stage === 'AnnounceTurn') {
    const t = state.turnCallouts
    lines.push(`Leading: ${boxesLabel(t.leadingBoxes)}`)
    lines.push(`Active: ${boxesLabel(t.activeBoxes)}`)
    for (const box of t.activeBoxes.length ? t.activeBoxes : BOX_IDS) {
      const needs = t.needsToWin[box] ?? []
      if (needs.length) lines.push(`Box ${box} needs: ${needs.join(', ')}`)
    }
  }

  if (state.stage === 'AnnounceRiver') {
    const r = state.riverCallouts
    lines.push(`Winner(s): ${boxesLabel(r.winners)}`)
    lines.push(`Combination: ${r.winningCombo || 'none selected'}`)
    lines.push(
      r.pushedUp
        ? `${r.selectedFive.length} winning cards are pushed up.`
        : r.winners.length > 1
          ? `Tie selection: ${r.selectedFive.length} cards (min 5, include each winner’s holes)`
          : `Five-card selection: ${r.selectedFive.length}/5`,
    )
  }

  if (lines.length === 0) return null

  return (
    <div className="announce-script">
      <h3>Announce cue</h3>
      <ol>
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </div>
  )
}
