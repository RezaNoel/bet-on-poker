import { motion } from 'framer-motion'
import type { Card } from '../lib/deck'
import { statusMark, type BoxMark } from '../lib/boxMarks'
import type { BoxId } from '../lib/stages'
import { PlayingCard } from './PlayingCard'

type Props = {
  box: BoxId
  cards: [Card | null, Card | null]
  leading?: boolean
  active?: boolean
  winner?: boolean
  selected?: boolean
  interactive?: boolean
  cardSelectMode?: boolean
  selectableCardIds?: Set<string>
  selectedCardIds?: Set<string>
  liftedIds?: Set<string>
  marks?: BoxMark[]
  onBoxClick?: () => void
  onCardClick?: (cardId: string) => void
}

function MarkChip({ mark }: { mark: BoxMark }) {
  const Icon = mark.Icon
  return (
    <span className={`box-mark tone-${mark.tone}`}>
      <Icon size={11} strokeWidth={2.4} aria-hidden />
      {mark.label ? <span>{mark.label}</span> : null}
    </span>
  )
}

export function BoxSeat({
  box,
  cards,
  leading,
  active,
  winner,
  selected,
  interactive,
  cardSelectMode,
  selectableCardIds,
  selectedCardIds,
  liftedIds,
  marks = [],
  onBoxClick,
  onCardClick,
}: Props) {
  const status = statusMark(winner ? 'winner' : leading ? 'leading' : active ? 'active' : undefined)

  return (
    <motion.article
      layout
      className={[
        'box-seat',
        leading ? 'is-leading' : '',
        active ? 'is-active' : '',
        winner ? 'is-winner' : '',
        selected ? 'is-selected-box' : '',
        interactive ? 'is-clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={interactive ? onBoxClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open options for Box ${box}` : `Box ${box}`}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onBoxClick?.()
              }
            }
          : undefined
      }
      whileHover={interactive ? { y: -3, scale: 1.015 } : undefined}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <header className="box-seat-head">
        <span className="box-label">Box {box}</span>
        {status ? <MarkChip mark={status} /> : null}
      </header>

      <div className="box-cards">
        {cards.map((card, i) => {
          const canSelectCard =
            Boolean(card) &&
            Boolean(cardSelectMode) &&
            Boolean(selectableCardIds?.has(card!.id)) &&
            Boolean(onCardClick)

          return (
            <PlayingCard
              key={`${box}-${i}`}
              card={card}
              placeholder={String(i + 1)}
              selected={card ? selectedCardIds?.has(card.id) : false}
              lifted={card ? liftedIds?.has(card.id) : false}
              dimmed={
                Boolean(card) &&
                Boolean(liftedIds?.size) &&
                !liftedIds?.has(card!.id) &&
                !selectedCardIds?.has(card!.id)
              }
              passThrough={!canSelectCard}
              onClick={canSelectCard ? () => onCardClick!(card!.id) : undefined}
            />
          )
        })}
      </div>

      {marks.length > 0 ? (
        <div className="box-marks">
          {marks.map((mark) => (
            <MarkChip key={mark.key} mark={mark} />
          ))}
        </div>
      ) : interactive ? (
        <div className="box-marks is-empty-marks">
          <span className="box-mark tone-soft is-hint">Tap</span>
        </div>
      ) : null}
    </motion.article>
  )
}
