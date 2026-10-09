import type { LucideIcon } from 'lucide-react'

type Props = {
  label: string
  active: boolean
  onToggle: () => void
  Icon?: LucideIcon
  glyph?: string
  tone?: 'default' | 'gold' | 'mint' | 'win'
  size?: 'md' | 'lg'
}

export function IconTile({
  label,
  active,
  onToggle,
  Icon,
  glyph,
  tone = 'default',
  size = 'md',
}: Props) {
  return (
    <button
      type="button"
      className={`icon-tile size-${size} tone-${tone} ${active ? 'is-on' : ''}`}
      onClick={onToggle}
      aria-pressed={active}
      aria-label={label}
    >
      {Icon ? <Icon className="icon-tile-svg" strokeWidth={2.35} aria-hidden /> : null}
      {glyph ? <span className="icon-tile-glyph">{glyph}</span> : null}
      <span className="icon-tile-label">{label}</span>
    </button>
  )
}
