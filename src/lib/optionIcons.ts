import type { LucideIcon } from 'lucide-react'
import {
  ArrowUp,
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

export type HandOption = {
  id: string
  label: string
  short: string
  Icon: LucideIcon
  tone?: 'gold' | 'mint' | 'win' | 'default'
}

export const HAND_OPTIONS: HandOption[] = [
  { id: 'High Card', label: 'High Card', short: 'High', Icon: Gem },
  { id: 'Pair', label: 'Pair', short: 'Pair', Icon: Layers2 },
  { id: 'Two Pair', label: 'Two Pair', short: '2Pair', Icon: Layers2, tone: 'gold' },
  { id: '3 of a Kind', label: '3 of a Kind', short: '3Kind', Icon: Sparkles, tone: 'gold' },
  { id: 'Straight', label: 'Straight', short: 'Str', Icon: TrendingUp, tone: 'mint' },
  { id: 'Flush', label: 'Flush', short: 'Flh', Icon: Droplets, tone: 'mint' },
  { id: 'Full House', label: 'Full House', short: 'Full', Icon: Sparkles, tone: 'gold' },
  { id: '4 of a Kind', label: '4 of a Kind', short: '4Kind', Icon: Gem, tone: 'win' },
  { id: 'Straight Flush', label: 'Straight Flush', short: 'SF', Icon: Trophy, tone: 'win' },
  { id: 'Royal Flush', label: 'Royal Flush', short: 'RF', Icon: Trophy, tone: 'win' },
]

export const NEED_OPTIONS: HandOption[] = [
  { id: 'Pair', label: 'Pair', short: 'Pair', Icon: Layers2 },
  { id: 'Two Pair', label: 'Two Pair', short: '2Pair', Icon: Layers2 },
  { id: '3 of a Kind', label: '3 of a Kind', short: '3Kind', Icon: Sparkles, tone: 'gold' },
  { id: 'Overcard', label: 'Overcard', short: 'Over', Icon: ArrowUp, tone: 'gold' },
  { id: 'Straight', label: 'Straight', short: 'Str', Icon: TrendingUp, tone: 'mint' },
  { id: 'Flush', label: 'Flush', short: 'Flh', Icon: Droplets, tone: 'mint' },
  { id: 'Full House', label: 'Full House', short: 'Full', Icon: Sparkles, tone: 'gold' },
  { id: '4 of a Kind', label: '4 of a Kind', short: '4Kind', Icon: Gem, tone: 'win' },
]

export const RANK_GLYPHS = [
  'A',
  'K',
  'Q',
  'J',
  'T',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
] as const

export { Crown, Droplets, Layers2, Gem, TrendingUp, Trophy, Zap, Target, Sparkles }
