# 三机卵房 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 规格第 16 节「三机卵房 + Pity + 跳过」。Pity（特保稀、金保史诗）与跳过已有测。补大厅三机：种族偏向 / 卵术偏向 / 异相偏向；金池按 UTC 日轮换传说池。

**Architecture:** `rollMachine(kind, seed, utcDate)` 加权抽卵。兑券仍走 `redeemVoucher`；三机是大厅另入口，消耗孵券。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1

- [x] 测试：三机偏向不同；金池同日稳定、隔日可换；Pity 与跳过仍过
- [x] 实现三机 + 必要时大厅可点
- [x] 规格 16 勾选「三机卵房 + Pity + 跳过」
- [x] `pnpm test`、`check:forbidden`、`sync:core`
