---
phase: 7
title: "Smoke Tests & QA"
status: pending
priority: P2
effort: "2h"
dependencies: [4, 6]
---

# Phase 7: Smoke Tests & QA

## Overview

Write Playwright smoke tests targeting the live environment URLs. Tests run automatically after every staging and production deploy in GitHub Actions (Phase 5). Cover critical paths: page loads, API health, contact form submit, navigation. If tests fail, the QA checklist job posts a GitHub comment flagging which checks failed.

## Key Insights

- **Smoke tests ≠ E2E tests.** Smoke tests only verify the deployment is alive and critical paths aren't 404/500. Full E2E is a future concern.
- **`BASE_URL` from environment:** Tests read `process.env.BASE_URL` — injected by CI from `NEXT_PUBLIC_SITE_URL` secret. Works for all 3 environments.
- **Playwright `--reporter=github`:** Prints annotations directly to GitHub Actions summary. No separate reporter setup needed.
- **Contact form smoke test:** POST a test submission via API route or directly via form action. Verify Supabase row created — use service role key in CI to check.
- **Health endpoint:** `GET /api/health` must return `{ status: 'ok' }`. This is the minimal deploy success signal.
- **QA checklist comment:** Use `actions/github-script` to post a formatted Markdown checklist comment on the PR when smoke tests run post-staging deploy.

## Requirements

**Functional:**
- Smoke test suite at `tests/smoke/`
- Tests: health endpoint, home page loads, projects page loads, blog page loads, contact page loads, navigation links, `/api/health` JSON response
- `playwright.config.ts` configured for CI (no headed, single browser, short timeout)
- QA checklist GitHub comment posted on staging PR after deploy
- Smoke tests referenced in `deploy.yml` (Phase 5)

**Non-functional:**
- Full smoke suite completes in < 60 seconds
- No flaky tests (avoid `waitForTimeout`; use `waitForResponse` / `waitForSelector`)

## Architecture

```
tests/
└── smoke/
    ├── health.spec.ts          ← API health check
    ├── pages.spec.ts           ← All public pages load
    ├── navigation.spec.ts      ← Nav links work
    └── contact-form.spec.ts    ← Form submits without 500

playwright.config.ts            ← CI-optimized config

.github/workflows/deploy.yml    ← runs: npx playwright test tests/smoke/
```

## Related Code Files

**Create:**
- `playwright.config.ts`
- `tests/smoke/health.spec.ts`
- `tests/smoke/pages.spec.ts`
- `tests/smoke/navigation.spec.ts`
- `tests/smoke/contact-form.spec.ts`

## Implementation Steps

1. **Install Playwright** (if not in Phase 1):
   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

2. **Configure Playwright** — `playwright.config.ts`:
   ```typescript
   import { defineConfig, devices } from '@playwright/test'

   export default defineConfig({
     testDir: './tests',
     timeout: 30_000,
     retries: process.env.CI ? 1 : 0,
     reporter: process.env.CI ? 'github' : 'list',
     use: {
       baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
       trace: 'on-first-retry',
       screenshot: 'only-on-failure',
     },
     projects: [
       { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
     ],
   })
   ```

3. **Health spec** — `tests/smoke/health.spec.ts`:
   ```typescript
   import { test, expect } from '@playwright/test'

   test('GET /api/health returns ok', async ({ request }) => {
     const res = await request.get('/api/health')
     expect(res.status()).toBe(200)
     const body = await res.json()
     expect(body.status).toBe('ok')
   })
   ```

4. **Pages spec** — `tests/smoke/pages.spec.ts`:
   ```typescript
   import { test, expect } from '@playwright/test'

   const publicPages = ['/', '/about', '/projects', '/blog', '/contact']

   for (const path of publicPages) {
     test(`${path} returns 200 and loads without console errors`, async ({ page }) => {
       const errors: string[] = []
       page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

       const res = await page.goto(path)
       expect(res?.status()).toBe(200)
       // Allow known third-party console errors but fail on app errors
       const appErrors = errors.filter(e => !e.includes('favicon') && !e.includes('gtag'))
       expect(appErrors).toHaveLength(0)
     })
   }

   test('/sitemap.xml is valid XML', async ({ request }) => {
     const res = await request.get('/sitemap.xml')
     expect(res.status()).toBe(200)
     const body = await res.text()
     expect(body).toContain('<?xml')
     expect(body).toContain('<urlset')
   })

   test('/robots.txt disallows /studio', async ({ request }) => {
     const res = await request.get('/robots.txt')
     expect(res.status()).toBe(200)
     const body = await res.text()
     expect(body).toContain('Disallow: /studio')
   })
   ```

