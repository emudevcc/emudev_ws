import { defineType, defineField } from 'sanity'
import {
  localizedContent,
  localizedSlug,
  localizedString,
  localizedText,
} from '../lib/i18n-helpers'

const STATUSES = [
  { title: 'Live', value: 'live' },
  { title: 'Archived', value: 'archived' },
  { title: 'Work in Progress', value: 'wip' },
]

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    localizedString('title', 'Title', true),
    localizedSlug(),
    localizedText('description', 'Description', 3),
    localizedContent(),
    localizedString('tagline', 'Tagline'),
    localizedString('role', 'Role'),
    defineField({
      name: 'year',
      type: 'number',
      validation: (rule) => rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: { list: STATUSES },
      initialValue: 'live',
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'caseStudyUrl', type: 'url' }),
    defineField({ name: 'order', type: 'number' }),
    defineField({
      name: 'tech',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'skill' }] }],
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [localizedString('label', 'Label'), { name: 'value', type: 'string' }],
          preview: { select: { title: 'label.en', subtitle: 'value' } },
        },
      ],
    }),
    defineField({ name: 'cover', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'liveUrl', type: 'url' }),
    defineField({ name: 'repoUrl', type: 'url' }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: 'title.en', media: 'cover' },
  },
})
