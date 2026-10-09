import { motion } from 'framer-motion'
import { RANK_LABEL, SUIT_COLOR, SUIT_SYMBOL, type Card } from '../lib/deck'

type Props = {
  card?: Card | null
  placeholder?: string
  selected?: boolean
  lifted?: boolean
  dimmed?: boolean
  compact?: boolean
  onClick?: () => void
  disabled?: boolean
  layoutId?: string
  /** When true, taps pass through to parent (whole box click). */
  passThrough?: boolean
}

export function PlayingCard({
  card,
  placeholder = '?',
  selected,
  lifted,
  dimmed,
  compact,
  onClick,
  disabled,
  layoutId,
  passThrough,
}: Props) {
  const interactive = Boolean(onClick) && !disabled && !passThrough
  const color = card ? SUIT_COLOR[card.suit] : 'black'

  return (
    <motion.button
      type="button"
      layoutId={layoutId}
      className={[
        'playing-card',
        card ? `suit-${color}` : 'is-empty',
        selected ? 'is-selected' : '',
        lifted ? 'is-lifted' : '',
        dimmed ? 'is-dimmed' : '',
        compact ? 'is-compact' : '',
        interactive ? 'is-interactive' : '',
        passThrough || (!onClick && !disabled) ? 'is-passthrough' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={
        interactive
          ? (e) => {
              e.stopPropagation()
              onClick?.()
            }
          : undefined
      }
      disabled={!interactive}
      tabIndex={interactive ? 0 : -1}
      aria-hidden={passThrough || !interactive ? true : undefined}
      aria-label={
        interactive
          ? card
            ? `${RANK_LABEL[card.rank]} of ${card.suit}`
            : placeholder
          : undefined
      }
      initial={false}
      animate={{
        y: lifted ? -28 : selected ? -10 : 0,
        scale: lifted ? 1.1 : selected ? 1.05 : 1,
        rotate: lifted ? -2 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 22,
        mass: 0.7,
      }}
      whileHover={interactive ? { y: lifted ? -30 : -6, scale: lifted ? 1.12 : 1.04 } : undefined}
      whileTap={interactive ? { scale: 0.97 } : undefined}
    >
      {card ? (
        <>
          <span className="card-rank">{RANK_LABEL[card.rank]}</span>
          <span className="card-suit">{SUIT_SYMBOL[card.suit]}</span>
        </>
      ) : (
        <span className="card-placeholder">{placeholder}</span>
      )}
    </motion.button>
  )
}
