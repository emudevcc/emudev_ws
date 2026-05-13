import { cn } from '@/lib/utils'

type ChipProps = {
  label?: string
  className?: string
}

export function Chip({ label, className }: ChipProps) {
  if (!label) return null

  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full border border-border/70 bg-background/70 px-3 font-mono text-[11px] text-muted-foreground',
        className
      )}
    >
      {label}
    </span>
  )
}
