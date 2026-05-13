import { useTranslations } from 'next-intl'

export function FooterSection() {
  const t = useTranslations('footer')

  return (
    <footer className="px-5 py-12 text-center">
      <p className="font-mono text-xs text-muted-foreground">
        {t('built', { year: new Date().getFullYear() })}
      </p>
    </footer>
  )
}
