import { SUITS, SUIT_SYMBOL, type Card, type Suit } from '../lib/deck'
import { PlayingCard } from './PlayingCard'

type Props = {
  remaining: Card[]
  enabled: boolean
  targetLabel: string | null
  onPick: (card: Card) => void
  onUndo: () => void
  canUndo: boolean
  onAutoDeal: () => void
  canAutoDeal: boolean
  compact?: boolean
}

function bySuit(cards: Card[], suit: Suit): Card[] {
  return cards
    .filter((c) => c.suit === suit)
    .sort((a, b) => {
      const order = 'AKQJT98765432'
      return order.indexOf(a.rank) - order.indexOf(b.rank)
    })
}

export function DeckPicker({
  remaining,
  enabled,
  targetLabel,
  onPick,
  onUndo,
  canUndo,
  onAutoDeal,
  canAutoDeal,
  compact,
}: Props) {
  return (
    <section className={`deck-picker ${compact ? 'is-compact' : ''}`}>
      <div className="deck-picker-head">
        <div>
          <h2>Dealer Tray</h2>
          <p>
            {enabled && targetLabel
              ? `Next: ${targetLabel}`
              : enabled
                ? 'Street complete — Confirm'
                : 'Manual pick or Auto Deal on deal stages'}
          </p>
        </div>
        <div className="deck-picker-actions">
          <button type="button" className="btn ghost" disabled={!canAutoDeal} onClick={onAutoDeal}>
            Auto Deal
          </button>
          <button type="button" className="btn ghost" disabled={!canUndo} onClick={onUndo}>
            Undo
          </button>
        </div>
      </div>
      <div className="deck-suits">
        {SUITS.map((suit) => {
          const cards = bySuit(remaining, suit)
          return (
            <div key={suit} className="deck-suit-row">
              <span
                className={`suit-tag suit-${suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'}`}
              >
                {SUIT_SYMBOL[suit]}
              </span>
              <div className="deck-suit-cards">
                {cards.length === 0 ? (
                  <span className="deck-empty">—</span>
                ) : (
                  cards.map((card) => (
                    <PlayingCard
                      key={card.id}
                      card={card}
                      compact
                      disabled={!enabled}
                      onClick={enabled ? () => onPick(card) : undefined}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="deck-count">{remaining.length} left</p>
    </section>
  )
}
