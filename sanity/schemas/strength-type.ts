import { defineType, defineField } from 'sanity'
import { localizedRichText } from '../lib/i18n-helpers'

const DOMAINS = [
  { title: 'Executing', value: 'executing' },
  { title: 'Influencing', value: 'influencing' },
  { title: 'Relationship Building', value: 'relationship-building' },
  { title: 'Strategic Thinking', value: 'strategic-thinking' },
]

export const strengthType = defineType({
  name: 'strength',
  title: 'Strength (CliftonStrengths)',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'rank',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1).max(5),
    }),
    defineField({ name: 'domain', type: 'string', options: { list: DOMAINS } }),
    localizedRichText('description', 'Description'),
  ],
  preview: {
    select: { title: 'name', rank: 'rank', subtitle: 'domain' },
    prepare: ({ title, rank, subtitle }) => ({ title: `#${rank} ${title}`, subtitle }),
  },
  orderings: [
    { title: 'Rank ascending', name: 'rankAsc', by: [{ field: 'rank', direction: 'asc' }] },
  ],
})
