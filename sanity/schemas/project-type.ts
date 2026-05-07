import { defineType, defineField } from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
    defineField({ name: 'featuredImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({ name: 'liveUrl', type: 'url' }),
    defineField({ name: 'repoUrl', type: 'url' }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: 'title', media: 'featuredImage' },
  },
})
