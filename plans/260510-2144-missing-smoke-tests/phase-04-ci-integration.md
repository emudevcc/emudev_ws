---
phase: 4
title: "CI Integration"
status: pending
priority: P2
effort: "20m"
dependencies: [1, 2, 3]
---

# Phase 4: CI Integration

## Overview

Wire the three new static-contract test files into the existing `smoke-static` CI job. Static tests from all new files can run without a server and belong in the same parallel job that already runs `i18n-bilingual.spec.ts --grep "static contracts"`.

Integration tests (API auth gates, header HTTP checks, robots.txt live content, 404) are deferred until a dedicated integration smoke job is configured or the existing `smoke-integration` job is extended.

## Requirements

- Functional: `smoke-static` job runs static tests from all three new files
- Functional: no new env secrets required for the static job
- Non-functional: CI runtime for `smoke-static` must not increase by more than ~30s

## Architecture

The current `smoke-static` step uses a specific `--grep` filter:

```yaml
npx playwright test tests/smoke/i18n-bilingual.spec.ts --grep "static contracts" --reporter=list
```

Change it to run all smoke files but still filter to only static/contract describes:

```yaml
npx playwright test tests/smoke/ --grep "static contracts|static contract" --reporter=list
```

Alternatively, run per-file with no grep (since `api-security.spec.ts`, `security-headers.spec.ts`, and `robots-and-404.spec.ts` gate their integration tests behind env vars and will simply skip them):

```yaml
npx playwright test tests/smoke/ --reporter=list
```

The second approach is simpler and more future-proof — each new spec self-gates integration tests with `test.skip`, so running all smoke files always produces a clean static pass in CI.

**Recommended: run all smoke files with no grep filter** (integration tests self-skip via env vars).

## Related Code Files

- Modify: `.github/workflows/ci.yml` (the `smoke-static` job step)

## Implementation Steps

1. In `.github/workflows/ci.yml`, update the `smoke-static` job's test step:

   **Before:**
   ```yaml
   - name: Static i18n smoke tests
     run: npx playwright test tests/smoke/i18n-bilingual.spec.ts --grep "static contracts" --reporter=list
   ```

   **After:**
   ```yaml
   - name: Static smoke tests
     run: npx playwright test tests/smoke/ --reporter=list
   ```

2. Verify the `smoke-static` job does NOT install Playwright browsers (static tests use only Node.js `fs` + Playwright's `request` fixture which doesn't need a browser binary). The existing job already skips browser install — keep it that way.

3. No new env vars needed for static job. Integration env vars (`SMOKE_API_INTEGRATION`, `SMOKE_SECURITY_INTEGRATION`, `SMOKE_ROBOTS_INTEGRATION`) are not set → all integration tests self-skip.

4. Optionally extend the `smoke-integration` job to set `SMOKE_ROBOTS_INTEGRATION=1` so the robots.txt content and 404 tests run alongside the existing i18n integration suite. This is low-risk and adds <5s to the job.

## Success Criteria

- [ ] `smoke-static` CI job runs all three new spec files
- [ ] All integration-gated tests skip cleanly (no failures) in static job
- [ ] Static tests from new files produce passing results in CI
- [ ] No new secrets or browser install steps added to `smoke-static` job

## Risk Assessment

- **Risk:** Playwright requires at least one project (browser) defined to run `request`-only tests. The existing config defines `chromium`. If a request-only test is run without a browser install, Playwright still works — `request` is API-level and doesn't open a browser tab. **Mitigation:** existing `smoke-static` job already runs without `--with-deps` and passes.
- **Risk:** Running `tests/smoke/` directory instead of a single file will pick up new files as they're added — this is intentional but requires future authors to self-gate integration tests. **Mitigation:** document the convention in each new spec file's `test.skip` call.
