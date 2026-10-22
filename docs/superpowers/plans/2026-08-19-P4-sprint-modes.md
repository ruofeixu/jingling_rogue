# P4 短征与五模式 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。不给策略开作弊视野。

**Goal:** 短征 20 波且必须带契印；五种模式规则可测且互不相同。

**Architecture:** 短征是经典的 `sprint` 标记（不新增第六种 `RunMode`）。五模式差异收敛到 `modeRules()`，并接到买栏 / 遇敌 / 合体开局。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1: 短征

- [x] 测试：无契印的短征 `createRun` 抛错；第 20 波 `finale`，胜则 `victory`
- [x] `RunSession.sprint`；`finaleWave(mode, sprint)` 为 20；大厅「短征」开局带 `relicId`

### Task 2: 五模式指纹

- [x] 测试：`modeRules` 五条 JSON 互异；今日 `buyStock` 抛错；合体开局有 `fusedIds`，无尽没有
- [x] `allowsShopBuy` / `hasTrainers` / 今日三人 20 级；无尽/合体把对招改野遇
- [x] `pnpm test`、`check:forbidden`、`sync:core`
