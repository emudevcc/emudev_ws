import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { SocialFeedGrid } from '@/components/ui/social-feed-grid'
import { SOCIAL_DUMMY_ITEMS } from '@/lib/social-dummy-data'
import type { SocialPost } from '@/lib/sanity-queries'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SocialPostsGrid({ posts }: { posts: SocialPost[] }) {
  const t = useTranslations('social')

  return (
    <section id="social" className="mx-auto max-w-6xl px-5 py-24">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
          {t('eyebrow')}
        </p>
        <h2 className="mb-10 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      <BlurFade delay={0.08}>
        <SocialFeedGrid items={SOCIAL_DUMMY_ITEMS} />
      </BlurFade>
    </section>
  )
}
