import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getPosts, getPostBySlug } from '@/lib/sanity-queries'
import { PortableTextRenderer } from '@/components/portable-text-renderer'
import { BlurFade } from '@/components/ui/blur-fade'
import { Chip } from '@/components/ui/chip'
import { routing } from '@/i18n/routing'
import { localeAlternates } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const postsByLocale = await Promise.all(
    routing.locales.map(async (locale) => ({
      locale,
      posts: (await getPosts(locale)) ?? [],
    }))
  )

  return postsByLocale.flatMap(({ locale, posts }) =>
    posts.flatMap((post) => {
      const slug = post.slug?.current
      return slug ? [{ locale, slug }] : []
    })
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: localeAlternates(`/blog/${slug}`, locale),
    openGraph: post.cover ? { images: [{ url: post.cover, width: 1200, height: 630 }] } : undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale)
  if (!post) notFound()
  const author = post.authorOverride ?? post.author
  const dateLocale = locale === 'es' ? 'es-CR' : 'en-US'

  return (
    <article className="mx-auto max-w-3xl px-5 py-24">
      <BlurFade delay={0.04}>
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft size={12} /> Blog
        </Link>
      </BlurFade>

      {post.cover && (
        <BlurFade delay={0.08}>
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-xl border border-hairline">
            <Image
              src={post.cover}
              alt={post.title ?? ''}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        </BlurFade>
      )}

      <BlurFade delay={0.12}>
        <header className="mb-10">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">Writing</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{post.title}</h1>
          <div className="mb-5 flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
            {author?.name && (
              <div className="flex items-center gap-2">
                {author.image && (
                  <Image
                    src={author.image}
                    alt={author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span>{author.name}</span>
              </div>
            )}
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            {post.readingMinutes ? <span>{post.readingMinutes} min read</span> : null}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Chip key={tag._id} label={tag.title} />
              ))}
            </div>
          )}
        </header>
      </BlurFade>

      {post.content && (
        <BlurFade delay={0.2}>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <PortableTextRenderer
              content={post.content as Parameters<typeof PortableTextRenderer>[0]['content']}
            />
          </div>
        </BlurFade>
      )}
    </article>
  )
}
