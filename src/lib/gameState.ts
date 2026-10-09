import { buildDealOrder, createDeck, type Card, type DealSlot, shuffleDeck } from './deck'
import { BOX_IDS, type BoxId, type StageId } from './stages'

export type HoleCards = [Card | null, Card | null]

export type PreflopCallouts = {
  pocketPairs: Partial<Record<BoxId, string>>
  highCards: Partial<Record<BoxId, string>>
  straightPossibilities: BoxId[]
  flushPossibilities: BoxId[]
}

export type FlopCallouts = {
  leadingBoxes: BoxId[]
  madeCombos: Partial<Record<BoxId, string[]>>
  straightDraws: BoxId[]
  flushDraws: BoxId[]
  straightPossibilities: BoxId[]
  flushPossibilities: BoxId[]
}

export type TurnCallouts = {
  leadingBoxes: BoxId[]
  activeBoxes: BoxId[]
  needsToWin: Partial<Record<BoxId, string[]>>
}

export type RiverCallouts = {
  winners: BoxId[]
  winningCombo: string
  selectedFive: string[]
  pushedUp: boolean
}

export type GameState = {
  stage: StageId
  remaining: Card[]
  boxes: Record<BoxId, HoleCards>
  flop: [Card | null, Card | null, Card | null]
  turn: Card | null
  river: Card | null
  dealHistory: DealSlot[]
  preflop: PreflopCallouts
  flopCallouts: FlopCallouts
  turnCallouts: TurnCallouts
  riverCallouts: RiverCallouts
}

export function emptyCallouts(): Pick<
  GameState,
  'preflop' | 'flopCallouts' | 'turnCallouts' | 'riverCallouts'
> {
  return {
    preflop: {
      pocketPairs: {},
      highCards: {},
      straightPossibilities: [],
      flushPossibilities: [],
    },
    flopCallouts: {
      leadingBoxes: [],
      madeCombos: {},
      straightDraws: [],
      flushDraws: [],
      straightPossibilities: [],
      flushPossibilities: [],
    },
    turnCallouts: {
      leadingBoxes: [],
      activeBoxes: [],
      needsToWin: {},
    },
    riverCallouts: {
      winners: [],
      winningCombo: '',
      selectedFive: [],
      pushedUp: false,
    },
  }
}

export function createInitialState(): GameState {
  const boxes = {} as Record<BoxId, HoleCards>
  for (const id of BOX_IDS) boxes[id] = [null, null]
  return {
    stage: 'DealHole',
    remaining: shuffleDeck(createDeck()),
    boxes,
    flop: [null, null, null],
    turn: null,
    river: null,
    dealHistory: [],
    ...emptyCallouts(),
  }
}

export function dealtCount(state: GameState): number {
  return state.dealHistory.length
}

export function dealSlotRangeForStage(stage: StageId): [number, number] | null {
  // inclusive start, exclusive end into buildDealOrder()
  switch (stage) {
    case 'DealHole':
      return [0, 12]
    case 'DealFlop':
      return [12, 15]
    case 'DealTurn':
      return [15, 16]
    case 'DealRiver':
      return [16, 17]
    default:
      return null
  }
}

export function currentDealSlot(state: GameState): DealSlot | null {
  const range = dealSlotRangeForStage(state.stage)
  if (!range) return null
  const [start, end] = range
  const index = state.dealHistory.length
  if (index < start || index >= end) return null
  return buildDealOrder()[index] ?? null
}

export function holeCardsDealt(state: GameState): boolean {
  return BOX_IDS.every((b) => state.boxes[b][0] && state.boxes[b][1])
}

export function flopDealt(state: GameState): boolean {
  return state.flop.every(Boolean)
}

export function cardsForWinnerSelection(state: GameState): Card[] {
  const cards: Card[] = []
  for (const w of state.riverCallouts.winners) {
    const [c1, c2] = state.boxes[w]
    if (c1) cards.push(c1)
    if (c2) cards.push(c2)
  }
  for (const c of state.flop) if (c) cards.push(c)
  if (state.turn) cards.push(state.turn)
  if (state.river) cards.push(state.river)
  // de-dupe by id
  const seen = new Set<string>()
  return cards.filter((c) => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })
}

/** Single winner: exactly 5. Ties: board + hole cards from every winning box. */
export function maxWinnerCardSelection(state: GameState): number {
  const pool = cardsForWinnerSelection(state).length
  if (state.riverCallouts.winners.length <= 1) return Math.min(5, pool)
  return pool
}

export function minWinnerCardSelection(_state: GameState): number {
  return 5
}

export function canPushWinnerCards(state: GameState): boolean {
  const n = state.riverCallouts.selectedFive.length
  return n >= minWinnerCardSelection(state) && n <= maxWinnerCardSelection(state)
}

export function winnerSelectionHint(state: GameState): string {
  const n = state.riverCallouts.selectedFive.length
  const max = maxWinnerCardSelection(state)
  const winners = state.riverCallouts.winners.length
  if (winners > 1) {
    return `Tie — pick combo + holes from each winner · ${n}/${max}`
  }
  return `Tap 5 best cards · ${n}/5`
}

