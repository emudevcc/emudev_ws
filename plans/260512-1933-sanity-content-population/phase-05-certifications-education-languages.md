---
phase: 5
title: "Certifications, Education & Languages"
status: pending
priority: P2
effort: "30m"
dependencies: [4]
---

# Phase 5: Certifications, Education & Languages

## Overview

Create `certification`, `education`, and `language` documents from CV data. Certifications reference skill documents from phase 4.

## Related Code Files

- Create: `sanity/seed/05-certifications.ndjson`
- Create: `sanity/seed/05-education.ndjson`
- Create: `sanity/seed/05-languages.ndjson`

## Implementation Steps

### Step 1: Write `sanity/seed/05-certifications.ndjson`

```json
{
  "_id": "seed-cert-aa-architect",
  "_type": "certification",
  "name": "Adobe Analytics Architect Master",
  "issuer": "Adobe",
  "issueDate": "2021-01-01",
  "skills": [
    { "_type": "reference", "_ref": "seed-skill-adobe-analytics" }
  ]
}
{
  "_id": "seed-cert-aa-expert",
  "_type": "certification",
  "name": "Adobe Analytics Business Practitioner Expert",
  "issuer": "Adobe",
  "issueDate": "2020-01-01",
  "skills": [
    { "_type": "reference", "_ref": "seed-skill-adobe-analytics" }
  ]
}
{
  "_id": "seed-cert-target-expert",
  "_type": "certification",
  "name": "Adobe Target Business Practitioner Expert",
  "issuer": "Adobe",
  "issueDate": "2020-06-01",
  "skills": [
    { "_type": "reference", "_ref": "seed-skill-adobe-target" }
  ]
}
```

### Step 2: Write `sanity/seed/05-education.ndjson`

```json
{
  "_id": "seed-edu-u-latina",
  "_type": "education",
  "institution": "Universidad Latina de Costa Rica",
  "degree": { "en": "Computer Science (incomplete — 50 credits)", "es": "Ciencias de la Computación (incompleta — 50 créditos)" },
  "field": { "en": "Computer Science", "es": "Ciencias de la Computación" },
  "startYear": 2004,
  "endYear": 2007,
  "location": "San José, Costa Rica",
  "notes": {
    "en": "Completed 50 credits before transitioning to full-time professional practice. Foundational coursework in algorithms, data structures, and systems.",
    "es": "Completé 50 créditos antes de pasar a la práctica profesional de tiempo completo. Cursos fundamentales en algoritmos, estructuras de datos y sistemas."
  }
}
{
  "_id": "seed-edu-covao",
  "_type": "education",
  "institution": "COVAO",
  "degree": { "en": "Graphic Design Technician", "es": "Técnico en Diseño Gráfico" },
  "field": { "en": "Graphic Design", "es": "Diseño Gráfico" },
  "startYear": 2001,
  "endYear": 2003,
  "location": "Cartago, Costa Rica",
  "notes": {
    "en": "Visual communication, typography, layout, and print production. This background directly informs the design sensibility I apply to UI and product work.",
    "es": "Comunicación visual, tipografía, maquetación y producción gráfica. Esta formación influye directamente en la sensibilidad de diseño que aplico al trabajo de UI y producto."
  }
}
```

### Step 3: Write `sanity/seed/05-languages.ndjson`

```json
{ "_id": "seed-lang-es", "_type": "language", "name": "Spanish", "code": "es", "proficiency": "native", "cefr": "C2" }
{ "_id": "seed-lang-en", "_type": "language", "name": "English", "code": "en", "proficiency": "professional", "cefr": "C1" }
{ "_id": "seed-lang-pt", "_type": "language", "name": "Portuguese", "code": "pt", "proficiency": "basic", "cefr": "A2" }
```

## Todo List

- [ ] Write `sanity/seed/05-certifications.ndjson` (3 documents)
- [ ] Write `sanity/seed/05-education.ndjson` (2 documents)
- [ ] Write `sanity/seed/05-languages.ndjson` (3 documents)
- [ ] Confirm cert skill `_ref` IDs match phase 4 values

## Success Criteria

- [ ] 3 certifications, all issued by Adobe
- [ ] 2 education entries: U Latina CS + COVAO Graphic Design
- [ ] 3 languages: Spanish (native), English (professional/C1), Portuguese (basic/A2)
