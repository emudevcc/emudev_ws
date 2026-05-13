---
phase: 4
title: "Skills catalog"
status: completed
priority: P1
effort: "45m"
dependencies: []
---

# Phase 4: Skills catalog

## Overview

Create all `skill` documents. This phase must run **before** phases 3 and 7 because experience and project documents reference skill `_id` values. Skill IDs use the `seed-skill-` prefix.

## Related Code Files

- Create: `sanity/seed/04-skills.ndjson`

## Implementation Steps

### Step 1: Write `sanity/seed/04-skills.ndjson`

One document per line. Categories: `platform`, `language`, `tool`, `framework`, `design`.

```json
{ "_id": "seed-skill-adobe-analytics", "_type": "skill", "name": "Adobe Analytics", "slug": { "_type": "slug", "current": "adobe-analytics" }, "category": "platform", "level": "core", "yearsExperience": 8, "iconSlug": "adobe", "order": 1 }
{ "_id": "seed-skill-adobe-target", "_type": "skill", "name": "Adobe Target", "slug": { "_type": "slug", "current": "adobe-target" }, "category": "platform", "level": "core", "yearsExperience": 6, "iconSlug": "adobe", "order": 2 }
{ "_id": "seed-skill-adobe-launch", "_type": "skill", "name": "Adobe Experience Platform Tags", "slug": { "_type": "slug", "current": "adobe-experience-platform-tags" }, "category": "platform", "level": "core", "yearsExperience": 7, "order": 3 }
{ "_id": "seed-skill-adobe-audience-manager", "_type": "skill", "name": "Adobe Audience Manager", "slug": { "_type": "slug", "current": "adobe-audience-manager" }, "category": "platform", "level": "proficient", "yearsExperience": 4, "order": 4 }
{ "_id": "seed-skill-javascript", "_type": "skill", "name": "JavaScript", "slug": { "_type": "slug", "current": "javascript" }, "category": "language", "level": "core", "yearsExperience": 19, "iconSlug": "javascript", "order": 10 }
{ "_id": "seed-skill-typescript", "_type": "skill", "name": "TypeScript", "slug": { "_type": "slug", "current": "typescript" }, "category": "language", "level": "proficient", "yearsExperience": 4, "iconSlug": "typescript", "order": 11 }
{ "_id": "seed-skill-python", "_type": "skill", "name": "Python", "slug": { "_type": "slug", "current": "python" }, "category": "language", "level": "proficient", "yearsExperience": 5, "iconSlug": "python", "order": 12 }
{ "_id": "seed-skill-sql", "_type": "skill", "name": "SQL", "slug": { "_type": "slug", "current": "sql" }, "category": "language", "level": "proficient", "yearsExperience": 10, "order": 13 }
{ "_id": "seed-skill-html-css", "_type": "skill", "name": "HTML & CSS", "slug": { "_type": "slug", "current": "html-css" }, "category": "language", "level": "core", "yearsExperience": 19, "iconSlug": "html5", "order": 14 }
{ "_id": "seed-skill-react", "_type": "skill", "name": "React", "slug": { "_type": "slug", "current": "react" }, "category": "framework", "level": "proficient", "yearsExperience": 6, "iconSlug": "react", "order": 20 }
{ "_id": "seed-skill-nextjs", "_type": "skill", "name": "Next.js", "slug": { "_type": "slug", "current": "nextjs" }, "category": "framework", "level": "proficient", "yearsExperience": 3, "iconSlug": "nextdotjs", "order": 21 }
{ "_id": "seed-skill-nodejs", "_type": "skill", "name": "Node.js", "slug": { "_type": "slug", "current": "nodejs" }, "category": "framework", "level": "proficient", "yearsExperience": 8, "iconSlug": "nodedotjs", "order": 22 }
{ "_id": "seed-skill-drupal", "_type": "skill", "name": "Drupal", "slug": { "_type": "slug", "current": "drupal" }, "category": "framework", "level": "familiar", "yearsExperience": 4, "iconSlug": "drupal", "order": 23 }
{ "_id": "seed-skill-powerbi", "_type": "skill", "name": "Power BI", "slug": { "_type": "slug", "current": "power-bi" }, "category": "tool", "level": "proficient", "yearsExperience": 4, "iconSlug": "powerbi", "order": 30 }
{ "_id": "seed-skill-sanity", "_type": "skill", "name": "Sanity CMS", "slug": { "_type": "slug", "current": "sanity-cms" }, "category": "tool", "level": "proficient", "yearsExperience": 2, "iconSlug": "sanity", "order": 31 }
{ "_id": "seed-skill-git", "_type": "skill", "name": "Git", "slug": { "_type": "slug", "current": "git" }, "category": "tool", "level": "core", "yearsExperience": 12, "iconSlug": "git", "order": 32 }
{ "_id": "seed-skill-figma", "_type": "skill", "name": "Figma", "slug": { "_type": "slug", "current": "figma" }, "category": "design", "level": "familiar", "yearsExperience": 3, "iconSlug": "figma", "order": 40 }
```

## Todo List

- [x] Write `sanity/seed/04-skills.ndjson` (17 documents)
- [x] Confirm all `_id` values match the `_ref` values used in phases 3 and 7
- [x] Verify skills appear in Studio grouped by category

## Success Criteria

- [x] 17 skill documents created
- [x] Platform category: Adobe Analytics, Adobe Target, AEP Tags, AAM
- [x] Language category: JS, TS, Python, SQL, HTML/CSS
- [x] Framework category: React, Next.js, Node.js, Drupal
- [x] Tool category: Power BI, Sanity, Git
- [x] Design category: Figma
- [x] All `iconSlug` values use simple-icons format (lowercase, no spaces)
