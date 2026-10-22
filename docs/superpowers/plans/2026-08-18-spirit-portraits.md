# 志怪立绘第一批 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]` / `- [ ]`) syntax for tracking.

**Goal:** 9 张年画灯影立绘进预览战斗与选初始，缺图回退剪影。

**Architecture:** 路径与第一批 id 放 core 单测；PNG 放 `remote` 以免进主包；Cocos `resources.load` 贴 Sprite，失败画剪影。

**Tech Stack:** TypeScript / Vitest / Cocos 3.8.2 Sprite / 生成 PNG

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/ip/spirit-bible.md`
- 禁止 Phaser、上游源码、官方名、官方宠物外形
- 核心不得 `import "cc"`；改完 `pnpm test`、`pnpm check:forbidden`、`pnpm sync:core`、`pnpm check:pack`

---

### Task 1: 第一批路径

**Files:**
- Modify: `packages/core/src/assets/manifest.ts`、`packages/core/src/assets/manifest.test.ts`
- Modify: `packages/core/src/index.ts`、`packages/core/src/creator-entry.ts`

- [x] **Step 1:** 失败测试：`FIRST_PORTRAITS` 含 9 id，`portraitPath(id) === "spirits/"+id+".png"`
- [x] **Step 2:** 实现常量与函数
- [x] **Step 3:** 测试通过

### Task 2: 9 张 PNG + 预览贴图

**Files:**
- Create: `game/remote/spirits/{id}.png`、`assets/resources/remote/spirits/{id}.png`
- Modify: `assets/scripts/ui/paint.ts`、`assets/scripts/ui/kit.ts`、`assets/scripts/Boot.ts`

- [x] **Step 1:** 生成 9 张年画灯影立绘
- [x] **Step 2:** 有图 Sprite，无图剪影
- [x] **Step 3:** `pnpm test && pnpm check:forbidden && pnpm sync:core && pnpm check:pack`
