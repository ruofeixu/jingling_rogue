# 回厅 + 契录对照 Implementation Plan

> **For agentic workers:** 一次做完。禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 局内随时回大厅；契录可翻全部精怪，看数值/魂契，对照年画与卡通（无卡通的不展示卡通）。

**Architecture:** `PreviewApp` 与 `Boot` 同步加「回厅」。契录分页+详情走现有 `codex` 屏。三初始年画另放 `remote/spirits-folk/`，卡通仍在 `remote/spirits/`。

**Tech Stack:** TypeScript / Vitest / Cocos 3.8.2

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 文案用契录/精怪/魂契，不用官方名
- 不改 `policies.ts`、不挪 `HIT_MIN`

---

### Task 1: 回厅

- [x] 测试：开战 → 点「回厅」→ `title` 且 `slice` 空
- [x] `PreviewApp` / `Boot` 战斗、收契、坊市、择境、天时、摘要均可回厅；烟测排除「回厅」当机缘

### Task 2: 契录

- [x] 测试：契录列出未见精怪；点开含体攻守迅与魂契；灶狸有「卡通」「年画」；无卡通的没有「卡通」
- [x] 拷三初始年画到 `spirits-folk`；详情页可切换立绘
