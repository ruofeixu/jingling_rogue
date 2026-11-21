# W3 视觉债 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 清掉 W2 记下的、现在就能改的两条视觉债：底栏不再复读面板正文；设置 / 存档不再把控件挤在面板上沿。

**Architecture:** 文案进 `copy.ts`；摆放仍走 `scene.ts`。真立绘异步贴图、Cocos 回灌图标形状不在本阶段（等绘制清单进 Cocos）。

**Tech Stack:** TypeScript / Vitest

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 不提交 git
- 不改 `policies.ts`、不挪 `HIT_MIN` / `coverHit`

---

### Task 1: 底栏不复读

- [x] `formatFooter(screen, fallback)`：eggs / achievements / stats / slots / glossary / map / omen / summary / hatch / settings 给动作提示，其余回落 `app.log`
- [x] `chrome` 的 `log` 改读 footer；面板正文仍用 `app.log`
- [x] 测试：卵房底栏不含「孵卵处」，且不等于 `panel-copy`

### Task 2: 空面板居中

- [x] 设置开关、存档槽行改坐在 `panel.y`，不再贴上沿
- [x] 几何断言仍绿

### Task 3: 重截与收口

- [x] `pnpm shot`；`pnpm test`、`pnpm check:forbidden`、`pnpm sync:core`

---

## 本阶段完成的定义

1. [x] 上述大厅/局内屏底栏与面板正文不再逐字相同
2. [x] 设置 / 存档 控件在面板垂直中线附近
3. [x] 测试与禁词扫描通过

真立绘异步贴图、Cocos 回灌图标形状仍不在本阶段。
