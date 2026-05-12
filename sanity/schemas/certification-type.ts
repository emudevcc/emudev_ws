import { defineType, defineField } from 'sanity'

export const certificationType = defineType({
  name: 'certification',
  title: 'Certification',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'issuer', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'issuerLogo', type: 'image', options: { hotspot: false } }),
    defineField({ name: 'issueDate', type: 'date', validation: (rule) => rule.required() }),
    defineField({ name: 'expiryDate', type: 'date' }),
    defineField({ name: 'credentialId', type: 'string' }),
    defineField({ name: 'credentialUrl', type: 'url' }),
    defineField({ name: 'badgeImage', type: 'image' }),
    defineField({
      name: 'skills',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'skill' }] }],
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'issuer', media: 'badgeImage' } },
  orderings: [
    {
      title: 'Issue date, newest first',
      name: 'issueDateDesc',
      by: [{ field: 'issueDate', direction: 'desc' }],
    },
  ],
})
