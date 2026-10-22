# Q3 第二批立绘 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 再做 9 张年画灯影立绘进 remote；预览有图贴 Sprite，RGBA 门不回退。本阶段不改物品图标、不加受击 tween。

**Architecture:** `SECOND_PORTRAITS` + `PORTRAIT_IDS`；Cocos `hasPortrait` 改看 `PORTRAIT_IDS`。PNG 仍走 `game/remote` 与 `assets/resources/remote`，不进主包。

**Tech Stack:** TypeScript / Vitest / PNG RGBA / Cocos Sprite

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/ip/spirit-bible.md`
- 禁止 Phaser、上游源码、官方名、官方宠物外形
- 核心不得 `import "cc"`
- `pnpm test`、`check:forbidden`、`sync:core`、`check:pack`
- 不提交 git

第二批 id：`huo_de_li` `he_bo_cong` `she_mu` `luan_shi` `dian_zhu` `ye_ti` `tao_quan` `zhi_ren` `tong_ling`

---

### Task 1: 路径与集合

**Files:** `manifest.ts`、`manifest.test.ts`、`index.ts`、`creator-entry.ts`、`portrait.ts`

- [x] 失败测试：`SECOND_PORTRAITS` 9 id；`PORTRAIT_IDS` 18；`FIRST_PORTRAITS.has("huo_de_li")` 仍 false
- [x] 实现集合；`hasPortrait` 用 `PORTRAIT_IDS`
- [x] 测试通过（PNG 存在测先会红）

---

### Task 2: 9 张 PNG + meta

- [x] 生成透明底年画灯影全身 3/4 立绘
- [x] 洪水填充抠透明，color type = 6；两套目录各一份
- [x] Creator `.meta`：`hasAlpha: true`、wrap clamp-to-edge、新 uuid
- [x] `pnpm test`、`check:forbidden`、`sync:core`、`check:pack`
