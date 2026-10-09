type Props = {
  seconds: number
  duration: number
  running: boolean
  enabled: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

export function Timer({ seconds, duration, running, enabled, onStart, onPause, onReset }: Props) {
  const ratio = duration > 0 ? seconds / duration : 0
  const urgent = seconds <= 5 && (running || seconds > 0) && enabled

  return (
    <div
      className={`timer ${urgent ? 'is-urgent' : ''} ${running ? 'is-running' : ''} ${enabled ? '' : 'is-disabled'}`}
    >
      <div className="timer-ring" style={{ ['--ratio' as string]: String(enabled ? ratio : 0) }}>
        <span className="timer-value">{enabled ? seconds : '—'}</span>
        <span className="timer-unit">sec</span>
      </div>
      <div className="timer-actions">
        {running ? (
          <button type="button" className="btn ghost" onClick={onPause}>
            Pause
          </button>
        ) : (
          <button type="button" className="btn ghost" disabled={!enabled} onClick={onStart}>
            Restart
          </button>
        )}
        <button type="button" className="btn ghost" disabled={!enabled} onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  )
}
