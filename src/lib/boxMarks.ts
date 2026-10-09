import type { LucideIcon } from 'lucide-react'
import {
  Crown,
  Droplets,
  Gem,
  Layers2,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import type { GameState } from './gameState'
import type { BoxId } from './stages'

export type BoxMark = {
  key: string
  label: string
  Icon: LucideIcon
  tone: 'gold' | 'mint' | 'soft' | 'win'
}

export function statusMark(
  kind: 'leading' | 'active' | 'winner' | undefined,
): BoxMark | null {
  if (kind === 'leading') return { key: 'leading', label: 'Lead', Icon: Crown, tone: 'gold' }
  if (kind === 'active') return { key: 'active', label: 'Active', Icon: Zap, tone: 'mint' }
  if (kind === 'winner') return { key: 'winner', label: 'Win', Icon: Trophy, tone: 'win' }
  return null
}

const COMBO_SHORT: Record<string, string> = {
  'High Card': 'High',
  Pair: 'Pair',
  'Two Pair': '2Pair',
  '3 of a Kind': '3Kind',
  Straight: 'Str',
  Flush: 'Flh',
  'Full House': 'Full',
  '4 of a Kind': '4Kind',
  'Straight Flush': 'SF',
  'Royal Flush': 'RF',
}

function comboMark(label: string): BoxMark {
  const map: Record<string, Omit<BoxMark, 'key' | 'label'>> = {
    'High Card': { Icon: Gem, tone: 'soft' },
    Pair: { Icon: Layers2, tone: 'soft' },
    'Two Pair': { Icon: Layers2, tone: 'soft' },
    '3 of a Kind': { Icon: Sparkles, tone: 'gold' },
    Straight: { Icon: TrendingUp, tone: 'mint' },
    Flush: { Icon: Droplets, tone: 'mint' },
    'Full House': { Icon: Sparkles, tone: 'gold' },
    '4 of a Kind': { Icon: Gem, tone: 'win' },
    'Straight Flush': { Icon: Trophy, tone: 'win' },
    'Royal Flush': { Icon: Trophy, tone: 'win' },
  }
  const hit = map[label] ?? { Icon: Target, tone: 'soft' as const }
  return {
    key: label,
    label: COMBO_SHORT[label] ?? label,
    Icon: hit.Icon,
    tone: hit.tone,
  }
}

export function boxMarks(state: GameState, box: BoxId): BoxMark[] {
  const marks: BoxMark[] = []

  if (state.stage === 'AnnouncePreflop') {
    if (box in state.preflop.pocketPairs) {
      const r = state.preflop.pocketPairs[box]
      marks.push({
        key: 'pocket',
        label: r ? `${r}${r}` : 'Pair',
        Icon: Layers2,
        tone: 'gold',
      })
    }
    if (box in state.preflop.highCards) {
      marks.push({
        key: 'high',
        label: String(state.preflop.highCards[box]),
        Icon: Gem,
        tone: 'soft',
      })
    }
    if (state.preflop.straightPossibilities.includes(box)) {
      marks.push({ key: 'str-p', label: 'Str', Icon: TrendingUp, tone: 'mint' })
    }
    if (state.preflop.flushPossibilities.includes(box)) {
      marks.push({ key: 'flh-p', label: 'Flh', Icon: Droplets, tone: 'mint' })
    }
  }

  if (state.stage === 'AnnounceFlop') {
    for (const combo of state.flopCallouts.madeCombos[box] ?? []) {
      marks.push(comboMark(combo))
    }
    if (state.flopCallouts.straightDraws.includes(box)) {
      marks.push({ key: 'sd', label: 'SD', Icon: TrendingUp, tone: 'mint' })
    }
    if (state.flopCallouts.flushDraws.includes(box)) {
      marks.push({ key: 'fd', label: 'FD', Icon: Droplets, tone: 'mint' })
    }
    if (state.flopCallouts.straightPossibilities.includes(box)) {
      marks.push({ key: 'str-p', label: 'Str?', Icon: TrendingUp, tone: 'soft' })
    }
    if (state.flopCallouts.flushPossibilities.includes(box)) {
      marks.push({ key: 'flh-p', label: 'Flh?', Icon: Droplets, tone: 'soft' })
    }
  }

  if (state.stage === 'AnnounceTurn') {
    for (const need of state.turnCallouts.needsToWin[box] ?? []) {
      marks.push({
        key: `need-${need}`,
        label: COMBO_SHORT[need] ?? need,
        Icon: Target,
        tone: 'soft',
      })
    }
  }

  if (
    state.stage === 'AnnounceRiver' &&
    state.riverCallouts.winners.includes(box) &&
    state.riverCallouts.winningCombo
  ) {
    marks.push(comboMark(state.riverCallouts.winningCombo))
  }

  // Keep compact on seats
  return marks.slice(0, 3)
}
