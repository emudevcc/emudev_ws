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
        'inline-flex h-6 items-center rounded-full border border-hairline bg-surface-1 px-2.5 font-mono text-[11px] text-fg-3',
        className
      )}
    >
      {label}
    </span>
  )
}
