import { projectType } from './schemas/project-type'
import { postType } from './schemas/post-type'
import { authorType } from './schemas/author-type'
import { tagType } from './schemas/tag-type'
import { siteSettingsType } from './schemas/site-settings-type'
import { aboutType } from './schemas/about-type'
import { skillType } from './schemas/skill-type'
import { experienceType } from './schemas/experience-type'
import { certificationType } from './schemas/certification-type'
import { educationType } from './schemas/education-type'
import { languageType } from './schemas/language-type'
import { strengthType } from './schemas/strength-type'
import { socialPostType } from './schemas/social-post-type'
import { testimonialType } from './schemas/testimonial-type'

export const schema = {
  types: [
    projectType,
    postType,
    authorType,
    tagType,
    siteSettingsType,
    aboutType,
    skillType,
    experienceType,
    certificationType,
    educationType,
    languageType,
    strengthType,
    socialPostType,
    testimonialType,
  ],
}