export function canAdvance(state: GameState): boolean {
  switch (state.stage) {
    case 'DealHole':
      return holeCardsDealt(state)
    case 'DealFlop':
      return flopDealt(state)
    case 'DealTurn':
      return Boolean(state.turn)
    case 'DealRiver':
      return Boolean(state.river)
    case 'AnnouncePreflop':
    case 'AnnounceFlop':
    case 'AnnounceTurn':
    case 'AnnounceRiver':
      return true
    case 'HandComplete':
      return false
    default:
      return false
  }
}

/** Deal every remaining slot for the current deal stage using the top of the remaining deck. */
export function autoDealCurrentStreet(state: GameState): GameState {
  if (!dealSlotRangeForStage(state.stage)) return state
  let next = state
  let guard = 20
  while (guard > 0) {
    guard -= 1
    const slot = currentDealSlot(next)
    if (!slot || next.remaining.length === 0) break
    next = applyDeal(next, next.remaining[0])
  }
  return next
}

/**
 * Confirm flow:
 * - DealHole → AnnouncePreflop
 * - Announce* → auto-deal next street → next announce (or HandComplete)
 * - Legacy Deal* stages → matching announce
 */
export function confirmAdvance(state: GameState): GameState {
  switch (state.stage) {
    case 'DealHole': {
      if (!holeCardsDealt(state)) return state
      return { ...state, stage: 'AnnouncePreflop' }
    }
    case 'AnnouncePreflop': {
      let next: GameState = { ...state, stage: 'DealFlop' }
      next = autoDealCurrentStreet(next)
      return { ...next, stage: 'AnnounceFlop' }
    }
    case 'AnnounceFlop': {
      let next: GameState = { ...state, stage: 'DealTurn' }
      next = autoDealCurrentStreet(next)
      return { ...next, stage: 'AnnounceTurn' }
    }
    case 'AnnounceTurn': {
      let next: GameState = { ...state, stage: 'DealRiver' }
      next = autoDealCurrentStreet(next)
      return { ...next, stage: 'AnnounceRiver' }
    }
    case 'AnnounceRiver':
      return { ...state, stage: 'HandComplete' }
    case 'DealFlop': {
      if (!flopDealt(state)) return state
      return { ...state, stage: 'AnnounceFlop' }
    }
    case 'DealTurn': {
      if (!state.turn) return state
      return { ...state, stage: 'AnnounceTurn' }
    }
    case 'DealRiver': {
      if (!state.river) return state
      return { ...state, stage: 'AnnounceRiver' }
    }
    default:
      return state
  }
}

export function canAutoDeal(state: GameState): boolean {
  return Boolean(currentDealSlot(state))
}

export function applyDeal(state: GameState, card: Card): GameState {
  const slot = currentDealSlot(state)
  if (!slot) return state
  if (!state.remaining.some((c) => c.id === card.id)) return state

  // Keep deal history contiguous with global order index
  const expectedIndex = state.dealHistory.length
  const range = dealSlotRangeForStage(state.stage)
  if (!range || expectedIndex < range[0] || expectedIndex >= range[1]) return state

  const remaining = state.remaining.filter((c) => c.id !== card.id)
  const next: GameState = {
    ...state,
    remaining,
    dealHistory: [...state.dealHistory, slot],
  }

  if (slot.kind === 'hole') {
    const holes: HoleCards = [...state.boxes[slot.box as BoxId]] as HoleCards
    holes[slot.cardIndex] = card
    next.boxes = { ...state.boxes, [slot.box]: holes }
  } else if (slot.kind === 'flop') {
    const flop = [...state.flop] as GameState['flop']
    flop[slot.index] = card
    next.flop = flop
  } else if (slot.kind === 'turn') {
    next.turn = card
  } else {
    next.river = card
  }

  return next
}

export function canUndoDeal(state: GameState): boolean {
  const range = dealSlotRangeForStage(state.stage)
  return Boolean(range && state.dealHistory.length > range[0])
}

export function undoDeal(state: GameState): GameState {
  if (!canUndoDeal(state)) return state
  const slot = state.dealHistory[state.dealHistory.length - 1]
  let removed: Card | null = null
  const next: GameState = {
    ...state,
    dealHistory: state.dealHistory.slice(0, -1),
    boxes: { ...state.boxes },
    flop: [...state.flop] as GameState['flop'],
  }

  if (slot.kind === 'hole') {
    const holes: HoleCards = [...state.boxes[slot.box as BoxId]] as HoleCards
    removed = holes[slot.cardIndex]
    holes[slot.cardIndex] = null
    next.boxes[slot.box as BoxId] = holes
  } else if (slot.kind === 'flop') {
    removed = state.flop[slot.index]
    next.flop[slot.index] = null
  } else if (slot.kind === 'turn') {
    removed = state.turn
    next.turn = null
  } else {
    removed = state.river
    next.river = null
  }

  if (removed) {
    next.remaining = [...state.remaining, removed]
  }
  return next
}

export function toggleBox(list: BoxId[], box: BoxId): BoxId[] {
  return list.includes(box) ? list.filter((b) => b !== box) : [...list, box].sort((a, b) => a - b)
}

export function toggleTag(list: string[] | undefined, tag: string): string[] {
  const current = list ?? []
  return current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
}
