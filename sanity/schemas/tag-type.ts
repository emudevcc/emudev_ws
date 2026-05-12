import { defineType } from 'sanity'
import { localizedSlug, localizedString } from '../lib/i18n-helpers'

export const tagType = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [localizedString('title', 'Title', true), localizedSlug()],
  preview: {
    select: { title: 'title.en' },
  },
})
