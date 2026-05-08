import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPosts, getPostBySlug } from '@/lib/sanity-queries'
import { PortableTextRenderer } from '@/components/portable-text-renderer'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = (await getPosts()) ?? []
  return posts.map((p) => ({ slug: p.slug?.current ?? '' })).filter((p) => p.slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
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
