'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlurFade } from '@/components/ui/blur-fade'
import { SocialFeedCard } from '@/components/ui/social-feed-card'

export type SocialItem = {
  id: string
  platform: 'youtube' | 'tiktok' | 'instagram' | 'reddit' | 'x' | 'threads'
  url: string
  postedAt: string
  // video (youtube, tiktok)
  videoTitle?: string
  channelName?: string
  thumbnailHue?: number
  duration?: string
  views?: number
  // text posts (x, threads, reddit body)
  text?: string
  handle?: string
  displayName?: string
  // reddit
  postTitle?: string
  subreddit?: string
  upvotes?: number
  // engagement
  likes?: number
  comments?: number
  shares?: number
}

type FilterId = 'all' | SocialItem['platform']

const TABS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'x', label: 'X' },
  { id: 'threads', label: 'Threads' },
]

const PAGE_SIZE = 6

export function SocialFeedGrid({ items }: { items: SocialItem[] }) {
  const [active, setActive] = useState<FilterId>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => (active === 'all' ? items : items.filter((i) => i.platform === active)),
    [active, items]
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1
  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  return (
    <div>
      {/* Platform filter tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActive(tab.id)
              setPage(1)
            }}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 font-mono text-xs transition-colors duration-150',
              active === tab.id
                ? 'bg-foreground text-background'
                : 'border border-hairline bg-surface-1 text-fg-3 hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Responsive grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((item, i) => (
          <BlurFade key={`${item.id}-p${currentPage}`} delay={0.04 + i * 0.05}>
            <SocialFeedCard item={item} />
          </BlurFade>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 font-mono text-xs transition-colors duration-150',
              'border border-hairline bg-surface-1',
              currentPage === 1 ? 'cursor-not-allowed text-fg-4' : 'text-fg-3 hover:text-foreground'
            )}
          >
            <ChevronLeft size={14} />
          </button>

          <span className="font-mono text-xs text-fg-3">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 font-mono text-xs transition-colors duration-150',
              'border border-hairline bg-surface-1',
              currentPage === totalPages
                ? 'cursor-not-allowed text-fg-4'
                : 'text-fg-3 hover:text-foreground'
            )}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
