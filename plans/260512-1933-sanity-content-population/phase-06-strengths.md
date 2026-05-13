---
phase: 6
title: "Strengths (CliftonStrengths)"
status: completed
priority: P2
effort: "20m"
dependencies: []
---

# Phase 6: Strengths (CliftonStrengths)

## Overview

Create 5 `strength` documents — one per CliftonStrengths top-5 talent from the CV. Each gets a bilingual description written in a conversational first-person voice explaining how the strength shows up in Esteban's work.

## Related Code Files

- Create: `sanity/seed/06-strengths.ndjson`

## Implementation Steps

### Step 1: Write `sanity/seed/06-strengths.ndjson`

CliftonStrengths domains: Input & Ideation → Strategic Thinking; Self-Assurance & Maximizer → Influencing; Adaptability → Relationship Building.

```json
{
  "_id": "seed-strength-input",
  "_type": "strength",
  "name": "Input",
  "rank": 1,
  "domain": "strategic-thinking",
  "description": {
    "en": [{ "_type": "block", "_key": "str-in-en", "style": "normal", "children": [{ "_type": "span", "_key": "s1", "text": "I'm a collector — of ideas, links, tools, and mental models. I read broadly across engineering, design, psychology, and business, and I'm genuinely excited when something from one field turns out to be the perfect solution for a problem in another. My Notion is a beautiful mess; my teammates benefit from it." }] }],
    "es": [{ "_type": "block", "_key": "str-in-es", "style": "normal", "children": [{ "_type": "span", "_key": "s2", "text": "Soy coleccionista — de ideas, enlaces, herramientas y modelos mentales. Leo ampliamente en ingeniería, diseño, psicología y negocios, y me emociono genuinamente cuando algo de un campo resulta ser la solución perfecta para un problema en otro. Mi Notion es un caos hermoso; mis compañeros se benefician de ello." }] }]
  }
}
{
  "_id": "seed-strength-self-assurance",
  "_type": "strength",
  "name": "Self-Assurance",
  "rank": 2,
  "domain": "influencing",
  "description": {
    "en": [{ "_type": "block", "_key": "str-sa-en", "style": "normal", "children": [{ "_type": "span", "_key": "s3", "text": "I trust my own judgment, especially when the path forward isn't obvious. In fast-moving client engagements where there's ambiguity and competing opinions, I can make a call, commit to it, and bring others along — not from stubbornness, but from a genuine confidence built on 19+ years of doing the work." }] }],
    "es": [{ "_type": "block", "_key": "str-sa-es", "style": "normal", "children": [{ "_type": "span", "_key": "s4", "text": "Confío en mi propio juicio, especialmente cuando el camino a seguir no es obvio. En compromisos con clientes de ritmo rápido donde hay ambigüedad y opiniones encontradas, puedo tomar una decisión, comprometerme con ella y llevar a otros — no por terquedad, sino por una confianza genuina construida sobre más de 19 años de hacer el trabajo." }] }]
  }
}
{
  "_id": "seed-strength-maximizer",
  "_type": "strength",
  "name": "Maximizer",
  "rank": 3,
  "domain": "influencing",
  "description": {
    "en": [{ "_type": "block", "_key": "str-mx-en", "style": "normal", "children": [{ "_type": "span", "_key": "s5", "text": "I'm not interested in fixing what's broken — I'm interested in taking what's already good and making it excellent. Whether that's a data layer spec, a React component, or a client's analytics program, I'm drawn to the question: what would this look like if it were really done right?" }] }],
    "es": [{ "_type": "block", "_key": "str-mx-es", "style": "normal", "children": [{ "_type": "span", "_key": "s6", "text": "No me interesa arreglar lo que está roto — me interesa tomar lo que ya es bueno y hacerlo excelente. Ya sea una especificación de capa de datos, un componente React o el programa de analítica de un cliente, me atrae la pregunta: ¿cómo se vería esto si realmente se hiciera bien?" }] }]
  }
}
{
  "_id": "seed-strength-ideation",
  "_type": "strength",
  "name": "Ideation",
  "rank": 4,
  "domain": "strategic-thinking",
  "description": {
    "en": [{ "_type": "block", "_key": "str-id-en", "style": "normal", "children": [{ "_type": "span", "_key": "s7", "text": "I love the moment when a new idea clicks into place — especially the unexpected ones that connect things people assumed were unrelated. In meetings I'm often the person asking \"what if we approached this completely differently?\" Sometimes that's annoying. Usually it leads somewhere good." }] }],
    "es": [{ "_type": "block", "_key": "str-id-es", "style": "normal", "children": [{ "_type": "span", "_key": "s8", "text": "Me encanta el momento en que una nueva idea encaja — especialmente las inesperadas que conectan cosas que la gente asumía que no estaban relacionadas. En reuniones, a menudo soy quien pregunta '¿y si enfocáramos esto de manera completamente diferente?' A veces eso es molesto. Usualmente lleva a algo bueno." }] }]
  }
}
{
  "_id": "seed-strength-adaptability",
  "_type": "strength",
  "name": "Adaptability",
  "rank": 5,
  "domain": "relationship-building",
  "description": {
    "en": [{ "_type": "block", "_key": "str-ad-en", "style": "normal", "children": [{ "_type": "span", "_key": "s9", "text": "I live in the present and respond to what's in front of me. In consulting that means I'm rarely thrown off by scope changes, shifting priorities, or clients who change their minds on Friday afternoon. I don't just tolerate ambiguity — I actually do my best work in it." }] }],
    "es": [{ "_type": "block", "_key": "str-ad-es", "style": "normal", "children": [{ "_type": "span", "_key": "s10", "text": "Vivo en el presente y respondo a lo que tengo enfrente. En consultoría eso significa que rara vez me desestabiliza un cambio de alcance, prioridades cambiantes o clientes que cambian de opinión el viernes por la tarde. No solo tolero la ambigüedad — en realidad hago mi mejor trabajo en ella." }] }]
  }
}
```

## Todo List

- [x] Write `sanity/seed/06-strengths.ndjson` (5 documents)
- [x] Verify ranks 1–5 are all assigned

## Success Criteria

- [x] 5 strength documents, ranked 1–5
- [x] All have bilingual `description` in portable-text format
- [x] Domains: Input (strategic-thinking), Self-Assurance (influencing), Maximizer (influencing), Ideation (strategic-thinking), Adaptability (relationship-building)
