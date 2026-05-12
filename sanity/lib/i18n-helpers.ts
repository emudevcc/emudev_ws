import { defineField } from 'sanity'

export const localizedString = (name: string, title: string, required = false) =>
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

export const localizedText = (name: string, title: string, rows: number) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'en', title: 'English', type: 'text', rows },
      { name: 'es', title: 'Spanish', type: 'text', rows },
    ],
  })

export const localizedSlug = (sourceField = 'title') =>
  defineField({
    name: 'slug',
    title: 'Slug',
    type: 'object',
    fields: [
      {
        name: 'en',
        title: 'English',
        type: 'slug',
        options: { source: `${sourceField}.en` },
      },
      {
        name: 'es',
        title: 'Spanish',
        type: 'slug',
        options: { source: `${sourceField}.es` },
      },
    ],
  })

export const localizedContent = (name = 'content') =>
  defineField({
    name,
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

export const localizedRichText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'en', title: 'English', type: 'array', of: [{ type: 'block' }] },
      { name: 'es', title: 'Spanish', type: 'array', of: [{ type: 'block' }] },
    ],
  })

export const localizedArray = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'en', title: 'English', type: 'array', of: [{ type: 'string' }] },
      { name: 'es', title: 'Spanish', type: 'array', of: [{ type: 'string' }] },
    ],
  })
