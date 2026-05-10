'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useTransition } from 'react'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const other = locale === 'en' ? 'es' : 'en'

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: other })
    })
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      aria-label={other === 'en' ? 'Switch to English' : 'Cambiar a Español'}
    >
      {other === 'en' ? 'EN' : 'ES'}
    </button>
  )
}
