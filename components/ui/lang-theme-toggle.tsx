'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun, Languages } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'

// Returns true only on the client; false on the server and during SSR hydration.
// Prevents resolvedTheme from producing a server/client HTML mismatch (React #418).
const useIsMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

export function LangThemeToggle() {
  const locale = useLocale()
  const { resolvedTheme, setTheme } = useTheme()
  const nextLocale = locale === 'es' ? 'en' : 'es'
  const isMounted = useIsMounted()
  const isDark = isMounted && resolvedTheme === 'dark'

  function switchLocale() {
    const nextPath = window.location.pathname.replace(/^\/(en|es)(?=\/|$)/, `/${nextLocale}`)
    window.location.assign(`${nextPath}${window.location.search}${window.location.hash}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={switchLocale}
        className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={locale === 'es' ? 'English' : 'Español'}
      >
        <Languages size={15} />
      </button>
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </div>
  )
}
