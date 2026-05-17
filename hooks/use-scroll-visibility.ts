'use client'

import { useEffect, useState } from 'react'

export function useScrollVisibility(hideDelay = 3000): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    function onScroll() {
      setVisible(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setVisible(false), hideDelay)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(timeout)
    }
  }, [hideDelay])

  return visible
}
