---
phase: 7
title: "Sample projects"
status: pending
priority: P2
effort: "45m"
dependencies: [4]
---

# Phase 7: Sample projects

## Overview

Create 3–4 `project` documents for the portfolio. Mix of personal projects and sanitised client-adjacent work. All bilingual, conversational tone. References skill IDs from phase 4.

Also create the `sanity/seed/seed.sh` helper that merges all NDJSON files and runs the Sanity import in the correct order (skills first, then documents that reference them).

## Related Code Files

- Create: `sanity/seed/07-projects.ndjson`
- Create: `sanity/seed/seed.sh`

## Implementation Steps

### Step 1: Write `sanity/seed/07-projects.ndjson`

```json
{
  "_id": "seed-project-emudev",
  "_type": "project",
  "title": { "en": "emudev.cc — this site", "es": "emudev.cc — este sitio" },
  "slug": { "en": { "_type": "slug", "current": "emudev-cc" }, "es": { "_type": "slug", "current": "emudev-cc" } },
  "description": {
    "en": "My personal portfolio and dev playground. Built with Next.js 15 App Router, Sanity CMS, Tailwind CSS, and deployed on Vercel. Fully bilingual (EN/ES) with locale-aware routing.",
    "es": "Mi portafolio personal y laboratorio de desarrollo. Construido con Next.js 15 App Router, Sanity CMS, Tailwind CSS y desplegado en Vercel. Completamente bilingüe (EN/ES) con enrutamiento por locale."
  },
  "tagline": { "en": "Where the cobbler's shoes are actually nice.", "es": "Donde los zapatos del zapatero sí son bonitos." },
  "role": { "en": "Designer & Engineer", "es": "Diseñador e Ingeniero" },
  "year": 2025,
  "status": "live",
  "featured": true,
  "liveUrl": "https://www.emudev.cc",
  "repoUrl": "https://github.com/emudevcc/emudev_ws",
  "order": 1,
  "tech": [
    { "_type": "reference", "_ref": "seed-skill-nextjs" },
    { "_type": "reference", "_ref": "seed-skill-typescript" },
    { "_type": "reference", "_ref": "seed-skill-sanity" },
    { "_type": "reference", "_ref": "seed-skill-react" }
  ],
  "metrics": [
    { "_key": "m1", "label": { "en": "Lighthouse score", "es": "Puntuación Lighthouse" }, "value": "98" },
    { "_key": "m2", "label": { "en": "Languages", "es": "Idiomas" }, "value": "2 (EN/ES)" }
  ]
}
{
  "_id": "seed-project-analytics-starter",
  "_type": "project",
  "title": { "en": "Adobe Analytics Data Layer Starter", "es": "Starter de Capa de Datos para Adobe Analytics" },
  "slug": { "en": { "_type": "slug", "current": "adobe-analytics-data-layer-starter" }, "es": { "_type": "slug", "current": "starter-capa-de-datos-adobe-analytics" } },
  "description": {
    "en": "An opinionated, production-ready data layer spec and implementation starter for Adobe Analytics. Includes TypeScript types, Launch rule templates, and a validation test suite. Born from years of enterprise implementations.",
    "es": "Una especificación de capa de datos y starter de implementación opinionado y listo para producción para Adobe Analytics. Incluye tipos TypeScript, plantillas de reglas de Launch y una suite de pruebas de validación. Nació de años de implementaciones empresariales."
  },
  "tagline": { "en": "Stop reinventing the data layer.", "es": "Deja de reinventar la capa de datos." },
  "role": { "en": "Author", "es": "Autor" },
  "year": 2024,
  "status": "wip",
  "featured": true,
  "order": 2,
  "tech": [
    { "_type": "reference", "_ref": "seed-skill-adobe-analytics" },
    { "_type": "reference", "_ref": "seed-skill-adobe-launch" },
    { "_type": "reference", "_ref": "seed-skill-typescript" },
    { "_type": "reference", "_ref": "seed-skill-javascript" }
  ]
}
{
  "_id": "seed-project-ab-test-framework",
  "_type": "project",
  "title": { "en": "A/B Test Governance Framework", "es": "Marco de Gobernanza para Pruebas A/B" },
  "slug": { "en": { "_type": "slug", "current": "ab-test-governance-framework" }, "es": { "_type": "slug", "current": "marco-gobernanza-pruebas-ab" } },
  "description": {
    "en": "A lightweight framework for managing A/B and multivariate test programmes at scale — covering hypothesis documentation, QA checklists, statistical significance guidelines, and results reporting templates. Used internally at Accenture client engagements.",
    "es": "Un marco ligero para gestionar programas de pruebas A/B y multivariadas a escala — que cubre documentación de hipótesis, checklists de QA, pautas de significancia estadística y plantillas de informes de resultados. Usado internamente en compromisos con clientes de Accenture."
  },
  "tagline": { "en": "Structure that makes testing actually repeatable.", "es": "Estructura que hace que las pruebas sean realmente repetibles." },
  "role": { "en": "Author", "es": "Autor" },
  "year": 2023,
  "status": "live",
  "featured": false,
  "order": 3,
  "tech": [
    { "_type": "reference", "_ref": "seed-skill-adobe-target" },
    { "_type": "reference", "_ref": "seed-skill-javascript" }
  ]
}
```

### Step 2: Write `sanity/seed/seed.sh`

```bash
#!/usr/bin/env bash
# Merge all NDJSON seed files and import into Sanity.
# Usage: bash sanity/seed/seed.sh [dataset]
# Default dataset: production

set -euo pipefail

DATASET="${1:-production}"
SEED_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MERGED="$SEED_DIR/merged-seed.ndjson"

echo "Merging seed files..."
cat \
  "$SEED_DIR/04-skills.ndjson" \
  "$SEED_DIR/01-site-settings.ndjson" \
  "$SEED_DIR/02-about.ndjson" \
  "$SEED_DIR/03-experience.ndjson" \
  "$SEED_DIR/05-certifications.ndjson" \
  "$SEED_DIR/05-education.ndjson" \
  "$SEED_DIR/05-languages.ndjson" \
  "$SEED_DIR/06-strengths.ndjson" \
  "$SEED_DIR/07-projects.ndjson" \
  > "$MERGED"

echo "Importing into dataset: $DATASET"
npx sanity dataset import "$MERGED" "$DATASET" --replace

echo "Cleaning up merged file..."
rm "$MERGED"

echo "Done. Open Sanity Studio to verify."
```

Note: Skills (`04-skills.ndjson`) must be first in the merge so references resolve during import.

## Todo List

- [ ] Write `sanity/seed/07-projects.ndjson` (3 documents)
- [ ] Write `sanity/seed/seed.sh` and `chmod +x` it
- [ ] Run `bash sanity/seed/seed.sh` from project root
- [ ] Verify all documents appear in Studio with no broken references

## Success Criteria

- [ ] 3 project documents created
- [ ] `emudev.cc` project: `featured: true`, `status: live`, `liveUrl` set
- [ ] Tech references resolve (skills imported first)
- [ ] `seed.sh` runs end-to-end without errors
- [ ] All 9 content types populated in Sanity Studio
