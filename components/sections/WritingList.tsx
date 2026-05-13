import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { BlurFade } from '@/components/ui/blur-fade'
import type { PostSummary } from '@/lib/sanity-queries'

export function WritingList({ posts }: { posts: PostSummary[] }) {
  const t = useTranslations('writing')
  const published = posts.filter((post) => post.status !== 'draft').slice(0, 6)

  return (
    <section id="writing" className="mx-auto max-w-6xl px-5 py-24">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs text-muted-foreground">{t('eyebrow')}</p>
        <h2 className="mb-10 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      <div className="divide-y divide-border/70">
        {published.map((post, index) => {
          const slug = post.slug?.current
          if (!slug) return null

          return (
            <BlurFade key={post._id} delay={0.03 + index * 0.05}>
              <Link
                href={`/blog/${slug}`}
                className="group flex items-center justify-between gap-5 py-5 transition-transform hover:translate-x-1"
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    {post.publishedAt && (
                      <time>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                    {post.readingMinutes && (
                      <span>{t('readMin', { count: post.readingMinutes })}</span>
                    )}
                  </div>
                  <h3 className="font-semibold transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                />
              </Link>
            </BlurFade>
          )
        })}
      </div>
    </section>
  )
}
