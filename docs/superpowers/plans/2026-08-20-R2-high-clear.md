# R2 高档能通 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 只拧公开口径，让高策略经典 200 通关出现数字；低档 40 种子均波仍在 10–30，中档尽量留在 40–60。

**Architecture:** 不改 `policies.ts` 观察面。只动战后回复、波 21+ 敌等级、双人率。达不到 40% 只记差距。

**Tech Stack:** TypeScript / Vitest / `pnpm sim:bench`

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 不提交 git
- 禁止改 `packages/core/src/sim/policies.ts`

---

## 改前（Q2 收口，n=200，max 200）

| 档 | 均波 | 通关 | 相对目标 |
|----|------|------|----------|
| 低 | 22.4 | 0% | 落在 15–25 / Q0 10–30 |
| 中 | 58.6 | 0% | 落在 40–60 |
| 高 | 52.9 | 0% | 通关远低于 40–60% |

直方图：均匀放水会卡在 191–199 虚境；全面加压则高≈中都死在 50 波附近。故分段：21–180 加压、180 后放水。

---

### Task 1: 钉住分段口径

**Files:** `classic-schedule.test.ts`、`side.test.ts`、`growth.test.ts`、`classic-schedule.ts`、`side.ts`、`run-session.ts`

- [x] 失败测试：波 21 敌等级 `+9`；波 181 敌等级 `-12`；`dualChance` 21=0.2、181=0.03；波 21 战后 +0.3；波 181 战后回满
- [x] 最小实现
- [x] 单测通过

---

### Task 2: 40 / 200 种子复测

- [x] 40 种子：低 22.8 / 中 58.1 / 高 52.2；低档仍 10–30；PR `pr-gate` 门绿
- [x] 再拧：虚境墙用波 >180 回满 + 敌等级 -12；中段 +9 把 `pr-gate` 中档压回 ≤95
- [x] 200 种子见下表
- [x] `pnpm test`、`check:forbidden`、`sync:core`

## 改后（n=200，max 200，prefix `bench`）

| 档 | 均波 | 通关 | 相对目标 |
|----|------|------|----------|
| 低 | 23.1 | 0% | 落在 15–25 / Q0 10–30 |
| 中 | 75.2 | 6% | 高于 40–60（40 种子 58.1 仍在带内） |
| 高 | 68.0 | 3% | **有数字**，低于 40–60% |

40 种子：低 22.8 / 中 58.1 通关 3% / 高 52.2 通关 3%。

## 差距

高策略与中档均波接近（观察面禁止改 `policies.ts`），40% 通关会把中档 40 种子均波抬出 PR 宽门 30–95。未再拧伤害/商店。未改观察面。
