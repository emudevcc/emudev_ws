import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/metadata'
import { getPosts } from '@/lib/sanity-queries'
import { BlogHeroPost } from '@/components/blog/blog-hero-post'
import { BlurFade } from '@/components/ui/blur-fade'
import { BlogListClient } from './_components/blog-list-client'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title: 'Blog',
    description: 'Thoughts and articles by Esteban Montero',
    alternates: localeAlternates('/blog', locale),
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const posts = (await getPosts(locale)) ?? []
  const publishedPosts = posts.filter((post) => post.status !== 'draft')
  const [heroPost, ...gridPosts] = publishedPosts

  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <BlurFade delay={0.04}>
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">Writing</p>
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Notes on analytics architecture, software engineering, and the systems behind useful
            digital products.
          </p>
        </div>
      </BlurFade>

      {heroPost ? (
        <>
          <BlogHeroPost post={heroPost} locale={locale} />
          {gridPosts.length > 0 && <BlogListClient posts={gridPosts} locale={locale} />}
        </>
      ) : (
        <p className="text-muted-foreground">No posts yet.</p>
      )}
    </section>
  )
}
