import { defineType, defineField } from 'sanity'
import { localizedString, localizedText } from '../lib/i18n-helpers'

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
