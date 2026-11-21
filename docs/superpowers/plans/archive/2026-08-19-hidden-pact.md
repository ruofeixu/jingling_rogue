# 魂契效果块 + 隐契 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 规格第 16 节「魂契效果块 + 隐契」。现有 `pactDealMul` / `pactTakeMul` / `switchIn`。补隐契：第二套 hooks，需隐契符或第二魂契后才生效。

**Architecture:** `PactRow` 增加可选 `hiddenHooks`。伤害/换人走同一套块，不写巨型 switch。`run.boonIds` 含隐契符或 `account.secondPact` 含该种则启用隐契。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1

- [x] 测试：无隐契符时 hidden 不加伤；有符时走 hiddenHooks；效果块组合 deal+take
- [x] `hiddenHooks` + 启用门槛接到 pact.ts / apply-art
- [x] 规格 16 勾选「魂契效果块 + 隐契」
- [x] `pnpm test`、`check:forbidden`、`sync:core`
