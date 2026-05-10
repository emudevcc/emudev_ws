import { defineType, defineField } from 'sanity'

const localizedString = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'en', title: 'English', type: 'string' },
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

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    localizedString('siteName', 'Site Name'),
    localizedText('description', 'Description', 3),
    defineField({ name: 'logo', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', type: 'string', title: 'Platform' },
            { name: 'url', type: 'url', title: 'URL' },
          ],
        },
      ],
    }),
  ],
})
