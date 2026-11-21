# R3 第三批立绘 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 第三批 9 张年画灯影立绘进 remote；`PORTRAIT_IDS` 扩到 27。本阶段不改物品图标、不加受击 tween。

**Architecture:** `THIRD_PORTRAITS` 并入 `PORTRAIT_IDS`；Cocos `hasPortrait` 已看全集。PNG 仍走 `game/remote` 与 `assets/resources/remote`，不进主包。

**Tech Stack:** TypeScript / Vitest / PNG RGBA / Cocos Sprite

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/ip/spirit-bible.md`
- 禁止 Phaser、上游源码、官方名、官方宠物外形
- 核心不得 `import "cc"`
- `pnpm test`、`check:forbidden`、`sync:core`、`check:pack`
- 不提交 git

本阶段只选立绘。第三批 id：`zhang_yan` `pi_li` `lei_ying` `shuang_ming` `bing_can` `jin_hui` `ping_yu` `he_hun` `ming_duo`

---

### Task 1: 路径与集合

**Files:** `manifest.ts`、`manifest.test.ts`、`index.ts`、`creator-entry.ts`

- [x] 失败测试：`THIRD_PORTRAITS` 9 id；`PORTRAIT_IDS` 27；`SECOND_PORTRAITS.has("zhang_yan")` 仍 false
- [x] 实现集合
- [x] 测试通过（PNG 存在测先会红）

---

### Task 2: 9 张 PNG + meta

- [x] 生成透明底年画灯影全身 3/4 立绘
- [x] 洪水填充抠透明，color type = 6；两套目录各一份
- [x] Creator `.meta`：`hasAlpha: true`、wrap clamp-to-edge、新 uuid
- [x] `pnpm test`、`check:forbidden`、`sync:core`、`check:pack`
