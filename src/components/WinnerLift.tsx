import type { GameState } from '../lib/gameState'

type Props = {
  state: GameState
}

export function WinnerLift({ state }: Props) {
  const { winners, winningCombo, pushedUp, selectedFive } = state.riverCallouts
  if (!pushedUp || winners.length === 0 || selectedFive.length !== 5) return null

  const winnerLabel =
    winners.length === 1
      ? `Box ${winners[0]}`
      : `Boxes ${winners.join(' & ')}`

  return (
    <div className="winner-lift-banner" role="status">
      <span className="winner-lift-kicker">Winning hand</span>
      <strong>
        {winnerLabel}
        {winningCombo ? ` — ${winningCombo}` : ''}
      </strong>
      <span>Five best cards pushed up on the felt.</span>
    </div>
  )
}
