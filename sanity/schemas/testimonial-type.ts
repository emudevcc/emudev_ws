import { defineType, defineField } from 'sanity'
import { localizedString, localizedText } from '../lib/i18n-helpers'

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    localizedText('quote', 'Quote', 4),
    defineField({ name: 'author', type: 'string', validation: (rule) => rule.required() }),
    localizedString('authorRole', 'Author Role'),
    defineField({ name: 'authorCompany', type: 'string' }),
    defineField({ name: 'authorAvatar', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'relatedExperience',
      type: 'reference',
      to: [{ type: 'experience' }],
    }),
  ],
  preview: { select: { title: 'author', subtitle: 'authorCompany', media: 'authorAvatar' } },
})
