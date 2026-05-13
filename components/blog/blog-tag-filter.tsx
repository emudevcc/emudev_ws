'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Tag = {
  _id: string
  title?: string
}

type BlogTagFilterProps = {
  tags: Tag[]
  onFilter: (tagId: string | null) => void
}

export function BlogTagFilter({ tags, onFilter }: BlogTagFilterProps) {
  const [selected, setSelected] = useState<string | null>(null)

  function select(tagId: string | null) {
    setSelected(tagId)
    onFilter(tagId)
  }

  if (tags.length === 0) return null

  return (
    <div className="mb-10 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => select(null)}
        className={cn(
          'h-8 rounded-full border px-3 font-mono text-[11px] uppercase tracking-[0.04em] transition-colors',
          selected === null
            ? 'border-accent bg-accent text-accent-foreground'
            : 'border-border/70 text-muted-foreground hover:border-accent/60 hover:text-foreground'
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag._id}
          type="button"
          onClick={() => select(tag._id)}
          className={cn(
            'h-8 rounded-full border px-3 font-mono text-[11px] uppercase tracking-[0.04em] transition-colors',
            selected === tag._id
              ? 'border-accent bg-accent text-accent-foreground'
              : 'border-border/70 text-muted-foreground hover:border-accent/60 hover:text-foreground'
          )}
        >
          {tag.title}
        </button>
      ))}
    </div>
  )
}
