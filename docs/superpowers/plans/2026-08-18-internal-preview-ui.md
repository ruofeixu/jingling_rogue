# 可内测预览界面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 把 Cocos 预览做成竖屏可内测：大厅签条、战斗剪影与右侧术签。

**Architecture:** 布局数字放 `packages/core` 单测；Cocos 只用 `Graphics` 画色块，不引入 PNG，不 `import "cc"` 进核心。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2 Graphics

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/ip/spirit-bible.md`
- 禁止 Phaser、上游源码、官方名、官方四技能底栏仿品
- 核心不得 `import "cc"`；改完 `pnpm test`、`pnpm check:forbidden`、`pnpm sync:core`

---

### Task 1: 布局常量

**Files:**
- Create: `packages/core/src/ui/layout.ts`、`packages/core/src/ui/layout.test.ts`
- Modify: `packages/core/src/index.ts`、`packages/core/src/creator-entry.ts`

- [x] **Step 1: Write failing test** for 750×1334、术签在右侧 `x > 200`、敌方剪影 `y > 0`
- [x] **Step 2: Implement layout constants**
- [x] **Step 3: Tests pass**

### Task 2: 预览皮肤

**Files:**
- Modify: `assets/scripts/ui/kit.ts`、`assets/scripts/ui/lobby.ts`、`assets/scripts/Boot.ts`
- Create: `assets/scripts/ui/paint.ts`
- Modify: `assets/boot.scene` canvas 750×1334
- Modify: `settings/v2/packages/project.json` designResolution

- [x] **Step 1: Graphics 底、签条按钮、剪影、血条**
- [x] **Step 2: 战斗用右侧术签 + 中景剪影**
- [x] **Step 3: `pnpm test && pnpm check:forbidden && pnpm sync:core && pnpm check:pack`**
