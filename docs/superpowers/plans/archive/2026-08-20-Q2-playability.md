# Q2 可玩调参 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 用公开口径把低/中档均波拉进验收条；高档通关若仍远低于 40%，只记差距，不改观察面。

**Architecture:** 只动战后回复、野遇等级、双人率、克制钳等已有公开常数。不给策略开作弊视野。不改 `policies.ts` 的观察面。

**Tech Stack:** TypeScript / Vitest / `pnpm sim:bench`

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 40 种子低档门 10–30 必须仍绿
- 不提交 git

## 改前（n=40，max 200，prefix 默认 bench）

| 档 | 均波 | 通关 | 相对目标 |
|----|------|------|----------|
| 低 | 24.5 | 0% | 落在 15–25 |
| 中 | 81.0 | 0% | 高于 40–60 |
| 高 | 79.7 | 0% | 通关远低于 40–60% |

低档已合格。中档偏容易（雪球过波 20 后）。高档均波与中档几乎相同，200 通关为 0。本阶段只加难 **波 21+**（双人率、敌等级），以免打乱低档。

---

### Task 1: 钉住新的波 21+ 口径

**Files:** `classic-schedule.test.ts`、`side.test.ts`、`classic-schedule.ts`、`side.ts`

- [x] 失败测试：`foeEncounterLevel(21) === encounterLevel(21) + 7`；`dualChance([], 21) === 0.25`
- [x] 实现：`foeEncounterLevel` 波 >20 为 `level + 7`；`dualChance` 波 >20 基数 `0.25`
- [x] 单测通过

---

### Task 2: 40 种子复测并必要时再拧一档

- [x] `pnpm sim:bench -- --tier all --seeds 40`（最终：低 22.2 / 中 47.7 / 高 42.5）
- [x] 中档曾偏高，敌等级从 +5 拧到 +7；未低于 35
- [x] 低档仍在 10–30

---

### Task 3: 200 种子校准表 + Q0 门

- [x] 200 种子见下表
- [x] `bench.test.ts` 低档 10–30；中档 40 种子宽门 30–95
- [x] `pnpm test`、`check:forbidden`、`sync:core`

## 改后（n=200，max 200）

| 档 | 均波 | 通关 | 相对目标 |
|----|------|------|----------|
| 低 | 22.4 | 0% | 落在 15–25 |
| 中 | 58.6 | 0% | 落在 40–60 |
| 高 | 52.9 | 0% | 通关仍为 0%，远低于 40–60%。高策略均波未超过中档；本阶段不加作弊视野，差距记下。 |

改动：波 21+ 敌等级 `encounterLevel + 7`（原 +3）；双人基础率 0.25（原 0.15）。波 ≤20 未改，以免打乱低档。
