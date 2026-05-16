import { ArrowUpRight } from 'lucide-react'
import { richTextToPlainText, yearLabel } from '@/lib/content'
import type { SocialPost } from '@/lib/sanity-queries'

const platformLabels: Record<string, string> = {
  twitter: 'X',
  x: 'X',
  reddit: 'Reddit',
  linkedin: 'LinkedIn',
}

export function SocialPostCard({ post }: { post: SocialPost }) {
  const body = richTextToPlainText(post.body)

  return (
    <a
      href={post.permalink ?? '#'}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col gap-3 rounded-lg border border-hairline bg-surface-1 p-5 transition-colors hover:border-accent/40"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-muted-foreground">
          {platformLabels[post.platform ?? ''] ?? post.platform}
          {post.subreddit && ` / r/${post.subreddit}`}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {yearLabel(post.postedAt)}
        </span>
      </div>
      <p className="line-clamp-4 text-sm leading-7">{body}</p>
      <div className="mt-auto flex items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
        <span>
          {post.stats?.likes ?? post.stats?.replies ?? post.stats?.reposts ?? 0} interactions
        </span>
        <span className="inline-flex items-center gap-1 transition-colors group-hover:text-foreground">
          Open <ArrowUpRight size={11} />
        </span>
      </div>
    </a>
  )
}
