import { defineType, defineField } from 'sanity'

const CATEGORIES = [
  { title: 'Language', value: 'language' },
  { title: 'Framework', value: 'framework' },
  { title: 'Tool', value: 'tool' },
  { title: 'Platform', value: 'platform' },
  { title: 'Cloud', value: 'cloud' },
  { title: 'Design', value: 'design' },
]

const LEVELS = [
  { title: 'Core', value: 'core' },
  { title: 'Proficient', value: 'proficient' },
  { title: 'Familiar', value: 'familiar' },
]

export const skillType = defineType({
  name: 'skill',
  title: 'Skill',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'category', type: 'string', options: { list: CATEGORIES } }),
    defineField({ name: 'iconImage', type: 'image', options: { hotspot: false } }),
    defineField({
      name: 'iconSlug',
      type: 'string',
      description: 'simple-icons slug (e.g. "react"). Used if iconImage empty.',
    }),
    defineField({ name: 'level', type: 'string', options: { list: LEVELS } }),
    defineField({ name: 'yearsExperience', type: 'number' }),
    defineField({ name: 'order', type: 'number' }),
  ],
  preview: { select: { title: 'name', subtitle: 'category', media: 'iconImage' } },
  orderings: [
    { title: 'Manual order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
})
