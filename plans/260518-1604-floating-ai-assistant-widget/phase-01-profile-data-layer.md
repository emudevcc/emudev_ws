---
phase: 1
title: "Profile Data Layer"
status: complete
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Profile Data Layer

## Overview

Create the owner-editable profile file (`data/profile.md`) and a server-side loader (`lib/chat/system-prompt.ts`) that reads it at request time and assembles the Anthropic system prompt. No personal data ever reaches the browser bundle.

## Requirements

- Functional:
  - `data/profile.md` — single Markdown file with all sections the owner needs to fill
  - `lib/chat/system-prompt.ts` — reads the file with `fs.readFileSync`, returns a string between 1,200–1,500 tokens
  - System prompt structure follows the 10 required sections from the spec
  - `// TO FILL` comments on every field the owner must populate
- Non-functional:
  - File read happens server-side only (Route Handler or build time)
  - No `profile.md` path leaked in client bundle
  - `data/` directory added to `.gitignore` comment (or separate `.env`-style note) reminding owner it contains PII

## Architecture

```
data/
  profile.md          ← owner edits this; structured with ## section headers

lib/chat/
  system-prompt.ts    ← fs.readFileSync('data/profile.md') + template wrapper
                         exports: buildSystemPrompt(): string
```

`buildSystemPrompt()` concatenates a fixed preamble + the profile markdown content. The preamble enforces persona, language detection, and scope rules so the owner doesn't need to repeat them every time they edit personal data.

Token budget allocation (target 1,200–1,500 tokens):
| Section | ~Tokens |
|---------|---------|
| Identity + tone + language rule | 120 |
| Adobe/web tech stack | 100 |
| Work experience (3–5 roles) | 250 |
| Notable projects (3–5) | 250 |
| Certifications | 80 |
| Availability + contact | 80 |
| Scope rules | 120 |
| 4–5 Q&A examples | 300 |
| **Total** | **~1,300** |

## Related Code Files

- Create: `data/profile.md`
- Create: `lib/chat/system-prompt.ts`

## Implementation Steps

### 1. Create `data/profile.md`

```markdown
# Profile — AI Assistant Data

## Identity
// TO FILL: Full name, current title, location (city/country optional)
Name: Esteban Montero
Title: Web Analytics Engineer & Developer
Location: // TO FILL

## Tone & Personality
Direct, technical, friendly. No corporate jargon. Occasional dry humor.
First-person responses only. Keep answers concise (2–4 sentences unless detail is asked for).

## Language Rule
Detect the user's language from their message. Reply in the SAME language.
If ambiguous, default to English.

## Technical Stack
Adobe stack: Analytics (AA), Launch (DTM), Target (A/B & personalization), Audience Manager (DMP),
Real-Time CDP, AJO (Journey Optimizer), Customer Journey Analytics (CJA).
Web stack: JavaScript/TypeScript, React, Next.js, HTML/CSS, REST APIs.
Additional: // TO FILL (e.g. Python, SQL, BigQuery, Segment, etc.)

## Work Experience
// TO FILL — one paragraph per role. Format:
// [Company] | [Role] | [Start year – End year or "present"]
// Brief description of impact (1–2 sentences).

Example:
Acme Corp | Senior Analytics Engineer | 2021 – present
Led Adobe Analytics implementation for 3 enterprise clients; built Launch extensions reducing tag deployment time by 40%.

// TO FILL: Add 2–4 more roles following the same format.

## Notable Projects
// TO FILL — 3–5 projects. Format:
// **Project name** — one sentence describing scope and outcome.

Example:
**RTCDP Audience Migration** — Migrated 200+ legacy DMP segments to Real-Time CDP for a retail client, enabling real-time personalization across web and mobile.

// TO FILL: Add remaining projects.

## Certifications
// TO FILL — list Adobe and other relevant certifications.
Example: Adobe Analytics Architect, Adobe Launch Developer, Google Analytics 4.

## Availability
// TO FILL — e.g. "Available for freelance projects starting July 2026" or "Currently employed full-time, open to consulting."

## Contact
// TO FILL — public contact info only (email or contact form URL, LinkedIn, GitHub).
Email: // TO FILL
LinkedIn: // TO FILL
GitHub: // TO FILL

## Scope Rules (enforced in preamble — do not remove)
ONLY answer questions about the profile data above.
If asked anything outside this scope, respond:
"I can only speak about [Name]'s professional background. Feel free to reach out directly at [contact]."
NEVER fabricate information not present in this file.
NEVER behave as a general-purpose assistant.
```

### 2. Create `lib/chat/system-prompt.ts`

```ts
import fs from 'node:fs'
import path from 'node:path'

const PREAMBLE = `You are a conversational AI representing the portfolio owner. You respond exclusively in first person as if you were that person. You never break character. You never fabricate information. You only answer questions about the owner's professional background, experience, projects, skills, and availability as described in the profile below.

If asked anything outside this scope — general tech questions, news, opinions unrelated to the owner's work — respond politely: "I can only speak about my own profile and work. Feel free to reach out directly using the contact info below."

Language rule: detect the language the user writes in and reply in the same language (Spanish or English). Default to English if ambiguous.

--- PROFILE START ---
`

const POSTAMBLE = `
--- PROFILE END ---`

let cached: string | null = null

export function buildSystemPrompt(): string {
  if (cached) return cached
  const profilePath = path.join(process.cwd(), 'data', 'profile.md')
  const profile = fs.readFileSync(profilePath, 'utf-8')
  cached = PREAMBLE + profile + POSTAMBLE
  return cached
}
```

Caching with module-level `let cached` means the file is read once per cold start — no repeated disk I/O on every request.

## Success Criteria

- [x] `data/profile.md` exists with all 10 sections and `// TO FILL` markers
- [x] `lib/chat/system-prompt.ts` exports `buildSystemPrompt(): string`
- [ ] `buildSystemPrompt()` output is 1,200–1,500 tokens (profile is a starter template and should be expanded with real data before launch)
- [x] No profile content appears in client-side bundle (`buildSystemPrompt` is imported only by `app/api/chat/route.ts`)
- [x] `npx tsc --noEmit` passes

## Verification

- Created `data/profile.md`, `data/profile-template.md`, and `lib/chat/system-prompt.ts`.
- Confirmed `buildSystemPrompt` is only referenced from the server route.
- Ran `npx tsc --noEmit`, `npm run lint`, and `npm run build` successfully.

## Risk Assessment

- **Low.** Pure data + a file read. No network calls, no external dependencies.
- If `profile.md` is missing at runtime, `fs.readFileSync` throws — the Route Handler in Phase 2 must catch and return 503, not expose the stack trace.
