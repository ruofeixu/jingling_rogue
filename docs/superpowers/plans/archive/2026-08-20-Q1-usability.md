# Q1 交互易用 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [x]`) syntax.

**Goal:** 战斗主路径点了必有下文：指挥/术签/囊/收契/点目标可进可退，非法点有 log，可点面积 ≥44。

**Architecture:** 几何与文案在 core；PreviewApp 与 Boot 共用 `formatNextHint` / `formatMiss` / `formatSpentArt`。不改战斗公式。

**Tech Stack:** TypeScript / Vitest / Cocos 仅订阅 layout 槽位

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 不提交 git

---

### Task 1: 命中尺寸 ≥44 与术签返回不挡格

**Files:** `packages/core/src/ui/layout.ts`、`layout.test.ts`

- [x] 失败测试：竖+横 `commandW/H`、`buttonH`、`skip` 高、`help` 56、`artSlip`、`back` 均 ≥ `HIT_MIN`（44）；`back` 不与 command 0–3 重叠
- [x] `export const HIT_MIN = 44`
- [x] 测试通过

---

### Task 2: 下一步文案与非法点

**Files:** `copy.ts`、`copy.test.ts`、`preview-app.ts`、`preview-app.test.ts`、`quality.test.ts`

- [x] `formatNextHint("command"|"arts"|"catch"|"target"|"map"|...)` 含「点」
- [x] `formatMiss()` 非空；`formatSpentArt("灶爪")` 含「灵力已尽」
- [x] PreviewApp：`空地` 改 log；术签上 0 灵力术只改 log 不出术；`术` 仍可竭力
- [x] 测试通过

---

### Task 3: Cocos 同源

**Files:** `creator-entry.ts`、`Boot.ts`、`index.ts`

- [x] 导出 `HIT_MIN`、`formatNextHint`、`formatMiss`、`formatSpentArt`
- [x] Boot `pick`：等待态不对则 `formatMiss`；术签 0 灵力 `formatSpentArt`；主按钮「术」仍 choose
- [x] `creator-entry.test.ts` 绿；`pnpm test`、`check:forbidden`、`sync:core`
