---
phase: 2
title: Verify Pro Template Access
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
---

# Phase 2: Verify Pro Template Access

## Overview

Investigation into Pro template access via MCP — completed via source inspection of `@magicuidesign/mcp@2.0.0`.

## Context Links

- Phase 1: [Install and Configure MCP Server](./phase-01-install-and-configure-mcp-server.md)
- MCP package GitHub: https://github.com/magicuidesign/mcp

## Finding: No Pro Auth in MCP (RESOLVED)

**The MCP server does NOT support Pro authentication.** Source inspection confirms:

```
registry/client.js:
  REGISTRY_URL = "https://magicui.design/registry.json"  ← public, no auth
  REGISTRY_ITEM_URL = "https://magicui.design/r"          ← public, no auth
```

- Zero `process.env.*` references in the entire server bundle
- No auth-related strings (token, license, key, pro, premium, tier)
- `server.js` → `registerGenericTools` → `registryService` → public fetch only

**Conclusion:** `@magicuidesign/mcp` wraps the public Magic UI registry API only. Pro templates are not accessible via MCP — by design, not by missing config.

### What IS available via MCP

All items in `https://magicui.design/registry.json` — the full public component catalog: animated text effects, shimmer buttons, marquee, sparkles, particle effects, and ~100+ free components.

### Accessing Pro Templates

Pro templates must be accessed via the browser:
1. Log into magicui.design/pro
2. Navigate to the desired template
3. Copy the JSX/TSX source
4. Place in `components/ui/<component>.tsx`
5. Use `getRegistryItem` via MCP to find any free-tier dependencies the Pro component needs

## Todo List

- [x] Inspect MCP server source for auth mechanism
- [x] Confirm: no Pro auth in MCP (public registry only)
- [x] Document workaround for Pro template access

## Success Criteria

- [x] Pro access mechanism investigated and documented
- [x] Workaround for Pro templates established (browser copy)

## Unresolved Questions

- Will Magic UI ever add Pro-authenticated MCP support? (Could file feature request at github.com/magicuidesign/mcp)
