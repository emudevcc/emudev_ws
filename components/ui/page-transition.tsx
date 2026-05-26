'use client'

import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.main
      id="main-content"
      key={pathname}
      initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  )
}
