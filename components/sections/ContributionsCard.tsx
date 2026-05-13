'use client'

import { useEffect, useState } from 'react'
import { GitBranch } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { GitHubContributions } from '@/lib/github'

const levelClasses = [
  'bg-muted/50',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/65',
  'bg-primary',
] as const

export function ContributionsCard() {
  const t = useTranslations('contributions')
  const [data, setData] = useState<GitHubContributions | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/github/contributions')
      .then((res) => (res.ok ? res.json() : null))
      .then((value) => setData(value))
      .catch(() => setData(null))
      .finally(() => setLoaded(true))
  }, [])

  return (
    <div className="rounded-lg border border-border/70 bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-muted-foreground" />
          <p className="font-mono text-xs text-muted-foreground">{t('eyebrow')}</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{t('lastYear')}</span>
      </div>

      {data ? (
        <>
          <div className="flex gap-[3px] overflow-x-auto pb-1">
            {data.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.days.map((day) => (
                  <div
                    key={day.date}
                    className={`size-[10px] rounded-[2px] ${levelClasses[day.level]}`}
                    title={`${day.date}: ${day.count}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            {t('total', { count: data.totalContributions })}
          </p>
        </>
      ) : (
        <div className="flex h-[90px] items-center rounded bg-muted/30 px-4 font-mono text-xs text-muted-foreground">
          {loaded ? t('unavailable') : t('loading')}
        </div>
      )}
    </div>
  )
}
