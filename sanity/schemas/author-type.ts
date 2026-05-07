import { defineType, defineField } from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'bio', type: 'text', rows: 4 }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
})