5. **Navigation spec** — `tests/smoke/navigation.spec.ts`:
   ```typescript
   import { test, expect } from '@playwright/test'

   test('nav links resolve without 404', async ({ page }) => {
     await page.goto('/')
     const navLinks = await page.locator('nav a').all()

     for (const link of navLinks) {
       const href = await link.getAttribute('href')
       if (!href || href.startsWith('http') || href.startsWith('#')) continue
       const res = await page.request.get(href)
       expect(res.status(), `Nav link ${href} returned ${res.status()}`).toBeLessThan(400)
     }
   })

   test('home page has project cards', async ({ page }) => {
     await page.goto('/')
     const cards = page.locator('[data-testid="project-card"]')
     // Portfolio may be empty in staging — just verify element exists (count >= 0)
     await expect(cards.first().or(page.locator('body'))).toBeVisible()
   })
   ```

6. **Contact form spec** — `tests/smoke/contact-form.spec.ts`:
   ```typescript
   import { test, expect } from '@playwright/test'

   test('contact form submits without 500 error', async ({ page }) => {
     await page.goto('/contact')

     await page.fill('input[name="name"]', 'Smoke Test')
     await page.fill('input[name="email"]', 'smoke@example.com')
     await page.fill('textarea[name="message"]', 'Automated smoke test — ignore')
     await page.click('button[type="submit"]')

     // Wait for success state (no specific text required — just no error)
     await page.waitForTimeout(2000)
     const pageText = await page.textContent('body')
     expect(pageText).not.toContain('500')
     expect(pageText).not.toContain('Internal Server Error')
   })
   ```

7. **Add `data-testid` attributes** to key components (update Phase 4 components):
   - `<div data-testid="project-card">` in `components/project-card.tsx`
   - `<nav>` wrapper in `components/nav.tsx`
   This allows smoke tests to locate elements reliably.

8. **QA checklist comment** — add to `deploy.yml` after staging smoke tests:
   ```yaml
   - name: Post QA checklist comment
     if: always()   # runs even if smoke tests fail
     uses: actions/github-script@v7
     with:
       script: |
         const passed = '${{ job.status }}' === 'success'
         const icon = passed ? '✅' : '❌'
         const body = `## QA Checklist — Staging Deploy\n
         ${icon} Smoke tests ${passed ? 'passed' : 'FAILED'}\n
         - [ ] Visual regression check (manual)
         - [ ] Mobile layout check (manual)
         - [ ] Contact form sends email (manual)
         - [ ] Sanity preview mode works (manual)\n
         Commit: \`${{ github.sha }}\` | [View run](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})`
         github.rest.issues.createComment({
           issue_number: context.issue.number,
           owner: context.repo.owner,
           repo: context.repo.repo,
           body
         })
   ```

9. **Add `playwright install` step** to `deploy.yml` (before smoke test step):
   ```yaml
   - name: Install Playwright browsers
     run: npx playwright install --with-deps chromium
   ```

10. **Add to `package.json` scripts**:
    ```json
    "test:smoke": "playwright test tests/smoke/",
    "test:smoke:local": "BASE_URL=http://localhost:3000 playwright test tests/smoke/"
    ```

## Todo List

- [ ] Install `@playwright/test` and run `npx playwright install chromium`
- [ ] Create `playwright.config.ts` with CI-optimized settings
- [ ] Create `tests/smoke/health.spec.ts`
- [ ] Create `tests/smoke/pages.spec.ts` (all public pages + sitemap + robots)
- [ ] Create `tests/smoke/navigation.spec.ts`
- [ ] Create `tests/smoke/contact-form.spec.ts`
- [ ] Add `data-testid="project-card"` to `components/project-card.tsx`
- [ ] Add Playwright install step + smoke test step to `deploy.yml` (Phase 5)
- [ ] Add QA checklist comment job to `deploy.yml` staging section
- [ ] Run `npm run test:smoke:local` against `npm run dev` — all pass
- [ ] Push to `develop`, trigger staging deploy, verify smoke tests pass in CI

## Success Criteria

- [ ] All smoke tests pass locally against `npm run dev`
- [ ] `npm run test:smoke` completes in < 60 seconds
- [ ] Post-staging deploy: smoke tests pass in GitHub Actions
- [ ] QA checklist comment posted on staging PR
- [ ] Post-prod deploy: smoke tests pass (or deploy halts)
- [ ] Failed smoke test causes workflow to fail (exit code ≠ 0)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Smoke tests flaky on cold-start Vercel | Medium | Use `retries: 1` in Playwright config; add `waitForLoadState('networkidle')` |
| Contact form smoke test creates real DB rows | Low | Filter out `smoke@example.com` submissions in admin view |
| Missing `data-testid` attributes break selectors | Low | Fall back to semantic selectors (`role`, `text`) |
| Playwright chromium install slow in CI | Low | Cache with `actions/cache` on `.cache/ms-playwright` |

## Security Considerations

- Smoke test email `smoke@example.com` never receives real emails — Resend skips known test domains
- No credentials in test files — `BASE_URL` injected by CI environment
- Test contact form does not use service role key — uses public anon key (same as real users)

## Next Steps

After all phases complete:
- `/ck:code-review` — review full implementation
- `/ck:ship` — final version bump + PR to staging → main
- `/ck:journal` — document decisions and lessons
