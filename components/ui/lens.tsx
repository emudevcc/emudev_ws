'use client'

import * as React from 'react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

interface LensProps {
  children: React.ReactNode
  zoomFactor?: number
  lensSize?: number
  isStatic?: boolean
  duration?: number
  className?: string
}

export function Lens({
  children,
  zoomFactor = 1.5,
  lensSize = 170,
  isStatic = false,
  duration = 0.2,
  className,
}: LensProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = React.useState(false)

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (isStatic) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  const lensPosition = isStatic
    ? { x: `calc(50% - ${lensSize / 2}px)`, y: `calc(50% - ${lensSize / 2}px)` }
    : { x: position.x - lensSize / 2, y: position.y - lensSize / 2 }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute z-20 overflow-hidden rounded-full border bg-background/10 shadow-2xl backdrop-blur-sm"
        initial={false}
        animate={{
          opacity: isHovering || isStatic ? 1 : 0,
          ...lensPosition,
        }}
        transition={{ duration, ease: 'easeOut' }}
        style={{
          width: lensSize,
          height: lensSize,
          transformOrigin: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoomFactor})`,
            transformOrigin: isStatic ? 'center' : `${position.x}px ${position.y}px`,
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  )
}
