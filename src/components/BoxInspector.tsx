import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { toggleBox, toggleTag, type GameState } from '../lib/gameState'
import {
  Crown,
  Droplets,
  Gem,
  HAND_OPTIONS,
  Layers2,
  NEED_OPTIONS,
  RANK_GLYPHS,
  TrendingUp,
  Trophy,
  Zap,
} from '../lib/optionIcons'
import type { BoxId } from '../lib/stages'
import { IconTile } from './IconTile'
import { PlayingCard } from './PlayingCard'

type Props = {
  box: BoxId | null
  state: GameState
  onChange: (next: GameState) => void
  onClose: () => void
  onNextBox?: () => void
  onPrevBox?: () => void
}

export function BoxInspector({
  box,
  state,
  onChange,
  onClose,
  onNextBox,
  onPrevBox,
}: Props) {
  return (
    <AnimatePresence>
      {box != null ? (
        <motion.div
          className="box-inspector-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            key={box}
            className="box-inspector speed-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Box ${box} actions`}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="box-inspector-head">
              <div>
                <p className="box-inspector-kicker">Quick select</p>
                <h2>Box {box}</h2>
              </div>
              <div className="inspector-nav">
                <button type="button" className="btn ghost" onClick={onPrevBox} aria-label="Previous box">
                  Prev
                </button>
                <button type="button" className="btn gold" onClick={onNextBox ?? onClose}>
                  Next
                </button>
              </div>
            </header>

            <InspectorCards box={box} state={state} />

            {state.stage === 'AnnouncePreflop' ? (
              <PreflopBox box={box} state={state} onChange={onChange} />
            ) : null}
            {state.stage === 'AnnounceFlop' ? (
              <FlopBox box={box} state={state} onChange={onChange} />
            ) : null}
            {state.stage === 'AnnounceTurn' ? (
              <TurnBox box={box} state={state} onChange={onChange} />
            ) : null}
            {state.stage === 'AnnounceRiver' ? (
              <RiverBox box={box} state={state} onChange={onChange} />
            ) : null}

            <footer className="inspector-footer">
              <button type="button" className="btn ghost" onClick={onClose}>
                Done
              </button>
              <button type="button" className="btn gold" onClick={onNextBox ?? onClose}>
                Next Box →
              </button>
            </footer>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function Field({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="inspector-field">
      <div className="inspector-field-head">
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InspectorCards({ box, state }: { box: BoxId; state: GameState }) {
  const [c1, c2] = state.boxes[box]
  const board = [...state.flop, state.turn, state.river].filter(Boolean)
  const showBoard = state.stage !== 'AnnouncePreflop'

  return (
    <div className="inspector-cards">
      <div className="inspector-cards-group">
        <span className="inspector-cards-label">Hole</span>
        <div className="inspector-cards-row">
          <PlayingCard card={c1} placeholder="1" compact passThrough />
          <PlayingCard card={c2} placeholder="2" compact passThrough />
        </div>
      </div>
      {showBoard ? (
        <div className="inspector-cards-group is-board">
          <span className="inspector-cards-label">Board</span>
          <div className="inspector-cards-row">
            {board.length === 0 ? (
              <span className="inspector-cards-empty">—</span>
            ) : (
              board.map((card) => (
                <PlayingCard key={card!.id} card={card} compact passThrough />
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TileGrid({ children }: { children: ReactNode }) {
  return <div className="icon-tile-grid">{children}</div>
}

function RankGrid({
  activeRank,
  onPick,
}: {
  activeRank?: string
  onPick: (rank: string) => void
}) {
  return (
    <div className="icon-tile-grid ranks">
      {RANK_GLYPHS.map((rank) => (
        <IconTile
          key={rank}
          label={rank === 'T' ? '10' : rank}
          glyph={rank === 'T' ? '10' : rank}
          active={activeRank === rank}
          tone="gold"
          size="lg"
          onToggle={() => onPick(rank)}
        />
      ))}
    </div>
  )
}

function PreflopBox({
  box,
  state,
  onChange,
}: {
  box: BoxId
  state: GameState
  onChange: (s: GameState) => void
}) {
  const p = state.preflop
  const hasPocket = box in p.pocketPairs
  const hasHigh = box in p.highCards

  return (
    <>
      <Field title="Callouts">
        <TileGrid>
          <IconTile
            Icon={Layers2}
            label="Pocket"
            active={hasPocket}
            tone="gold"
            size="lg"
            onToggle={() => {
              const pocketPairs = { ...p.pocketPairs }
              if (hasPocket) delete pocketPairs[box]
              else pocketPairs[box] = 'A'
              onChange({ ...state, preflop: { ...p, pocketPairs } })
            }}
          />
          <IconTile
            Icon={Gem}
            label="High"
            active={hasHigh}
            tone="gold"
            size="lg"
            onToggle={() => {
              const highCards = { ...p.highCards }
              if (hasHigh) delete highCards[box]
              else highCards[box] = 'A'
              onChange({ ...state, preflop: { ...p, highCards } })
            }}
          />
          <IconTile
            Icon={TrendingUp}
            label="Str?"
            active={p.straightPossibilities.includes(box)}
            tone="mint"
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                preflop: {
                  ...p,
                  straightPossibilities: toggleBox(p.straightPossibilities, box),
                },
              })
            }
          />
          <IconTile
            Icon={Droplets}
            label="Flh?"
            active={p.flushPossibilities.includes(box)}
            tone="mint"
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                preflop: {
                  ...p,
                  flushPossibilities: toggleBox(p.flushPossibilities, box),
                },
              })
            }
          />
        </TileGrid>
      </Field>

      {hasPocket ? (
        <Field title="Pair rank">
          <RankGrid
            activeRank={p.pocketPairs[box]}
            onPick={(rank) =>
              onChange({
                ...state,
                preflop: { ...p, pocketPairs: { ...p.pocketPairs, [box]: rank } },
              })
            }
          />
        </Field>
      ) : null}

      {hasHigh ? (
        <Field title="High rank">
          <RankGrid
            activeRank={p.highCards[box]}
            onPick={(rank) =>
              onChange({
                ...state,
                preflop: { ...p, highCards: { ...p.highCards, [box]: rank } },
              })
            }
          />
        </Field>
      ) : null}
    </>
  )
}

function FlopBox({
  box,
  state,
  onChange,
}: {
  box: BoxId
  state: GameState
  onChange: (s: GameState) => void
}) {
  const f = state.flopCallouts
  return (
    <>
      <Field title="Status">
        <TileGrid>
          <IconTile
            Icon={Crown}
            label="Lead"
            active={f.leadingBoxes.includes(box)}
            tone="gold"
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                flopCallouts: { ...f, leadingBoxes: toggleBox(f.leadingBoxes, box) },
              })
            }
          />
          <IconTile
            Icon={TrendingUp}
            label="SD"
            active={f.straightDraws.includes(box)}
            tone="mint"
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                flopCallouts: { ...f, straightDraws: toggleBox(f.straightDraws, box) },
              })
            }
          />
          <IconTile
            Icon={Droplets}
            label="FD"
            active={f.flushDraws.includes(box)}
            tone="mint"
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                flopCallouts: { ...f, flushDraws: toggleBox(f.flushDraws, box) },
              })
            }
          />
          <IconTile
            Icon={TrendingUp}
            label="Str?"
            active={f.straightPossibilities.includes(box)}
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                flopCallouts: {
                  ...f,
                  straightPossibilities: toggleBox(f.straightPossibilities, box),
                },
              })
            }
          />
          <IconTile
            Icon={Droplets}
            label="Flh?"
            active={f.flushPossibilities.includes(box)}
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                flopCallouts: {
                  ...f,
                  flushPossibilities: toggleBox(f.flushPossibilities, box),
                },
              })
            }
          />
        </TileGrid>
      </Field>

      <Field title="Made">
        <TileGrid>
          {HAND_OPTIONS.map((opt) => (
            <IconTile
              key={opt.id}
              Icon={opt.Icon}
              label={opt.short}
              active={(f.madeCombos[box] ?? []).includes(opt.id)}
              tone={opt.tone ?? 'default'}
              size="lg"
              onToggle={() =>
                onChange({
                  ...state,
                  flopCallouts: {
                    ...f,
                    madeCombos: {
                      ...f.madeCombos,
                      [box]: toggleTag(f.madeCombos[box], opt.id),
                    },
                  },
                })
              }
            />
          ))}
        </TileGrid>
      </Field>
    </>
  )
}

