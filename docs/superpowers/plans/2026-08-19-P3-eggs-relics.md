# P3 卵房与开局契印 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。不给策略开作弊视野。

**Goal:** 大厅卵房能兑券、跳过步数并开卵；开局从账号已解锁契印里三选一，效果写入本局。

**Architecture:** 卵逻辑补 `skipEggSteps`；契印独立配表 `relics.json`，经 `createRun({ relicId })` 进 `run.relicIds`。预览在选初始屏展示三枚契印（默认第一枚），不增加「标题→模式→开战」之外的确认次数。

**Tech Stack:** TypeScript / Vitest / Cocos 只引 vendor。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 契印用原创名，不用官方道具名
- 新账号自带 1 张凡孵券、3 枚解锁契印，卵房不必作弊发金券

### Task 1: 卵房可孵

- [x] 测试：`emptyAccount` 有凡券；兑凡得 1 卵；`skipEggSteps` 后 `hatchEgg` 入契录
- [x] `skipEggSteps`；卵房按钮兑已有券、跳过走 `skipEggSteps`，禁止无券发金券
- [x] `pnpm --filter @jingling/core test -- src/meta/meta.test.ts`

### Task 2: 12 契印与三选一

- [x] 测试：配表 12 枚；新号解锁 3 枚并 `offerRelics` 给出 3 个；`createRun({ relicId })` 写入金钱/攻等
- [x] `relics.json`、`meta/relics.ts`、`RunSession.relicIds`、存档编解码、`sumRunStats` / 收契修正含契印
- [x] Boot 选初始时展示三枚契印；ClassicSlice 传入 `relicId`
- [x] `pnpm test`、`check:forbidden`、`sync:core`
