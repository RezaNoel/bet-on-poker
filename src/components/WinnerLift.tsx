import { canPushWinnerCards, type GameState } from '../lib/gameState'

type Props = {
  state: GameState
}

export function WinnerLift({ state }: Props) {
  const { winners, winningCombo, pushedUp, selectedFive } = state.riverCallouts
  if (!pushedUp || winners.length === 0 || !canPushWinnerCards(state)) return null

  const winnerLabel =
    winners.length === 1
      ? `Box ${winners[0]}`
      : `Boxes ${winners.join(' & ')}`

  const cardNote =
    winners.length > 1
      ? `${selectedFive.length} cards pushed up (shared combo + winner holes).`
      : 'Five best cards pushed up on the felt.'

  return (
    <div className="winner-lift-banner" role="status">
      <span className="winner-lift-kicker">Winning hand</span>
      <strong>
        {winnerLabel}
        {winningCombo ? ` — ${winningCombo}` : ''}
      </strong>
      <span>{cardNote}</span>
    </div>
  )
}
