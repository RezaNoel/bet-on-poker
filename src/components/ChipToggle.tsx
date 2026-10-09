type Props = {
  label: string
  active: boolean
  onToggle: () => void
  tone?: 'default' | 'gold' | 'danger'
}

export function ChipToggle({ label, active, onToggle, tone = 'default' }: Props) {
  return (
    <button
      type="button"
      className={`chip ${active ? 'is-on' : ''} tone-${tone}`}
      onClick={onToggle}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