function TurnBox({
  box,
  state,
  onChange,
}: {
  box: BoxId
  state: GameState
  onChange: (s: GameState) => void
}) {
  const t = state.turnCallouts
  return (
    <>
      <Field title="Status">
        <TileGrid>
          <IconTile
            Icon={Crown}
            label="Lead"
            active={t.leadingBoxes.includes(box)}
            tone="gold"
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                turnCallouts: { ...t, leadingBoxes: toggleBox(t.leadingBoxes, box) },
              })
            }
          />
          <IconTile
            Icon={Zap}
            label="Active"
            active={t.activeBoxes.includes(box)}
            tone="mint"
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                turnCallouts: { ...t, activeBoxes: toggleBox(t.activeBoxes, box) },
              })
            }
          />
        </TileGrid>
      </Field>

      <Field title="Needs">
        <TileGrid>
          {NEED_OPTIONS.map((opt) => (
            <IconTile
              key={opt.id}
              Icon={opt.Icon}
              label={opt.short}
              active={(t.needsToWin[box] ?? []).includes(opt.id)}
              tone={opt.tone ?? 'default'}
              size="lg"
              onToggle={() =>
                onChange({
                  ...state,
                  turnCallouts: {
                    ...t,
                    needsToWin: {
                      ...t.needsToWin,
                      [box]: toggleTag(t.needsToWin[box], opt.id),
                    },
                  },
                })
              }
            />
          ))}
        </TileGrid>
      </Field>
    </>
  )
}

function RiverBox({
  box,
  state,
  onChange,
}: {
  box: BoxId
  state: GameState
  onChange: (s: GameState) => void
}) {
  const r = state.riverCallouts
  return (
    <>
      <Field title="Result">
        <TileGrid>
          <IconTile
            Icon={Trophy}
            label="Winner"
            active={r.winners.includes(box)}
            tone="win"
            size="lg"
            onToggle={() =>
              onChange({
                ...state,
                riverCallouts: {
                  ...r,
                  winners: toggleBox(r.winners, box),
                  pushedUp: false,
                },
              })
            }
          />
        </TileGrid>
      </Field>

      <Field title="Winning combo">
        <TileGrid>
          {HAND_OPTIONS.map((opt) => (
            <IconTile
              key={opt.id}
              Icon={opt.Icon}
              label={opt.short}
              active={r.winningCombo === opt.id}
              tone={opt.tone ?? 'gold'}
              size="lg"
              onToggle={() =>
                onChange({
                  ...state,
                  riverCallouts: {
                    ...r,
                    winningCombo: r.winningCombo === opt.id ? '' : opt.id,
                  },
                })
              }
            />
          ))}
        </TileGrid>
      </Field>

      <p className="inspector-hint">Then tap 5 cards on the felt.</p>
    </>
  )
}
