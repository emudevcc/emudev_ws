import { defineType, defineField } from 'sanity'
import {
  localizedContent,
  localizedSlug,
  localizedString,
  localizedText,
} from '../lib/i18n-helpers'

const POST_STATUSES = [
  { title: 'Draft', value: 'draft' },
  { title: 'Published', value: 'published' },
]

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    localizedString('title', 'Title', true),
    localizedSlug(),
    localizedText('excerpt', 'Excerpt', 2),
    localizedContent(),
    defineField({ name: 'cover', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'author', type: 'reference', to: [{ type: 'author' }] }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({ name: 'readingMinutes', type: 'number' }),
    defineField({ name: 'canonicalUrl', type: 'url' }),
    defineField({
      name: 'status',
      type: 'string',
      options: { list: POST_STATUSES },
      initialValue: 'published',
    }),
    defineField({
      name: 'authorOverride',
      type: 'reference',
      to: [{ type: 'author' }],
      description:
        'Optional override for the author field. Author deprecation: future phase will replace author ref with siteSettings fallback.',
    }),
  ],
  preview: {
    select: { title: 'title.en', subtitle: 'publishedAt', media: 'cover' },
  },
})
