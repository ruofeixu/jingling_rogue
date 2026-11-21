# P5 上手 UX Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 标题到开战三次确认；引导策略前 10 波存活 ≥80%；引导路径死点击 <5%；指挥格不重叠（已有测）。

**Architecture:** 大厅路径用 `START_PATH` 固定三步。战斗「术」默认打出第一张。无头 `guide` 策略 = 第一张术 + 残血喝药，并用 `applySafeCommand` 统计死点击。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1

- [x] 测试：`START_PATH` 为 title → mode → starter，长度 3
- [x] 测试：`guide` 12 种子打满 10 波存活率 ≥80%；死点击率 <5%
- [x] `applySafeCommand`；`decide(..., "guide")`；Boot「术」一击出第一张，术签仍可打开全表
- [x] `pnpm test`、`check:forbidden`、`sync:core`
