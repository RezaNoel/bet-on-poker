export type StageId =
  | 'DealHole'
  | 'AnnouncePreflop'
  | 'DealFlop'
  | 'AnnounceFlop'
  | 'DealTurn'
  | 'AnnounceTurn'
  | 'DealRiver'
  | 'AnnounceRiver'
  | 'HandComplete'

export type StageMeta = {
  id: StageId
  label: string
  kind: 'deal' | 'announce' | 'done'
  hint: string
  timerSeconds?: number
}

export const STAGES: StageMeta[] = [
  {
    id: 'DealHole',
    label: 'Deal Hole Cards',
    kind: 'deal',
    hint: 'Deal manually or Auto Deal, then Confirm.',
  },
  {
    id: 'AnnouncePreflop',
    label: 'Announce Preflop',
    kind: 'announce',
    hint: 'Tap boxes for callouts. Confirm after the timer to auto-deal the flop.',
    timerSeconds: 20,
  },
  {
    id: 'DealFlop',
    label: 'Deal Flop',
    kind: 'deal',
    hint: 'Deal the flop, then Confirm.',
  },
  {
    id: 'AnnounceFlop',
    label: 'Announce Flop',
    kind: 'announce',
    hint: 'First box you tap is Leading. Confirm after the timer auto-deals the turn.',
    timerSeconds: 20,
  },
  {
    id: 'DealTurn',
    label: 'Deal Turn',
    kind: 'deal',
    hint: 'Deal the turn, then Confirm.',
  },
  {
    id: 'AnnounceTurn',
    label: 'Announce Turn',
    kind: 'announce',
    hint: 'First box you tap is Leading. Confirm after the timer auto-deals the river.',
    timerSeconds: 20,
  },
  {
    id: 'DealRiver',
    label: 'Deal River',
    kind: 'deal',
    hint: 'Deal the river, then Confirm.',
  },
  {
    id: 'AnnounceRiver',
    label: 'Announce River',
    kind: 'announce',
    hint: 'Tap winner, then 5 cards on the felt. Confirm to finish.',
  },
  {
    id: 'HandComplete',
    label: 'Hand Complete',
    kind: 'done',
    hint: 'New Hand to shuffle again.',
  },
]

export const BOX_IDS = [1, 2, 3, 4, 5, 6] as const
export type BoxId = (typeof BOX_IDS)[number]

export const HAND_RANKS = [
  'High Card',
  'Pair',
  'Two Pair',
  '3 of a Kind',
  'Straight',
  'Flush',
  'Full House',
  '4 of a Kind',
  'Straight Flush',
  'Royal Flush',
] as const

export const TURN_NEED_TAGS = [
  'Pair',
  'Two Pair',
  '3 of a Kind',
  'Overcard',
  'Straight',
  'Flush',
  'Full House',
  '4 of a Kind',
] as const

export const HIGH_CARD_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const

export function stageIndex(id: StageId): number {
  return STAGES.findIndex((s) => s.id === id)
}

export function nextStage(id: StageId): StageId | null {
  const i = stageIndex(id)
  if (i < 0 || i >= STAGES.length - 1) return null
  return STAGES[i + 1].id
}
