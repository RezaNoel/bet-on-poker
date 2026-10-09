import { useEffect, useMemo, useState } from 'react'
import { BoxInspector } from './components/BoxInspector'
import { DeckPicker } from './components/DeckPicker'
import { Table } from './components/Table'
import { Timer } from './components/Timer'
import { WinnerLift } from './components/WinnerLift'
import { useTimer } from './hooks/useTimer'
import { slotLabel, type Card } from './lib/deck'
import {
  applyDeal,
  autoDealCurrentStreet,
  canAutoDeal,
  canUndoDeal,
  canPushWinnerCards,
  cardsForWinnerSelection,
  confirmAdvance,
  createInitialState,
  currentDealSlot,
  holeCardsDealt,
  maxWinnerCardSelection,
  undoDeal,
  type GameState,
} from './lib/gameState'
import { BOX_IDS, STAGES, type BoxId, type StageId } from './lib/stages'

function stageMeta(id: StageId) {
  return STAGES.find((s) => s.id === id)!
}

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [activeBox, setActiveBox] = useState<BoxId | null>(null)
  const { seconds, running, duration, start, pause, reset } = useTimer(20)
  const meta = stageMeta(state.stage)
  const slot = useMemo(() => currentDealSlot(state), [state])
  const dealing = meta.kind === 'deal'
  const announce = meta.kind === 'announce'
  const timedAnnounce = Boolean(announce && meta.timerSeconds)

  useEffect(() => {
    setActiveBox(null)
    if (timedAnnounce && meta.timerSeconds) {
      start(meta.timerSeconds)
      return
    }
    reset(20)
  }, [state.stage, timedAnnounce, meta.timerSeconds, start, reset])

  const timerBlocking = timedAnnounce && (running || seconds > 0)

  const canConfirm = (() => {
    if (state.stage === 'HandComplete') return false
    if (state.stage === 'DealHole') return holeCardsDealt(state)
    if (dealing) return !canAutoDeal(state)
    if (timedAnnounce) return !timerBlocking
    if (state.stage === 'AnnounceRiver') return true
    return false
  })()

  const onPick = (card: Card) => {
    if (!dealing) return
    setState((s) => applyDeal(s, card))
  }

  const onUndo = () => setState((s) => undoDeal(s))

  const onAutoDeal = () => {
    setState((s) => autoDealCurrentStreet(s))
  }

  const onConfirm = () => {
    if (!canConfirm) return
    setActiveBox(null)
    setState((s) => confirmAdvance(s))
  }

  const onNewHand = () => {
    reset(20)
    setActiveBox(null)
    setState(createInitialState())
  }

  const onBoxClick = (box: BoxId) => {
    if (!announce) return

    setState((s) => {
      if (s.stage === 'AnnounceFlop' && s.flopCallouts.leadingBoxes.length === 0) {
        return {
          ...s,
          flopCallouts: { ...s.flopCallouts, leadingBoxes: [box] },
        }
      }
      if (s.stage === 'AnnounceTurn' && s.turnCallouts.leadingBoxes.length === 0) {
        return {
          ...s,
          turnCallouts: { ...s.turnCallouts, leadingBoxes: [box] },
        }
      }
      return s
    })

    setActiveBox((current) => (current === box ? null : box))
  }

  const onTableCardClick = (cardId: string) => {
    if (state.stage !== 'AnnounceRiver') return
    if (state.riverCallouts.winners.length === 0) return

    const allowed = new Set(cardsForWinnerSelection(state).map((c) => c.id))
    if (!allowed.has(cardId)) return

    setState((s) => {
      const max = maxWinnerCardSelection(s)
      const current = s.riverCallouts.selectedFive
      let selectedFive = current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId]
      if (selectedFive.length > max) {
        // Keep newest picks within the allowed pool (ties can exceed 5)
        selectedFive = selectedFive.slice(selectedFive.length - max)
      }
      return {
        ...s,
        riverCallouts: {
          ...s.riverCallouts,
          selectedFive,
          pushedUp: canPushWinnerCards({
            ...s,
            riverCallouts: { ...s.riverCallouts, selectedFive },
          }),
        },
      }
    })
  }

  const stageProgress = STAGES.findIndex((s) => s.id === state.stage)

  return (
    <div className="app-shell compact">
      <header className="top-bar">
        <div className="brand-block">
          <p className="brand-eyebrow">Dealer Console</p>
          <h1 className="brand">Bet on Poker</h1>
        </div>

        <div className="stage-block">
          <div className="stage-progress" aria-hidden>
            {STAGES.map((s, i) => (
              <span
                key={s.id}
                className={[
                  'stage-dot',
                  i < stageProgress ? 'is-done' : '',
                  i === stageProgress ? 'is-current' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>
          <div className="stage-copy">
            <strong>{meta.label}</strong>
            <span>{meta.hint}</span>
          </div>
        </div>

        <Timer
          seconds={seconds}
          duration={duration}
          running={running}
          enabled={timedAnnounce}
          onStart={() => start(meta.timerSeconds ?? 20)}
          onPause={pause}
          onReset={() => start(meta.timerSeconds ?? 20)}
        />
      </header>

      <main className={`main-grid ${dealing ? 'has-tray' : 'table-only'}`}>
        <div className="table-stack">
          <WinnerLift state={state} />
          <Table
            state={state}
            activeBox={activeBox}
            onBoxClick={onBoxClick}
            onCardClick={onTableCardClick}
          />
        </div>
        {dealing ? (
          <aside className="side-rail">
            <DeckPicker
              remaining={state.remaining}
              enabled={Boolean(slot)}
              targetLabel={slot ? slotLabel(slot) : null}
              onPick={onPick}
              onUndo={onUndo}
              canUndo={canUndoDeal(state)}
              onAutoDeal={onAutoDeal}
              canAutoDeal={canAutoDeal(state)}
              compact
            />
          </aside>
        ) : null}
      </main>

      <footer className="action-bar">
        {timedAnnounce && timerBlocking ? (
          <p className="action-hint">Announce — Confirm unlocks at 0</p>
        ) : dealing && canAutoDeal(state) ? (
          <p className="action-hint">Deal cards, or Auto Deal, then Confirm</p>
        ) : announce ? (
          <p className="action-hint">Tap boxes · Confirm deals next street</p>
        ) : (
          <p className="action-hint">Ready</p>
        )}
        <div className="action-bar-buttons">
          {dealing ? (
            <button
              type="button"
              className="btn ghost"
              disabled={!canAutoDeal(state)}
              onClick={onAutoDeal}
            >
              Auto Deal
            </button>
          ) : null}
          <button type="button" className="btn ghost" onClick={onNewHand}>
            New Hand
          </button>
          <button
            type="button"
            className="btn gold confirm-btn"
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            {state.stage === 'AnnounceRiver'
              ? 'Confirm'
              : state.stage === 'HandComplete'
                ? 'Done'
                : 'Confirm'}
          </button>
        </div>
      </footer>

      <BoxInspector
        box={activeBox}
        state={state}
        onChange={setState}
        onClose={() => setActiveBox(null)}
        onPrevBox={() => {
          if (activeBox == null) return
          const idx = BOX_IDS.indexOf(activeBox)
          setActiveBox(BOX_IDS[(idx + BOX_IDS.length - 1) % BOX_IDS.length])
        }}
        onNextBox={() => {
          if (activeBox == null) return
          const idx = BOX_IDS.indexOf(activeBox)
          if (idx >= BOX_IDS.length - 1) {
            setActiveBox(null)
            return
          }
          setActiveBox(BOX_IDS[idx + 1])
        }}
      />
    </div>
  )
}
