# 第一局手感路线图（S0–S3）

> **For agentic workers:** 每个 S 阶段开工前另写该阶段细计划（含失败测试与文件路径）。规格真源：[../specs/2026-08-21-feel-design.md](../specs/2026-08-21-feel-design.md)。Q 门与 R 轮已完成，不拆、不加勾。

**Goal:** 点了知道下一步，打中有回声，死局能看见收获。不开新系统。

**Architecture:** 文案与时间表放 `packages/core`；Cocos 只订阅事件、用 `HIT_FX` 做已有 tween。禁止 Phaser、上游源码、官方名。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/legal/forbidden-terms.md`、`docs/ip/spirit-bible.md`
- 一次只做一个 S 阶段；未写细计划不准改代码
- 改完 `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 核心不得 `import "cc"`；不改 `policies.ts`
- 不拧高档通关率

---

## 阶段一览

| 阶段 | 一句话 | 完成物 |
|------|--------|--------|
| S0 | 点了知道下一步 | miss / 尽术 / 换人·囊 nudge 可测 |
| S1 | 打中有回声 | `HIT_FX` 时长门；预览仍闪白/位移 |
| S2 | 死局能看见收获 | 败北/通关 log 含见与收 |
| S3 | 引导局仍能再来 | 存活与死点击门仍绿；再来一局回标题 |

依赖：S0 → S1 → S2 → S3。

### S0 点了知道下一步

> 2026-08-21 已完成。细计划：`2026-08-21-S0-nudge.md`。`formatMiss(waitingFor)` / `formatBattleNudge` 已接 `PreviewApp`。未改伤害公式、未改 `policies.ts`。

### S1 打中有回声

> 2026-08-21 已完成。细计划：`2026-08-21-S1-hit-fx.md`。`HIT_FX` 时长钉死；`paint.ts` 闪白/位移读导出值。未删命中路径。

### S2 死局能看见收获

> 2026-08-21 已完成。细计划：`2026-08-21-S2-harvest.md`。败北/通关 log 含见与收；无灵糖不写灵糖。未改掉落公式。

### S3 引导局仍能再来

> 2026-08-21 已完成。细计划：`2026-08-21-S3-onboard.md`。引导 12×10 存活与死点击门仍绿；harvest→再来一局回标题。未改 `policies.ts`。

细计划路径：`docs/superpowers/plans/YYYY-MM-DD-Sn-*.md`。

## 后续开发怎么接

S0–S3 已全部完成。下一轮按 [2026-08-21-cartoon-roadmap.md](./2026-08-21-cartoon-roadmap.md) 的 A0→A2。不要往第 16 节加勾。
