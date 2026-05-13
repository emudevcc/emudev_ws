import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/metadata'
import { getPosts } from '@/lib/sanity-queries'
import { PostCard } from '@/components/post-card'

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

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-10 text-4xl font-bold tracking-tight">Blog</h1>
      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No posts yet.</p>
      )}
    </section>
  )
}
