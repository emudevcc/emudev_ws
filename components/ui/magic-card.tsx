'use client'

import * as React from 'react'

import { tokens } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  gradientSize?: number
  gradientColor?: string
  gradientOpacity?: number
}

export function MagicCard({
  children,
  className,
  gradientSize = 220,
  gradientColor = tokens.colors.magicCard.gradient,
  gradientOpacity = 0.35,
  onMouseMove,
  style,
  ...props
}: MagicCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ x: -gradientSize, y: -gradientSize })

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()

    if (rect) {
      setPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    }

    onMouseMove?.(event)
  }

  return (
    <div
      ref={ref}
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition({ x: -gradientSize, y: -gradientSize })}
      style={style}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, ${gradientColor}, transparent 70%)`,
          opacity: gradientOpacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
