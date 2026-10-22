# 灵糖三项消费 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 规格第 16 节「灵糖三项消费」：降费用、第二魂契、专属卵（需已买第二魂契）。cost 已有测。

**Architecture:** 沿用 `spendCandy(kind)`。补 pact / egg 行为与门槛：未买第二魂契时 `kind === "egg"` 抛错；买卵加该种孵券或入卵槽（与现实现对齐后写测）。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1

- [x] 测试：pact 写入 `secondPact`；无 pact 买卵失败；有 pact 买卵成功；费用不能低于 1
- [x] 实现门槛（egg 依赖 pact）；必要时大厅可点三项
- [x] 规格 16 勾选「灵糖三项消费」
- [x] `pnpm test`、`check:forbidden`、`sync:core`
