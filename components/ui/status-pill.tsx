import { Circle } from 'lucide-react'

type StatusPillProps = {
  available?: boolean
  label?: string
}

export function StatusPill({ available, label }: StatusPillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground shadow-sm backdrop-blur">
      <Circle
        aria-hidden="true"
        className={
          available ? 'fill-emerald-500 text-emerald-500' : 'fill-amber-500 text-amber-500'
        }
        size={8}
      />
      {label ?? (available ? 'Available' : 'Focused')}
    </span>
  )
}
