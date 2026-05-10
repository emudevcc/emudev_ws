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

const localizedSlug = defineField({
  name: 'slug',
  title: 'Slug',
  type: 'object',
  fields: [
    { name: 'en', title: 'English', type: 'slug', options: { source: 'title.en' } },
    { name: 'es', title: 'Spanish', type: 'slug', options: { source: 'title.es' } },
  ],
})

export const tagType = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [localizedString('title', 'Title', true), localizedSlug],
  preview: {
    select: { title: 'title.en' },
  },
})
