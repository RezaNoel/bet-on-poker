import type { GameState } from '../lib/gameState'

type Props = {
  state: GameState
}

export function CalloutPanel({ state }: Props) {
  const stage = state.stage
  const announce =
    stage === 'AnnouncePreflop' ||
    stage === 'AnnounceFlop' ||
    stage === 'AnnounceTurn' ||
    stage === 'AnnounceRiver'

  if (!announce) {
    return (
      <section className="callout-panel is-idle">
        <h2>On-table actions</h2>
        <p>During announce stages, tap boxes on the felt to mark combinations. Deal cards from the tray first.</p>
      </section>
    )
  }

  return (
    <section className="callout-panel">
      <header className="callout-panel-head">
        <h2>How to call</h2>
      </header>
      <ul className="howto-list">
        {stage === 'AnnouncePreflop' ? (
          <>
            <li>Tap each relevant box</li>
            <li>Mark pocket pairs, high cards, straight & flush possibilities</li>
            <li>Skip boxes with nothing to call</li>
          </>
        ) : null}
        {stage === 'AnnounceFlop' ? (
          <>
            <li>Tap leading box(es)</li>
            <li>Mark made combos, then draws</li>
            <li>If time remains, mark possibilities</li>
          </>
        ) : null}
        {stage === 'AnnounceTurn' ? (
          <>
            <li>Tap leading and active boxes</li>
            <li>Mark what each active box needs to win</li>
          </>
        ) : null}
        {stage === 'AnnounceRiver' ? (
          <>
            <li>Tap winner box(es) and the winning combination</li>
            <li>Tap exactly 5 cards on the table — they lift smoothly</li>
          </>
        ) : null}
      </ul>
    </section>
  )
}
