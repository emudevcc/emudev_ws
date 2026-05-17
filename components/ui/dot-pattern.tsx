'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

function dotTiming(index: number) {
  const seed1 = Math.sin(index * 12.9898) * 43758.5453
  const seed2 = Math.sin(index * 78.233) * 43758.5453
  const n1 = seed1 - Math.floor(seed1)
  const n2 = seed2 - Math.floor(seed2)

  return {
    delay: n1 * 7,
    duration: 2.5 + n2 * 2.5, // 2.5–5s
    isStar: n1 < 0.12, // ~12% of dots twinkle
  }
}

/**
 *  DotPattern Component Props
 *
 * @param {number} [width=16] - The horizontal spacing between dots
 * @param {number} [height=16] - The vertical spacing between dots
 * @param {number} [x=0] - The x-offset of the entire pattern
 * @param {number} [y=0] - The y-offset of the entire pattern
 * @param {number} [cx=1] - The x-offset of individual dots
 * @param {number} [cy=1] - The y-offset of individual dots
 * @param {number} [cr=1] - The radius of each dot
 * @param {string} [className] - Additional CSS classes to apply to the SVG container
 * @param {boolean} [glow=false] - Whether dots should have a glowing animation effect
 * @param {boolean} [twinkle=false] - Whether a random subset of dots (~12%) should pulse like stars
 */
interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  glow?: boolean
  twinkle?: boolean
  [key: string]: unknown
}

/**
 * DotPattern Component
 *
 * A React component that creates an animated or static dot pattern background using SVG.
 * The pattern automatically adjusts to fill its container and can optionally display glowing dots.
 *
 * @component
 *
 * @see DotPatternProps for the props interface.
 *
 * @example
 * // Basic usage
 * <DotPattern />
 *
 * // With glowing effect and custom spacing
 * <DotPattern
 *   width={20}
 *   height={20}
 *   glow={true}
 *   className="opacity-50"
 * />
 *
 * @notes
 * - The component is client-side only ("use client")
 * - Automatically responds to container size changes
 * - When glow is enabled, dots will animate with random delays and durations
 * - Uses Motion for animations
 * - Dots color can be controlled via the text color utility classes
 */

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  twinkle = false,
  ...props
}: DotPatternProps) {
  const id = useId()
  const containerRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const shouldRenderDots = dimensions.width > 0 && dimensions.height > 0
  const dots = Array.from(
    {
      length: shouldRenderDots
        ? Math.ceil(dimensions.width / width) * Math.ceil(dimensions.height / height)
        : 0,
    },
    (_, i) => {
      const col = i % Math.ceil(dimensions.width / width)
      const row = Math.floor(i / Math.ceil(dimensions.width / width))
      return {
        x: col * width + cx + x,
        y: row * height + cy + y,
        ...dotTiming(i),
      }
    }
  )

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80',
        className
      )}
      {...props}
    >
      {shouldRenderDots && glow && (
        <defs>
          <radialGradient id={`${id}-gradient`}>
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {dots.map((dot) => {
        const shouldTwinkle = twinkle && dot.isStar && !prefersReducedMotion

        return (
          <motion.circle
            key={`${dot.x}-${dot.y}`}
            cx={dot.x}
            cy={dot.y}
            r={cr}
            fill={glow ? `url(#${id}-gradient)` : 'currentColor'}
            fillOpacity={twinkle && !glow ? 0.2 : undefined}
            initial={glow ? { opacity: 0.4, scale: 1 } : shouldTwinkle ? { fillOpacity: 0.2 } : {}}
            animate={
              glow
                ? { opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }
                : shouldTwinkle
                  ? { fillOpacity: [0.2, 0.72, 0.2] }
                  : {}
            }
            transition={
              glow
                ? {
                    duration: dot.duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: dot.delay,
                    ease: 'easeInOut',
                  }
                : shouldTwinkle
                  ? {
                      duration: dot.duration,
                      repeat: Infinity,
                      repeatType: 'loop',
                      delay: dot.delay,
                      ease: 'easeInOut',
                    }
                  : {}
            }
          />
        )
      })}
    </svg>
  )
}
