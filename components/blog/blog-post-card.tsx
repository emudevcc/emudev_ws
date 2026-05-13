import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { MagicCard } from '@/components/ui/magic-card'
import { Chip } from '@/components/ui/chip'
import type { PostSummary } from '@/lib/sanity-queries'

type BlogPostCardProps = {
  post: PostSummary
  locale?: string
}

const dateLocale = (locale?: string) => (locale === 'es' ? 'es-CR' : 'en-US')

export function BlogPostCard({ post, locale }: BlogPostCardProps) {
  const slug = post.slug?.current
  if (!slug) return null

  return (
    <MagicCard className="h-full overflow-hidden rounded-xl border border-border/60 bg-card p-0">
      <Link href={`/blog/${slug}`} className="group block h-full">
        {post.cover && (
          <div className="relative h-44 w-full overflow-hidden">
            <Image
              src={post.cover}
              alt={post.title ?? ''}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex min-h-56 flex-col gap-3 p-5">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <Chip key={tag._id} label={tag.title} className="h-6 px-2 text-[10px]" />
              ))}
            </div>
          )}
          <h2 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-accent">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(dateLocale(locale), {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            )}
            {post.readingMinutes ? <span>{post.readingMinutes} min read</span> : null}
          </div>
        </div>
      </Link>
    </MagicCard>
  )
}
