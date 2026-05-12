import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Singletons')
        .child(
          S.list()
            .title('Singletons')
            .items([
              S.listItem()
                .title('Site Settings')
                .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
              S.listItem()
                .title('About')
                .child(S.document().schemaType('about').documentId('about')),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Portfolio')
        .child(
          S.list()
            .title('Portfolio')
            .items([
              S.documentTypeListItem('project'),
              S.documentTypeListItem('experience'),
              S.documentTypeListItem('education'),
            ])
        ),
      S.listItem()
        .title('Blog')
        .child(
          S.list()
            .title('Blog')
            .items([
              S.documentTypeListItem('post'),
              S.documentTypeListItem('tag'),
              S.documentTypeListItem('author'),
            ])
        ),
      S.listItem()
        .title('Skills & Credentials')
        .child(
          S.list()
            .title('Skills & Credentials')
            .items([
              S.documentTypeListItem('skill'),
              S.documentTypeListItem('certification'),
              S.documentTypeListItem('language'),
            ])
        ),
      S.listItem()
        .title('About Extras')
        .child(
          S.list()
            .title('About Extras')
            .items([
              S.documentTypeListItem('strength'),
              S.documentTypeListItem('testimonial'),
              S.documentTypeListItem('socialPost'),
            ])
        ),
    ])
