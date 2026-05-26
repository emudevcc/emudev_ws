import { defineType, defineField } from 'sanity'
import { localizedArray, localizedRichText, localizedString } from '../lib/i18n-helpers'

const EMPLOYMENT_TYPES = [
  { title: 'Full-time', value: 'full-time' },
  { title: 'Contract', value: 'contract' },
  { title: 'Freelance', value: 'freelance' },
  { title: 'Internship', value: 'internship' },
]

export const experienceType = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    localizedString('role', 'Role', true),
    defineField({ name: 'company', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'companyAlias',
      type: 'string',
      description:
        "Public display name for client privacy. Leave empty to show the real company name. Example: 'Global Financial Services Firm'",
    }),
    defineField({ name: 'companyUrl', type: 'url' }),
    defineField({ name: 'companyLogo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'location', type: 'string' }),
    defineField({ name: 'employmentType', type: 'string', options: { list: EMPLOYMENT_TYPES } }),
    defineField({ name: 'startDate', type: 'date', validation: (rule) => rule.required() }),
    defineField({ name: 'endDate', type: 'date', description: 'Leave empty for current role' }),
    localizedRichText('summary', 'Summary'),
    localizedArray('highlights', 'Highlights'),
    defineField({
      name: 'tech',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'skill' }] }],
    }),
    defineField({
      name: 'clients',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Internal-only real client names. Do not render publicly.',
    }),
    defineField({
      name: 'clientAliases',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        "Public-safe client labels. Use industry synonyms such as 'Global Automotive Brand'.",
    }),
    defineField({ name: 'order', type: 'number' }),
  ],
  preview: {
    select: { title: 'role.en', subtitle: 'company', media: 'companyLogo' },
  },
  orderings: [
    {
      title: 'Start date, newest first',
      name: 'startDateDesc',
      by: [{ field: 'startDate', direction: 'desc' }],
    },
  ],
})
