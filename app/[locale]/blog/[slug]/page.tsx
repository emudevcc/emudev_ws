import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPosts, getPostBySlug } from '@/lib/sanity-queries'
import { PortableTextRenderer } from '@/components/portable-text-renderer'
import { routing } from '@/i18n/routing'

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
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <header className="mb-10">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">{post.title}</h1>
        {post.publishedAt && (
          <time className="text-sm text-muted-foreground">
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
      </header>

      {post.content && (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <PortableTextRenderer
            content={post.content as Parameters<typeof PortableTextRenderer>[0]['content']}
          />
        </div>
      )}
    </article>
  )
}
