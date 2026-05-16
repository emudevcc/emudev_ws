import { useTranslations } from 'next-intl'
import { Chip } from '@/components/ui/chip'
import { richTextToPlainText, yearLabel } from '@/lib/content'
import type { Experience } from '@/lib/sanity-queries'

type ExperienceCardProps = {
  experience: Experience
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const t = useTranslations('experience')
  const start = yearLabel(experience.startDate)
  const end = experience.endDate ? yearLabel(experience.endDate) : t('present')
  const summary = richTextToPlainText(experience.summary)

  return (
    <div className="relative pl-10">
      <span
        className={
          experience.endDate
            ? 'absolute -left-[5px] top-2 size-2.5 rounded-full border-2 border-background bg-muted-foreground/60'
            : 'absolute -left-[5px] top-2 size-2.5 rounded-full border-2 border-background bg-accent ring-4 ring-accent/20'
        }
      />
      <p className="mb-1 font-mono text-xs text-muted-foreground">
        {[start, end].filter(Boolean).join(' - ')}
      </p>
      <h3 className="font-semibold">{experience.role}</h3>
      <p className="text-sm text-muted-foreground">
        {[experience.company, experience.location].filter(Boolean).join(' - ')}
      </p>
      {summary && <p className="mt-3 text-sm leading-7 text-muted-foreground">{summary}</p>}
      {experience.tech && experience.tech.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {experience.tech.map((skill) => (
            <Chip key={skill._id} label={skill.name} />
          ))}
        </div>
      )}
    </div>
  )
}
