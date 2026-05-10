import { defineType, defineField } from 'sanity'

const localizedString = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      {
        name: 'en',
        title: 'English',
        type: 'string',
        validation: required ? (rule) => rule.required() : undefined,
      },
      { name: 'es', title: 'Spanish', type: 'string' },
    ],
  })

const localizedText = (name: string, title: string, rows: number) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'en', title: 'English', type: 'text', rows },
      { name: 'es', title: 'Spanish', type: 'text', rows },
    ],
  })

const localizedSlug = defineField({
  name: 'slug',
  title: 'Slug',
  type: 'object',
  fields: [
    { name: 'en', title: 'English', type: 'slug', options: { source: 'title.en' } },
    { name: 'es', title: 'Spanish', type: 'slug', options: { source: 'title.es' } },
  ],
})

const localizedContent = defineField({
  name: 'content',
  title: 'Content',
  type: 'object',
  fields: [
    {
      name: 'en',
      title: 'English',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'es',
      title: 'Spanish',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    },
  ],
})

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    localizedString('title', 'Title', true),
    localizedSlug,
    localizedText('description', 'Description', 3),
    localizedContent,
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
    select: { title: 'title.en', media: 'featuredImage' },
  },
})
