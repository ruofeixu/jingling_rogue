# 横竖屏两套展示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 预览按窗口宽高切换竖屏 750×1334 与横屏 1334×750 两套布局，横屏不再裁掉顶栏/底栏/问号。

**Architecture:** `screenLayout(w,h)` 在 core 产出整套坐标；Cocos `Boot` 读窗口后 `setDesignResolutionSize` + SHOW_ALL，大厅与战斗共用 `this.ui`。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- 改完 `pnpm test`、`pnpm check:forbidden`、`pnpm sync:core`

---

### Task 1: core 横屏布局

- [x] `screenLayout` 宽>高返回 landscape，术签在右侧且不挡指挥键
- [x] 竖屏数字与现有 `VIEW/BATTLE/HUD/ART_SLIP` 一致

### Task 2: 预览接线

- [x] Boot 按窗口切换设计分辨率并重建 chrome
- [x] lobby/help/glossary 走 `host.ui.lobby`
- [x] `fitWidth`+`fitHeight`；`pnpm test && pnpm check:forbidden && pnpm sync:core`
