import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { Marquee } from '@/components/ui/marquee'
import { SocialPostCard } from '@/components/ui/social-post-card'
import type { SocialPost } from '@/lib/sanity-queries'

export function SocialPostsGrid({ posts }: { posts: SocialPost[] }) {
  const t = useTranslations('social')
  const featured = posts.filter((post) => post.featured).slice(0, 4)
  const visible = featured.length > 0 ? featured : posts.slice(0, 4)
  const overflow = posts.slice(4)

  return (
    <section id="social" className="mx-auto max-w-6xl px-5 py-24">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs text-muted-foreground">{t('eyebrow')}</p>
        <h2 className="mb-10 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((post, index) => (
          <BlurFade key={post._id} delay={0.05 + index * 0.07}>
            <SocialPostCard post={post} />
          </BlurFade>
        ))}
      </div>

      {overflow.length > 0 && (
        <Marquee pauseOnHover className="[--duration:40s]">
          {overflow.map((post) => (
            <div key={post._id} className="w-80 shrink-0">
              <SocialPostCard post={post} />
            </div>
          ))}
        </Marquee>
      )}
    </section>
  )
}
