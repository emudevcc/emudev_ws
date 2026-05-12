---
title: Magic UI MCP Setup
description: >-
  Install the official Magic UI MCP server for Claude Code and configure Pro
  license template access for use in this project.
status: completed
priority: P2
effort: 1h
branch: development
tags:
  - mcp
  - magic-ui
  - tooling
blockedBy: []
blocks: []
created: '2026-05-12T03:51:30.359Z'
createdBy: 'ck:plan'
source: skill
---

# Magic UI MCP Setup

## Overview

Install `@magicuidesign/mcp` — the official Magic UI MCP server — into Claude Code's global config so that `listRegistryItems`, `searchRegistryItems`, and `getRegistryItem` tools are available in every session. Verify Pro template access works. Document the workflow for using Magic UI components via MCP during development.

**Key constraint:** OpenAI Codex plugin (enabled via `enabledPlugins` in `~/.claude/settings.json`) is a Claude Code plugin, not a separate MCP client. MCP servers configured in `~/.claude/settings.json` under `mcpServers` are already available to Codex-assisted sessions through Claude Code — no separate Codex MCP config needed.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Install and Configure MCP Server](./phase-01-install-and-configure-mcp-server.md) | Completed |
| 2 | [Verify Pro Template Access](./phase-02-verify-pro-template-access.md) | Completed |
| 3 | [Document Usage Workflow](./phase-03-document-usage-workflow.md) | Completed |

## Dependencies

None — standalone tooling setup.
