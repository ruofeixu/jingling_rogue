# P1 局内成长 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 战后经验升级（闸内）、可进化、还魂/镇物包入购买栏、HP 带进下一场。

### Task 1

- [x] 测试：`grantWaveExp` 升级不超过闸；灶狸 8 级进化丹狸
- [x] 测试：残血比例写入 `partyHpRatios`，下场开打不是满血
- [x] 测试：还魂把 0 血拉回；购买栏 1 波有还魂
- [x] `pnpm test`、`check:forbidden`、`sync:core`

### Task 2

- `run-session.ts`：`partyLevels`、`grantWaveExp`、`commitParty`
- `party-battle.ts`：`hpRatios` / `partyLevels`、跳过濒死首发
- `classic-slice` / Boot / sim 接线
- `pnpm test`、`check:forbidden`、`sync:core`
