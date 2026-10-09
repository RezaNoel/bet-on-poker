export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'

export type Card = {
  id: string
  rank: Rank
  suit: Suit
}

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

export const SUIT_SYMBOL: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
}

export const SUIT_COLOR: Record<Suit, 'red' | 'black'> = {
  spades: 'black',
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
}

export const RANK_LABEL: Record<Rank, string> = {
  A: 'A',
  K: 'K',
  Q: 'Q',
  J: 'J',
  T: '10',
  '9': '9',
  '8': '8',
  '7': '7',
  '6': '6',
  '5': '5',
  '4': '4',
  '3': '3',
  '2': '2',
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${rank}${suit[0]}`, rank, suit })
    }
  }
  return deck
}

export function shuffleDeck(deck: Card[]): Card[] {
  const next = [...deck]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export type DealSlot =
  | { kind: 'hole'; box: number; cardIndex: 0 | 1 }
  | { kind: 'flop'; index: 0 | 1 | 2 }
  | { kind: 'turn' }
  | { kind: 'river' }

/** Deal order: first card to each box, second card to each box, then flop/turn/river */
export function buildDealOrder(): DealSlot[] {
  const order: DealSlot[] = []
  for (let cardIndex = 0 as 0 | 1; cardIndex < 2; cardIndex = (cardIndex + 1) as 0 | 1) {
    for (let box = 1; box <= 6; box += 1) {
      order.push({ kind: 'hole', box, cardIndex })
    }
  }
  order.push({ kind: 'flop', index: 0 }, { kind: 'flop', index: 1 }, { kind: 'flop', index: 2 })
  order.push({ kind: 'turn' })
  order.push({ kind: 'river' })
  return order
}

export function slotLabel(slot: DealSlot): string {
  if (slot.kind === 'hole') return `Box ${slot.box} · Card ${slot.cardIndex + 1}`
  if (slot.kind === 'flop') return `Flop ${slot.index + 1}`
  if (slot.kind === 'turn') return 'Turn'
  return 'River'
}
