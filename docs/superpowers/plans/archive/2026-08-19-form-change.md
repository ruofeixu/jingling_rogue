# 显圣 / 巨灵 / 灵极 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 规格第 16 节「显圣 / 巨灵 / 灵极」。显圣 3 回合已有测；灵极器第 4 同行者战后发放已有测。补巨灵倍率、灵极改灵性、战斗中用对应机缘触发。

**Architecture:** 沿用 `enterForm` / `tickForm`。机缘进囊后 `bag` 选用，进入对应形态。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1

- [x] 测试：巨灵 HP×2；灵极改灵性；用机缘在战斗中进入对应形态
- [x] 缺的触发接到 party-battle / 机缘表
- [x] 规格 16 勾选「显圣 / 巨灵 / 灵极」
- [x] `pnpm test`、`check:forbidden`、`sync:core`
