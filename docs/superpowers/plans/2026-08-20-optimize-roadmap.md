# 优化落地路线图（R0–R5）

> **For agentic workers:** 每个 R 阶段开工前另写该阶段细计划（含失败测试与文件路径）。规格真源：[../specs/2026-08-20-optimize-design.md](../specs/2026-08-20-optimize-design.md)。Q 门：[../specs/2026-08-20-quality-bar.md](../specs/2026-08-20-quality-bar.md)。难度：[../specs/2026-08-19-playability-bar.md](../specs/2026-08-19-playability-bar.md)。

**Goal:** 预览能看能点，高档能通关，观感与配表再收一块。不开新系统。

**Architecture:** 继续 `packages/core` 纯逻辑 + Cocos 只订阅事件。禁止 Phaser、上游源码、官方名。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2 / 微信与抖音小游戏。

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/legal/forbidden-terms.md`、`docs/ip/spirit-bible.md`
- 一次只做一个 R 阶段；未写细计划不准改代码
- 改完 `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 核心不得 `import "cc"`；立绘不进主包
- 达不到通关数字只改公开口径，不改观察面

---

## 阶段一览

| 阶段 | 一句话 | 完成物 |
|------|--------|--------|
| R0 | 预览不死 | 重复 import 门；`EXACT_FIT`；进预览有大厅 |
| R1 | 点得中 | Q1 几何/死点击门仍绿；装饰不抢点击 |
| R2 | 高档能通 | 200 种子通关有数字；低/中档不掉带 |
| R3 | 观感一块 | 立绘或真图标或受击 tween，三选一 |
| R4 | 表一块 | 术 280 或魂契 120 或奇遇 40，三选一 |
| R5 | 真机包 | 开发者工具里能看到大厅，不是骨架 log |

依赖：R0 → R1 → R2。R3 在 R2 后。R4 与 R3 互不阻塞，仍一次一块。R5 最后。

### R0 预览不死

> 2026-08-20 已完成。细计划：`2026-08-20-R0-preview.md`。`EXACT_FIT` + Canvas 归零 + 重复 import 门已进 `creator-entry.test.ts`。

### R1 点得中

> 2026-08-20 已完成。细计划：`2026-08-20-R1-hit.md`。HIT_MIN / probeWaitingUi / 死点击门仍绿；`kit.ts` `coverHit` 已钉。

### R2 高档能通

> 2026-08-20 已完成。细计划：`2026-08-20-R2-high-clear.md`。200 种子高档通关 3%（有数字，低于 40–60%）；低 23.1 / 中 40 种子 58.1 仍在带内。未改观察面。

### R3 观感一块

> 2026-08-20 已完成。细计划：`2026-08-20-R3-portraits.md`。第三批 9 立绘；`PORTRAIT_IDS` 27；RGBA remote，未进主包。未做物品图标/受击 tween。

### R4 表一块

> 2026-08-20 已完成。细计划：`2026-08-20-R4-omens.md`。奇遇 40；拒 `catalog_` / `闲术`。未动术法、魂契。

### R5 真机包

> 2026-08-20 已完成。细计划：`2026-08-20-R5-pack.md`。`game.js` Canvas 大厅含「契灵志怪 / 新的旅途」；无 PNG；不上架。

细计划路径：`docs/superpowers/plans/YYYY-MM-DD-Rn-*.md`。

## 后续开发怎么接

1. 读本文件 + 优化规格，确认当前最小未勾阶段（**R0–R5 已全部完成**。不要再开新阶段，除非另写规格）。
2. 写该阶段细计划（失败测试 + 文件路径）。
3. 只做这一阶段。不要往第 16 节加勾。

Q0–Q5 计划保留作历史。
