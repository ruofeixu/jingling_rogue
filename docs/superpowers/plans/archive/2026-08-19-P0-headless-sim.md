# P0 无头对局 Implementation Plan

> 对照公开玩法环做无头司机。禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 同一观察面下，低/中/高策略能复现地打完整局，并输出最高波。

**Architecture:** `packages/core/src/sim/` 驱动已有 `ClassicSlice` + `startPartyBattle`，不新开战斗规则。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 观察面不得含隐藏种族值

### Task 1: 观察与一局

- [x] 测试：同 seed 低策略两次结果相同；观察含金/HP/术灵力，不含 baseAtk
- [x] `observe.ts` `run-sim.ts` `policies.ts` `bench.ts`

### Task 2: 命令

- [x] 根目录 `pnpm sim:bench`
