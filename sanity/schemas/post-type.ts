import { defineType, defineField } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'excerpt', type: 'text', rows: 2 }),
    defineField({
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
    defineField({ name: 'author', type: 'reference', to: [{ type: 'author' }] }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt' },
  },
})
