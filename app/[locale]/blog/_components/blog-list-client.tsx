'use client'

import { useMemo, useState } from 'react'
import { BlogPostCard } from '@/components/blog/blog-post-card'
import { BlogTagFilter } from '@/components/blog/blog-tag-filter'
import { BlurFade } from '@/components/ui/blur-fade'
import type { PostSummary } from '@/lib/sanity-queries'

type BlogListClientProps = {
  posts: PostSummary[]
  locale: string
}

export function BlogListClient({ posts, locale }: BlogListClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const tags = useMemo(() => {
    const seen = new Set<string>()
    const uniqueTags: Array<{ _id: string; title?: string }> = []

    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        if (!seen.has(tag._id)) {
          seen.add(tag._id)
          uniqueTags.push(tag)
        }
      }
    }

    return uniqueTags
  }, [posts])

  const filteredPosts = activeTag
    ? posts.filter((post) => post.tags?.some((tag) => tag._id === activeTag))
    : posts

  return (
    <>
      <BlogTagFilter tags={tags} onFilter={setActiveTag} />
      {filteredPosts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <BlurFade key={post._id} delay={0.04 * index} inView>
              <BlogPostCard post={post} locale={locale} />
            </BlurFade>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No posts in this category yet.</p>
      )}
    </>
  )
}
