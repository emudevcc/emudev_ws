---
phase: 1
title: "Foundation and Design Tokens"
status: completed
priority: P1
effort: "3h"
dependencies: []
---

# Phase 1: Foundation and Design Tokens

## Overview

Expand `messages/en.json` and `messages/es.json` with all i18n keys needed by the new home page sections. Create `lib/github.ts` for the contributions API. No UI components yet — this is the data foundation.

## Requirements

**Functional:**
- All new i18n message keys present in both `en.json` and `es.json`
- Message key parity maintained (CI smoke test in `tests/smoke/i18n-bilingual.spec.ts` must pass)
- `lib/github.ts` exports `getContributions(year?: number)` returning GitHub contribution data

**Non-functional:**
- Messages follow existing namespace pattern (e.g. `hero.greeting`, `about.title`)
- `lib/github.ts` uses fetch with proper error handling; no build-time dependency

## Related Code Files

- Modify: `messages/en.json`
- Modify: `messages/es.json`
- Create: `lib/github.ts`

## Implementation Steps

### Step 1: Expand i18n messages

Add these namespaces/keys to both `en.json` and `es.json` (translate `es` values):

```json
{
  "hero": {
    "greeting": "Hi, I'm",
    "ctaContact": "Let's talk",
    "ctaSchedule": "Schedule a call",
    "ctaResume": "Download CV",
    "statYearsExp": "Years experience",
    "statProjects": "Projects shipped",
    "statCertifications": "Certifications",
    "statLanguages": "Languages"
  },
  "about": {
    "eyebrow": "01 — about",
    "title": "About me"
  },
  "experience": {
    "eyebrow": "02 — experience",
    "title": "Work history",
    "present": "Present"
  },
  "projects": {
    "eyebrow": "03 — projects",
    "title": "Selected work"
  },
  "skills": {
    "eyebrow": "04 — skills",
    "title": "Tech stack",
    "categoryPlatform": "Platform",
    "categoryLanguage": "Languages",
    "categoryFramework": "Frameworks",
    "categoryTool": "Tools & Data"
  },
  "contributions": {
    "eyebrow": "05 — open source",
    "title": "Contributions",
    "lastYear": "Last year"
  },
  "social": {
    "eyebrow": "06 — social",
    "title": "Latest posts"
  },
  "credentials": {
    "eyebrow": "07 — credentials",
    "certifications": "Certifications",
    "education": "Education",
    "languages": "Languages",
    "proficiencyNative": "Native",
    "proficiencyFluent": "Fluent",
    "proficiencyAdvanced": "Advanced",
    "proficiencyIntermediate": "Intermediate",
    "proficiencyBasic": "Basic"
  },
  "strengths": {
    "eyebrow": "08 — strengths",
    "title": "CliftonStrengths"
  },
  "writing": {
    "eyebrow": "09 — writing",
    "title": "Blog posts",
    "readMin": "min read"
  },
  "contactHome": {
    "eyebrow": "10 — contact",
    "title": "Let's work together",
    "subtitle": "Have a project in mind? Drop me a message.",
    "fieldName": "Name",
    "fieldEmail": "Email",
    "fieldCompany": "Company / Role",
    "fieldOppType": "Opportunity type",
    "fieldBudget": "Budget range",
    "fieldTimeline": "Timeline",
    "fieldMessage": "Message",
    "fieldFoundVia": "How did you find me?",
    "oppFulltime": "Full-time role",
    "oppFreelance": "Freelance project",
    "oppConsulting": "Consulting",
    "oppOther": "Other",
    "budgetSub5k": "Under $5k",
    "budget5to20k": "$5k – $20k",
    "budget20kPlus": "$20k+",
    "budgetNA": "Not applicable",
    "timelineAsap": "ASAP",
    "timeline1to3": "1 – 3 months",
    "timeline3to6": "3 – 6 months",
    "timelineFlexible": "Flexible",
    "foundGoogle": "Google",
    "foundGitHub": "GitHub",
    "foundLinkedIn": "LinkedIn",
    "foundReferral": "Referral",
    "foundOther": "Other",
    "submit": "Send message",
    "sending": "Sending…",
    "sent": "Message sent! I'll get back to you soon.",
    "basedIn": "Based in"
  },
  "footer": {
    "built": "Built with care ·"
  }
}
```

**Spanish translations** (`es.json`): translate all values above. Maintain exact same key structure.

### Step 2: Create `lib/github.ts`

```typescript
export type ContributionDay = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export type ContributionWeek = {
  days: ContributionDay[]
}

export type GitHubContributions = {
  totalContributions: number
  weeks: ContributionWeek[]
}

export async function getContributions(year?: number): Promise<GitHubContributions | null> {
  try {
    const url = year
      ? `/api/github/contributions?year=${year}`
      : `/api/github/contributions`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
```

> Note: `getContributions` is a client-callable helper. The actual GitHub API call lives in `app/api/github/contributions/route.ts` (Phase 5).

### Step 3: Verify i18n parity

```bash
npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list
```

All key parity tests must pass after adding new keys to both locales.

## Todo List

- [x] Add all new namespaces to `messages/en.json`
- [x] Add matching Spanish translations to `messages/es.json`
- [x] Create `lib/github.ts` with `getContributions` + types
- [x] i18n smoke test passes

## Success Criteria

- [x] `messages/en.json` and `messages/es.json` have identical key sets
- [x] All new keys: `hero.*`, `about.*`, `experience.*`, `projects.*`, `skills.*`, `contributions.*`, `social.*`, `credentials.*`, `strengths.*`, `writing.*`, `contactHome.*`, `footer.*`
- [x] `lib/github.ts` compiles, exports `GitHubContributions` type + `getContributions`
- [x] i18n smoke test: zero regressions

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Missing Spanish translation key breaks parity test | Medium | Low | Copy en keys first, then translate; run smoke test before finalizing |
| `contactHome` namespace conflicts with existing `contact` | Very Low | Low | Different namespace name; existing contact page uses `contact.*` unchanged |
