import { defineType, defineField } from 'sanity'

const PROFICIENCY = [
  { title: 'Native', value: 'native' },
  { title: 'Fluent', value: 'fluent' },
  { title: 'Professional', value: 'professional' },
  { title: 'Conversational', value: 'conversational' },
  { title: 'Basic', value: 'basic' },
]

export const languageType = defineType({
  name: 'language',
  title: 'Language (Spoken)',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'code', type: 'string', description: 'ISO 639-1 (e.g. "en", "es")' }),
    defineField({ name: 'proficiency', type: 'string', options: { list: PROFICIENCY } }),
    defineField({ name: 'cefr', type: 'string', description: 'CEFR level (A1..C2)' }),
  ],
  preview: { select: { title: 'name', subtitle: 'proficiency' } },
})
