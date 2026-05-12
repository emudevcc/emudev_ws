---
phase: 3
title: Document Usage Workflow
status: completed
priority: P3
effort: 15m
dependencies:
  - 1
  - 2
---

# Phase 3: Document Usage Workflow

## Overview

Add a short Magic UI MCP section to `docs/code-standards.md` so the workflow is reproducible — how to browse components, pull source, and integrate into this Next.js 15 + shadcn/ui project.

## Context Links

- Phase 1: [Install and Configure MCP Server](./phase-01-install-and-configure-mcp-server.md)
- Phase 2: [Verify Pro Template Access](./phase-02-verify-pro-template-access.md)
- Target doc: `docs/code-standards.md`

## Requirements

**Functional:**
- New section in `docs/code-standards.md` under UI tooling
- Covers: listing components, searching, getting source, integration pattern
- Notes Pro auth setup if env var was required in Phase 2

**Non-functional:**
- ≤ 30 lines added to docs
- No sensitive values (tokens) in docs

## Related Code Files

- Modify: `docs/code-standards.md`

## Implementation Steps

### Step 1: Add Magic UI MCP section to code-standards.md

Append under the existing UI/component tooling section:

```markdown
## Magic UI MCP

`@magicuidesign/mcp` is configured globally in `~/.claude/settings.json`.
Provides three tools in every Claude Code session:

| Tool | Use |
|------|-----|
| `listRegistryItems` | Browse all available components |
| `searchRegistryItems` | Find components by keyword |
| `getRegistryItem` | Fetch component source code |

**Usage prompts:**
- "List all Magic UI components" — browse catalog
- "Get the Magic UI marquee component source" — pull code directly
- "Search Magic UI for animated card" — find by keyword

**Integration pattern** (Next.js 15 App Router + shadcn/ui):
1. Get component source via MCP
2. Place in `components/ui/<component-name>.tsx`
3. Add any new dependencies to `package.json`
4. Import normally — no registry CLI needed

**Pro access:** [document outcome from Phase 2 here]
```

## Todo List

- [ ] Read current `docs/code-standards.md` to find insertion point
- [ ] Add Magic UI MCP section (≤ 30 lines)
- [ ] Fill in Pro access outcome from Phase 2 result

## Success Criteria

- [ ] `docs/code-standards.md` has Magic UI MCP section
- [ ] Workflow is reproducible from docs alone for a new team member
- [ ] No token values in docs

## Next Steps

After all 3 phases complete:
- Run `/ck:git cp` to commit config changes
- Magic UI MCP is available in all future sessions automatically
