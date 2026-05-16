import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { BlurFade } from '@/components/ui/blur-fade'
import { Chip } from '@/components/ui/chip'
import type { PostSummary } from '@/lib/sanity-queries'

type BlogHeroPostProps = {
  post: PostSummary
  locale?: string
}

const dateLocale = (locale?: string) => (locale === 'es' ? 'es-CR' : 'en-US')

export function BlogHeroPost({ post, locale }: BlogHeroPostProps) {
  const slug = post.slug?.current
  if (!slug) return null

  return (
    <BlurFade delay={0.08}>
      <Link
        href={`/blog/${slug}`}
        className="group mb-14 grid gap-6 rounded-2xl border border-hairline bg-surface-1 p-3 transition-colors hover:border-accent/50 md:grid-cols-[1.15fr_0.85fr] md:items-center md:p-4"
      >
        {post.cover ? (
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={post.cover}
              alt={post.title ?? ''}
              fill
              priority
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-video rounded-xl bg-muted" />
        )}
        <div className="flex flex-col gap-3 px-1 pb-2 md:px-4 md:pb-0">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Chip key={tag._id} label={tag.title} />
              ))}
            </div>
          )}
          <h2 className="text-2xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-accent md:text-3xl">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="line-clamp-3 text-sm text-muted-foreground md:text-base">
              {post.excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {post.author?.name && <span>{post.author.name}</span>}
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(dateLocale(locale), {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            )}
            {post.readingMinutes ? <span>{post.readingMinutes} min read</span> : null}
          </div>
        </div>
      </Link>
    </BlurFade>
  )
}
