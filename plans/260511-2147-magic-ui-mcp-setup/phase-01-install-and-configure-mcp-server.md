---
phase: 1
title: Install and Configure MCP Server
status: completed
priority: P2
effort: 20m
dependencies: []
---

# Phase 1: Install and Configure MCP Server

## Overview

Add `@magicuidesign/mcp` to Claude Code's global MCP server registry (`~/.claude/settings.json`) so the Magic UI tools are available in every Claude Code session.

## Context Links

- Official MCP package: `@magicuidesign/mcp` (npm, MIT)
- Official installer CLI: `@magicuidesign/cli`
- Claude Code MCP docs: `mcpServers` key in `~/.claude/settings.json`
- Current global settings: `~/.claude/settings.json` — has `enabledPlugins` + `extraKnownMarketplaces`, no `mcpServers` key yet

## Requirements

**Functional:**
- `mcpServers.magicuidesign-mcp` entry added to `~/.claude/settings.json`
- Server uses `npx -y @magicuidesign/mcp@latest` (no global install required)
- Three MCP tools become available: `listRegistryItems`, `searchRegistryItems`, `getRegistryItem`

**Non-functional:**
- Global config only (affects all projects, not just this one) — user has Pro license and wants it everywhere
- No project-level `.claude/settings.json` change needed
- Codex plugin (already enabled via `enabledPlugins`) works through Claude Code — MCP tools are automatically available to it via the same session

## Architecture

```
~/.claude.json  (user-scope MCP config, managed by claude mcp CLI)
  mcpServers: {
    "magicuidesign-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@magicuidesign/mcp@latest"]
    }
  }
```

**Important:** `mcpServers` is NOT a valid key in `~/.claude/settings.json` (schema rejects it). Claude Code manages MCP servers in `~/.claude.json` via the `claude mcp` CLI — not in `settings.json`. The Codex plugin runs within the same Claude Code session, so MCP tools configured globally are already accessible to it.

## Related Code Files

- Modified (by CLI): `~/.claude.json`

## Implementation Steps (COMPLETED)

### Step 1: Add MCP server via CLI

```bash
claude mcp add -s user magicuidesign-mcp -- npx -y @magicuidesign/mcp@latest
```

The `-s user` flag writes to the global user scope (`~/.claude.json`), making it available in all projects.

**Result:** `Added stdio MCP server magicuidesign-mcp with command: npx -y @magicuidesign/mcp@latest to user config`

### Step 2: Verify connection

```bash
claude mcp list
```

**Result:** `magicuidesign-mcp: npx -y @magicuidesign/mcp@latest - ✓ Connected`

### Step 3: Smoke test tools

Run these prompts in Claude Code to confirm tools work:
- "List all Magic UI components" → triggers `listRegistryItems`
- "Search Magic UI for animated button" → triggers `searchRegistryItems`
- "Get Magic UI marquee component" → triggers `getRegistryItem`

## Todo List

- [x] Add MCP server: `claude mcp add -s user magicuidesign-mcp -- npx -y @magicuidesign/mcp@latest`
- [x] Verify connected: `claude mcp list` → `✓ Connected`
- [ ] Smoke test: list, search, get a component in a live session

## Success Criteria

- [x] `~/.claude.json` contains `magicuidesign-mcp` entry (user scope)
- [x] `claude mcp list` shows `magicuidesign-mcp` as `✓ Connected`
- [ ] `listRegistryItems` returns a non-empty list of components
- [ ] `getRegistryItem` returns component source for a known component (e.g., `marquee`)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `npx` not on PATH in future sessions | Low | Medium | `npx` is on PATH in this environment; confirmed at install |
| MCP server version incompatibility | Very Low | Low | `@latest` keeps it current; pin if breakage occurs |
