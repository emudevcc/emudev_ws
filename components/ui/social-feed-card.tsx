'use client'

import {
  Play,
  ArrowUpRight,
  Heart,
  MessageCircle,
  Repeat2,
  ThumbsUp,
  Eye,
  ImageIcon,
} from 'lucide-react'
import type { SocialItem } from '@/components/ui/social-feed-grid'

const PLATFORM_CONFIG: Record<SocialItem['platform'], { label: string; color: string }> = {
  youtube: { label: 'YouTube', color: '#FF0000' },
  tiktok: { label: 'TikTok', color: '#69C9D0' },
  instagram: { label: 'Instagram', color: '#E1306C' },
  reddit: { label: 'Reddit', color: '#FF4500' },
  x: { label: 'X', color: '' },
  threads: { label: 'Threads', color: '' },
}

function fmt(n?: number): string {
  if (!n) return '0'
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

function MediaPlaceholder({
  platform,
  hue = 220,
  duration,
}: {
  platform: SocialItem['platform']
  hue?: number
  duration?: string
}) {
  const isVideo = platform === 'youtube' || platform === 'tiktok'

  return (
    <div
      className="relative mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg"
      style={{
        background: `radial-gradient(ellipse at center, hsl(${hue}deg 45% 18%), hsl(${hue}deg 35% 8%))`,
      }}
    >
      <div className="rounded-full bg-white/10 p-3 backdrop-blur-sm">
        {isVideo ? (
          <Play size={18} className="text-white/80" fill="currentColor" />
        ) : (
          <ImageIcon size={18} className="text-white/50" />
        )}
      </div>
      {duration && (
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
          {duration}
        </span>
      )}
    </div>
  )
}

export function SocialFeedCard({ item }: { item: SocialItem }) {
  const cfg = PLATFORM_CONFIG[item.platform]
  const hasMedia =
    item.platform === 'youtube' || item.platform === 'tiktok' || item.platform === 'instagram'

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-4 transition-all duration-200 hover:border-accent/40 hover:bg-surface-2"
    >
      {/* Platform + timestamp */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-fg-3">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: cfg.color || 'var(--fg-3)' }}
          />
          {cfg.label}
        </div>
        <span className="font-mono text-[11px] text-fg-4">{item.postedAt}</span>
      </div>

      {/* Media placeholder */}
      {hasMedia && (
        <MediaPlaceholder
          platform={item.platform}
          hue={item.thumbnailHue}
          duration={item.duration}
        />
      )}

      {/* Video / post title */}
      {item.videoTitle && (
        <p className="text-sm font-medium leading-snug text-foreground">{item.videoTitle}</p>
      )}
      {item.postTitle && (
        <p className="text-sm font-medium leading-snug text-foreground">{item.postTitle}</p>
      )}

      {/* Text body */}
      {item.text && (
        <p className="line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-fg-2">
          {item.text}
        </p>
      )}

      {/* Sub-labels */}
      {item.subreddit && (
        <span className="font-mono text-[11px] text-fg-3">r/{item.subreddit}</span>
      )}
      {(item.handle ?? item.channelName) && (
        <span className="font-mono text-[11px] text-fg-4">{item.handle ?? item.channelName}</span>
      )}

      {/* Engagement + link */}
      <div className="mt-auto flex items-center justify-between gap-3 font-mono text-[11px] text-fg-4">
        <div className="flex items-center gap-3">
          {item.views != null && (
            <span className="flex items-center gap-1">
              <Eye size={10} />
              {fmt(item.views)}
            </span>
          )}
          {item.upvotes != null && (
            <span className="flex items-center gap-1">
              <ThumbsUp size={10} />
              {fmt(item.upvotes)}
            </span>
          )}
          {item.likes != null && (
            <span className="flex items-center gap-1">
              <Heart size={10} />
              {fmt(item.likes)}
            </span>
          )}
          {item.comments != null && (
            <span className="flex items-center gap-1">
              <MessageCircle size={10} />
              {fmt(item.comments)}
            </span>
          )}
          {item.shares != null && (
            <span className="flex items-center gap-1">
              <Repeat2 size={10} />
              {fmt(item.shares)}
            </span>
          )}
        </div>
        <ArrowUpRight size={12} className="transition-colors group-hover:text-foreground" />
      </div>
    </a>
  )
}
