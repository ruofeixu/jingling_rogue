# 同行者 6 战编制 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 规格第 16 节「同行者 6 战编制规则」。波 8/25/55/95/145/195。每见一次多带 1 只；末战显圣；4 战起灵极器（已有测）。

**Architecture:** `rivalRoster(fightIndex, seed)` 返回队伍。规则：1 初始阶段进化、2 飞禽线、3 高种族值单阶、4 双 540+、5 加强、6 异相巨龙显圣。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1

- [x] 测试：第 n 战队伍长度 n；第 4 战可发灵极；第 6 战含显圣标记
- [x] `nextEncounter` / 头目编制接到 roster
- [x] 规格 16 勾选「同行者 6 战编制规则」
- [x] `pnpm test`、`check:forbidden`、`sync:core`
