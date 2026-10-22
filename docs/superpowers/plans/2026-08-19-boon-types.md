# 第 5.2 节全部机缘类型 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 规格第 16 节「第 5.2 节全部机缘类型」。现有表多为攻防速血/钱/经验/捕捉；已有凡镇匣、凡/上诱饵、还魂、显圣镯/巨灵带、隐契符。缺的是 5.2 点名的消耗、佩饰、被动与入池规则。

**Architecture:** 扩 `BoonRow.kind`；缺项写入 `boons.json`；`applyBoon` 写持久效果，消耗品进囊由战斗 `bag` 使用。不另起引擎。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1

- [x] 测试：5.2 每类至少一条能入池或 `applyBoon`/`bag` 生效（镇物 5 档、回复/净体/还魂/灵露、稀糖三项、骨药上限、性灵丹、灵力升/满、战符 5 波、诱饵 4 档、秘卷、进化物、形态物、双生契、孵券、灵果、本系催、种族催、佩饰点名、被动点名）
- [x] 表 + kind + `applyBoon` / 商店权重接到现有出口
- [x] 规格 16 勾选「第 5.2 节全部机缘类型」
- [x] `pnpm test`、`check:forbidden`、`sync:core`
