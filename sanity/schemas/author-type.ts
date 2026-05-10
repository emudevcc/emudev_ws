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

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    localizedString('name', 'Name', true),
    localizedText('bio', 'Bio', 4),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
  ],
  preview: {
    select: { title: 'name.en', media: 'image' },
  },
})
