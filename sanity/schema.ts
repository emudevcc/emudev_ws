import { projectType } from './schemas/project-type'
import { postType } from './schemas/post-type'
import { authorType } from './schemas/author-type'
import { tagType } from './schemas/tag-type'
import { siteSettingsType } from './schemas/site-settings-type'

export const schema = {
  types: [projectType, postType, authorType, tagType, siteSettingsType],
}
