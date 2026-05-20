import type { SocialItem } from '@/components/ui/social-feed-grid'
import type { SocialPost } from '@/lib/sanity-queries'

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function relativeTime(iso: string): string {
  const diffSeconds = (new Date(iso).getTime() - Date.now()) / 1000
  const absSeconds = Math.abs(diffSeconds)

  if (absSeconds < 60) return relativeTimeFormatter.format(Math.round(diffSeconds), 'second')
  if (absSeconds < 3600) {
    return relativeTimeFormatter.format(Math.round(diffSeconds / 60), 'minute')
  }
  if (absSeconds < 86400) {
    return relativeTimeFormatter.format(Math.round(diffSeconds / 3600), 'hour')
  }
  if (absSeconds < 2592000) {
    return relativeTimeFormatter.format(Math.round(diffSeconds / 86400), 'day')
  }
  if (absSeconds < 31536000) {
    return relativeTimeFormatter.format(Math.round(diffSeconds / 2592000), 'month')
  }

  return relativeTimeFormatter.format(Math.round(diffSeconds / 31536000), 'year')
}

function normalizePlatform(platform?: string): SocialItem['platform'] {
  return platform === 'reddit' ? 'reddit' : 'x'
}

export function adaptSocialPost(post: SocialPost): SocialItem {
  const platform = normalizePlatform(post.platform)

  return {
    id: post._id,
    platform,
    url: post.permalink ?? '#',
    postedAt: post.postedAt ? relativeTime(post.postedAt) : '',
    text: post.body || undefined,
    handle: post.handle || undefined,
    postTitle: post.postTitle || undefined,
    subreddit: post.subreddit || undefined,
    // Reddit reuses the Sanity stats.likes field as upvotes to avoid a separate schema object.
    upvotes: platform === 'reddit' ? post.stats?.likes : undefined,
    likes: platform === 'reddit' ? undefined : post.stats?.likes,
    comments: post.stats?.replies,
    shares: post.stats?.reposts,
  }
}

export function adaptSocialPosts(posts: SocialPost[]): SocialItem[] {
  return posts.map(adaptSocialPost)
}
