import { defineType, defineField } from 'sanity'
import { localizedString, localizedText } from '../lib/i18n-helpers'

export const educationType = defineType({
  name: 'education',
  title: 'Education',
  type: 'document',
  fields: [
    defineField({ name: 'institution', type: 'string', validation: (rule) => rule.required() }),
    localizedString('degree', 'Degree', true),
    localizedString('field', 'Field of Study'),
    defineField({
      name: 'startYear',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1900).max(2100),
    }),
    defineField({
      name: 'endYear',
      type: 'number',
      validation: (rule) => rule.integer().min(1900).max(2100),
    }),
    defineField({ name: 'location', type: 'string' }),
    localizedText('notes', 'Notes', 3),
  ],
  preview: {
    select: { title: 'institution', subtitleEn: 'degree.en', start: 'startYear', end: 'endYear' },
    prepare({ title, subtitleEn, start, end }) {
      const range = end ? `${start}-${end}` : `${start}-Present`
      return { title, subtitle: `${subtitleEn ?? ''} (${range})` }
    },
  },
  orderings: [
    {
      title: 'Start year, newest first',
      name: 'startYearDesc',
      by: [{ field: 'startYear', direction: 'desc' }],
    },
  ],
})
