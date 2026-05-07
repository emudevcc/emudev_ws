import type { Metadata } from 'next'
import Link from 'next/link'
import { getPosts } from '@/lib/sanity-queries'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts and articles by Esteban Montero',
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-10 text-4xl font-bold tracking-tight">Blog</h1>
      {posts.length > 0 ? (
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post._id}>
              <Link href={`/blog/${post.slug?.current}`} className="group block">
                <p className="text-sm text-muted-foreground">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : null}
                </p>
                <h2 className="mt-1 text-xl font-semibold group-hover:underline">{post.title}</h2>
                {post.excerpt && (
                  <p className="mt-2 text-muted-foreground line-clamp-2">{post.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No posts yet.</p>
      )}
    </section>
  )
}
