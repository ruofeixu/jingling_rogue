# 成就机制全集 + 缎带 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 规格第 16 节「成就机制全集 + 缎带」。通关/携幼已有测。补公开 + 隐藏两套机制触发（名称原创），缎带按种族根记录。

**Architecture:** `achievements.json` 列出公开/隐藏条目与 `when` 触发块。`evaluateAchievements(account, event)` 按块发放；通关仍走 `onRunVictory` 写缎带。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1

- [x] 测试：公开与隐藏可分列；同一成就只发一次；通关写缎带；至少 4 种 when 能触发
- [x] 表 + evaluate；接到胜利/收契/孵化等现有出口
- [x] 规格 16 勾选「成就机制全集 + 缎带」
- [x] `pnpm test`、`check:forbidden`、`sync:core`
