---
phase: 3
title: "Experience documents"
status: pending
priority: P1
effort: "1h"
dependencies: [4]
---

# Phase 3: Experience documents

## Overview

Create one `experience` document per role from the CV. Phase 4 (skills) must run first because experience documents reference skill `_id` values via `tech[]`.

## Related Code Files

- Create: `sanity/seed/03-experience.ndjson`

## Implementation Steps

### Step 1: Write `sanity/seed/03-experience.ndjson`

One JSON object per line. Ordered newest-first (order: 1 = current).

```json
{
  "_id": "seed-exp-accenture-2022",
  "_type": "experience",
  "role": { "en": "Adobe Analytics & Target Architect", "es": "Arquitecto de Adobe Analytics y Target" },
  "company": "Accenture",
  "companyUrl": "https://www.accenture.com",
  "location": "Remote — Costa Rica",
  "employmentType": "full-time",
  "startDate": "2022-01-01",
  "order": 1,
  "clients": ["Volkswagen", "Qurate Retail Group", "Disney", "Adobe"],
  "summary": {
    "en": [{ "_type": "block", "_key": "exp-acc-en-1", "style": "normal", "children": [{ "_type": "span", "_key": "s1", "text": "Lead analytics architect on Accenture's digital experience practice. Design and implement end-to-end Adobe Analytics and Adobe Target solutions for enterprise clients, from data-layer architecture to A/B test strategy." }] }],
    "es": [{ "_type": "block", "_key": "exp-acc-es-1", "style": "normal", "children": [{ "_type": "span", "_key": "s2", "text": "Arquitecto líder de analítica en la práctica de experiencia digital de Accenture. Diseño e implemento soluciones completas de Adobe Analytics y Adobe Target para clientes empresariales, desde la arquitectura de capa de datos hasta la estrategia de pruebas A/B." }] }]
  },
  "highlights": {
    "en": [
      { "_key": "h1", "value": "Led analytics architecture for Volkswagen's global digital channels (2025)." },
      { "_key": "h2", "value": "Delivered Adobe Target personalisation programs for Qurate Retail Group driving measurable lift in conversion." },
      { "_key": "h3", "value": "Defined tagging standards and data-layer governance frameworks adopted across client portfolios." },
      { "_key": "h4", "value": "Mentored junior analysts and client-side teams on Adobe suite best practices." }
    ],
    "es": [
      { "_key": "h5", "value": "Lideré la arquitectura de analítica para los canales digitales globales de Volkswagen (2025)." },
      { "_key": "h6", "value": "Entregué programas de personalización con Adobe Target para Qurate Retail Group, generando incremento medible en conversión." },
      { "_key": "h7", "value": "Definí estándares de tagging y marcos de gobernanza de capa de datos adoptados en todo el portafolio de clientes." },
      { "_key": "h8", "value": "Mentoreé a analistas junior y equipos del lado del cliente en las mejores prácticas del suite de Adobe." }
    ]
  },
  "tech": [
    { "_type": "reference", "_ref": "seed-skill-adobe-analytics" },
    { "_type": "reference", "_ref": "seed-skill-adobe-target" },
    { "_type": "reference", "_ref": "seed-skill-javascript" },
    { "_type": "reference", "_ref": "seed-skill-react" }
  ]
}
{
  "_id": "seed-exp-avventa-2018",
  "_type": "experience",
  "role": { "en": "Senior Digital Analytics Engineer", "es": "Ingeniero Senior de Analítica Digital" },
  "company": "avVenta Worldwide",
  "location": "Remote — Costa Rica",
  "employmentType": "contract",
  "startDate": "2018-01-01",
  "endDate": "2021-12-31",
  "order": 2,
  "clients": ["Verizon", "PG", "Biogen", "Boehringer Ingelheim"],
  "summary": {
    "en": [{ "_type": "block", "_key": "exp-av-en-1", "style": "normal", "children": [{ "_type": "span", "_key": "s3", "text": "Designed and deployed Adobe Analytics implementations for Fortune 500 clients. 4-year Verizon engagement as primary analytics engineer, owning the full measurement stack across consumer and enterprise web properties." }] }],
    "es": [{ "_type": "block", "_key": "exp-av-es-1", "style": "normal", "children": [{ "_type": "span", "_key": "s4", "text": "Diseñé y desplegué implementaciones de Adobe Analytics para clientes del Fortune 500. Compromiso de 4 años con Verizon como ingeniero principal de analítica, siendo responsable del stack completo de medición en propiedades web de consumidores y empresas." }] }]
  },
  "highlights": {
    "en": [
      { "_key": "h9",  "value": "Primary analytics engineer for Verizon consumer & enterprise properties for 4 years." },
      { "_key": "h10", "value": "Implemented HIPAA-compliant analytics for Biogen and Boehringer Ingelheim pharmaceutical sites." },
      { "_key": "h11", "value": "Built reusable Launch (Adobe Experience Platform Tags) rule libraries used across 10+ properties." }
    ],
    "es": [
      { "_key": "h12", "value": "Ingeniero principal de analítica para propiedades de consumidores y empresas de Verizon durante 4 años." },
      { "_key": "h13", "value": "Implementé analítica con cumplimiento HIPAA para sitios farmacéuticos de Biogen y Boehringer Ingelheim." },
      { "_key": "h14", "value": "Construí bibliotecas de reglas reutilizables de Launch (Adobe Experience Platform Tags) usadas en más de 10 propiedades." }
    ]
  },
  "tech": [
    { "_type": "reference", "_ref": "seed-skill-adobe-analytics" },
    { "_type": "reference", "_ref": "seed-skill-adobe-target" },
    { "_type": "reference", "_ref": "seed-skill-javascript" }
  ]
}
{
  "_id": "seed-exp-catie-2014",
  "_type": "experience",
  "role": { "en": "Web Developer & UI Engineer", "es": "Desarrollador Web e Ingeniero UI" },
  "company": "CATIE",
  "companyUrl": "https://www.catie.ac.cr",
  "location": "Turrialba, Costa Rica",
  "employmentType": "full-time",
  "startDate": "2014-01-01",
  "endDate": "2017-12-31",
  "order": 3,
  "summary": {
    "en": [{ "_type": "block", "_key": "exp-ca-en-1", "style": "normal", "children": [{ "_type": "span", "_key": "s5", "text": "Built and maintained web applications and microsites for a leading tropical agriculture research center in Latin America. Full ownership of frontend and CMS implementations using Drupal." }] }],
    "es": [{ "_type": "block", "_key": "exp-ca-es-1", "style": "normal", "children": [{ "_type": "span", "_key": "s6", "text": "Construí y mantuve aplicaciones web y micrositios para un centro líder de investigación en agricultura tropical en América Latina. Responsabilidad total del frontend e implementaciones de CMS usando Drupal." }] }]
  },
  "highlights": {
    "en": [
      { "_key": "h15", "value": "Developed and maintained multiple institutional websites and research portals." },
      { "_key": "h16", "value": "Implemented Drupal CMS for content management across bilingual (ES/EN) sites." },
      { "_key": "h17", "value": "Built custom JS/CSS components and interactive data visualisations for research reports." }
    ],
    "es": [
      { "_key": "h18", "value": "Desarrollé y mantuve múltiples sitios web institucionales y portales de investigación." },
      { "_key": "h19", "value": "Implementé Drupal CMS para la gestión de contenidos en sitios bilingües (ES/EN)." },
      { "_key": "h20", "value": "Construí componentes personalizados de JS/CSS y visualizaciones de datos interactivas para informes de investigación." }
    ]
  },
  "tech": [
    { "_type": "reference", "_ref": "seed-skill-javascript" },
    { "_type": "reference", "_ref": "seed-skill-html-css" },
    { "_type": "reference", "_ref": "seed-skill-drupal" }
  ]
}
{
  "_id": "seed-exp-agencies-2005",
  "_type": "experience",
  "role": { "en": "Frontend Developer & Web Designer", "es": "Desarrollador Frontend y Diseñador Web" },
  "company": "Various Digital Agencies",
  "location": "San José, Costa Rica",
  "employmentType": "freelance",
  "startDate": "2005-01-01",
  "endDate": "2013-12-31",
  "order": 4,
  "summary": {
    "en": [{ "_type": "block", "_key": "exp-ag-en-1", "style": "normal", "children": [{ "_type": "span", "_key": "s7", "text": "Freelance and agency work spanning frontend development, web design, and digital marketing for local and regional brands. This is where I developed the designer-developer hybrid instinct I still rely on today." }] }],
    "es": [{ "_type": "block", "_key": "exp-ag-es-1", "style": "normal", "children": [{ "_type": "span", "_key": "s8", "text": "Trabajo freelance y en agencias abarcando desarrollo frontend, diseño web y marketing digital para marcas locales y regionales. Aquí desarrollé el instinto híbrido diseñador-desarrollador en el que aún me apoyo hoy." }] }]
  },
  "highlights": {
    "en": [
      { "_key": "h21", "value": "Designed and built websites, banners, and email campaigns for advertising agencies." },
      { "_key": "h22", "value": "Graphic Design background (COVAO) informed strong visual sensibility applied to UI work." },
      { "_key": "h23", "value": "Early adopter of CSS3, HTML5, and responsive design patterns." }
    ],
    "es": [
      { "_key": "h24", "value": "Diseñé y construí sitios web, banners y campañas de correo para agencias de publicidad." },
      { "_key": "h25", "value": "La formación en Diseño Gráfico (COVAO) aportó una fuerte sensibilidad visual aplicada al trabajo de UI." },
      { "_key": "h26", "value": "Adopté tempranamente CSS3, HTML5 y patrones de diseño responsivo." }
    ]
  },
  "tech": [
    { "_type": "reference", "_ref": "seed-skill-javascript" },
    { "_type": "reference", "_ref": "seed-skill-html-css" }
  ]
}
```

## Todo List

- [ ] Write `sanity/seed/03-experience.ndjson` (4 documents)
- [ ] Confirm skill `_ref` IDs match those created in phase 4
- [ ] Verify all 4 experience docs appear in Studio ordered correctly

## Success Criteria

- [ ] 4 experience documents created, ordered 1–4
- [ ] Current role (Accenture) shows no `endDate`
- [ ] `clients` arrays populated for Accenture and avVenta entries
- [ ] Tech references resolve (no broken refs after skills import)
