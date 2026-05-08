import Link from 'next/link'

interface PostCardProps {
  post: {
    _id: string
    title?: string
    slug?: { current?: string }
    excerpt?: string
    publishedAt?: string
    author?: { name?: string }
  }
}

export function PostCard({ post }: PostCardProps) {
  const slug = post.slug?.current
  if (!slug) return null

  return (
    <article className="group border-b py-8 last:border-b-0">
      <Link href={`/blog/${slug}`} className="block">
        {post.publishedAt && (
          <time className="text-sm text-muted-foreground">
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
        <h2 className="mt-1 text-xl font-semibold group-hover:underline">{post.title}</h2>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-muted-foreground">{post.excerpt}</p>}
        {post.author?.name && (
          <p className="mt-3 text-sm text-muted-foreground">{post.author.name}</p>
        )}
      </Link>
    </article>
  )
}
