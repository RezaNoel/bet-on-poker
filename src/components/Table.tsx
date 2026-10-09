import { boxMarks } from '../lib/boxMarks'
import {
  cardsForWinnerSelection,
  winnerSelectionHint,
  type GameState,
} from '../lib/gameState'
import { BOX_IDS, type BoxId } from '../lib/stages'
import { BoxSeat } from './BoxSeat'
import { PlayingCard } from './PlayingCard'

type Props = {
  state: GameState
  activeBox: BoxId | null
  onBoxClick: (box: BoxId) => void
  onCardClick: (cardId: string) => void
}

export function Table({ state, activeBox, onBoxClick, onCardClick }: Props) {
  const announce =
    state.stage === 'AnnouncePreflop' ||
    state.stage === 'AnnounceFlop' ||
    state.stage === 'AnnounceTurn' ||
    state.stage === 'AnnounceRiver'

  const cardSelectMode =
    state.stage === 'AnnounceRiver' && state.riverCallouts.winners.length > 0

  const selectedCards = new Set(state.riverCallouts.selectedFive)
  const selectableCards = new Set(
    cardSelectMode ? cardsForWinnerSelection(state).map((c) => c.id) : [],
  )
  const lifted = new Set(
    state.riverCallouts.pushedUp ? state.riverCallouts.selectedFive : [],
  )

  const showFlopLeading = state.stage === 'AnnounceFlop'
  const showTurnMarks = state.stage === 'AnnounceTurn'
  const showRiver = state.stage === 'AnnounceRiver'

  const leadingBoxes = new Set(
    showTurnMarks ? state.turnCallouts.leadingBoxes : state.flopCallouts.leadingBoxes,
  )
  const activeBoxes = new Set(state.turnCallouts.activeBoxes)
  const winners = new Set(state.riverCallouts.winners)

  const renderBox = (box: BoxId) => (
    <BoxSeat
      key={box}
      box={box}
      cards={state.boxes[box]}
      leading={(showFlopLeading || showTurnMarks) && leadingBoxes.has(box)}
      active={showTurnMarks && activeBoxes.has(box)}
      winner={showRiver && winners.has(box)}
      selected={activeBox === box}
      interactive={announce}
      cardSelectMode={cardSelectMode}
      selectableCardIds={selectableCards}
      selectedCardIds={selectedCards}
      liftedIds={lifted}
      marks={boxMarks(state, box)}
      onBoxClick={() => onBoxClick(box)}
      onCardClick={onCardClick}
    />
  )

  return (
    <section className="felt-table">
      <div className="felt-glow" aria-hidden />
      {announce ? (
        <p className="table-guide">
          {state.stage === 'AnnounceRiver'
            ? cardSelectMode
              ? winnerSelectionHint(state)
              : 'Tap winner box(es) — ties: mark every winner'
            : state.stage === 'AnnounceFlop' || state.stage === 'AnnounceTurn'
              ? 'Tap any box — first is Leading'
              : 'Tap any box for options'}
        </p>
      ) : null}

      <div className="boxes-row top">{BOX_IDS.slice(0, 3).map(renderBox)}</div>

      <div className="board">
        <div className="board-label">Community</div>
        <div className="board-cards">
          {state.flop.map((card, i) => (
            <PlayingCard
              key={`flop-${i}`}
              card={card}
              placeholder={`F${i + 1}`}
              selected={card ? selectedCards.has(card.id) : false}
              lifted={card ? lifted.has(card.id) : false}
              dimmed={
                Boolean(card) && state.riverCallouts.pushedUp && !lifted.has(card!.id)
              }
              onClick={
                card && cardSelectMode && selectableCards.has(card.id)
                  ? () => onCardClick(card.id)
                  : undefined
              }
              passThrough={!(card && cardSelectMode && selectableCards.has(card.id))}
            />
          ))}
          <span className="board-gap" />
          <PlayingCard
            card={state.turn}
            placeholder="T"
            selected={state.turn ? selectedCards.has(state.turn.id) : false}
            lifted={state.turn ? lifted.has(state.turn.id) : false}
            dimmed={
              Boolean(state.turn) &&
              state.riverCallouts.pushedUp &&
              !lifted.has(state.turn!.id)
            }
            onClick={
              state.turn && cardSelectMode && selectableCards.has(state.turn.id)
                ? () => onCardClick(state.turn!.id)
                : undefined
            }
            passThrough={
              !(state.turn && cardSelectMode && selectableCards.has(state.turn.id))
            }
          />
          <PlayingCard
            card={state.river}
            placeholder="R"
            selected={state.river ? selectedCards.has(state.river.id) : false}
            lifted={state.river ? lifted.has(state.river.id) : false}
            dimmed={
              Boolean(state.river) &&
              state.riverCallouts.pushedUp &&
              !lifted.has(state.river!.id)
            }
            onClick={
              state.river && cardSelectMode && selectableCards.has(state.river.id)
                ? () => onCardClick(state.river!.id)
                : undefined
            }
            passThrough={
              !(state.river && cardSelectMode && selectableCards.has(state.river.id))
            }
          />
        </div>
      </div>

      <div className="boxes-row bottom">{BOX_IDS.slice(3).map(renderBox)}</div>
    </section>
  )
}
