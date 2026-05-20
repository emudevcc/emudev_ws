import { defineType, defineField } from 'sanity'
import { localizedRichText } from '../lib/i18n-helpers'

const PLATFORMS = [
  { title: 'X (Twitter)', value: 'x' },
  { title: 'Reddit', value: 'reddit' },
]

export const socialPostType = defineType({
  name: 'socialPost',
  title: 'Social Post',
  type: 'document',
  fields: [
    defineField({
      name: 'platform',
      type: 'string',
      options: { list: PLATFORMS },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'handle', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'subreddit',
      type: 'string',
      hidden: ({ parent }) => parent?.platform !== 'reddit',
    }),
    defineField({
      name: 'postTitle',
      title: 'Post Title',
      type: 'string',
      description: 'Reddit post title. Leave blank for X/Twitter posts.',
      hidden: ({ parent }) => parent?.platform !== 'reddit',
    }),
    localizedRichText('body', 'Body'),
    defineField({ name: 'postedAt', type: 'datetime', validation: (rule) => rule.required() }),
    defineField({ name: 'permalink', type: 'url' }),
    defineField({
      name: 'stats',
      type: 'object',
      fields: [
        { name: 'likes', type: 'number' },
        { name: 'replies', type: 'number' },
        { name: 'reposts', type: 'number' },
      ],
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'handle', subtitle: 'platform' } },
  orderings: [
    {
      title: 'Posted, newest first',
      name: 'postedAtDesc',
      by: [{ field: 'postedAt', direction: 'desc' }],
    },
  ],
})
