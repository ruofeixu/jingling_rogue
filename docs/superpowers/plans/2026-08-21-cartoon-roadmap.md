# 卡通观感路线图（A0–A2）

> **For agentic workers:** 每个 A 阶段开工前另写该阶段细计划（含失败测试与文件路径）。规格真源：[../specs/2026-08-21-cartoon-design.md](../specs/2026-08-21-cartoon-design.md)。Q / R / S 已完成，不拆、不加勾。

**Goal:** 立绘不变形、精怪无垫底；整套界面换成浅底卡通皮；三初始先出卡通样品。不开新系统。

**Architecture:** 色板与 `portraitFit` 放 `packages/core`；Cocos / 小游戏壳只读导出值换皮。禁止 Phaser、上游源码、官方名、别家角色换皮。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/legal/forbidden-terms.md`、`docs/ip/spirit-bible.md`
- 一次只做一个 A 阶段；未写细计划不准改代码
- 改完 `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 核心不得 `import "cc"`；不改 `policies.ts`；不挪 `HIT_MIN` / `coverHit` 热区
- 立绘不进主包

---

## 阶段一览

| 阶段 | 一句话 | 完成物 |
|------|--------|--------|
| A0 | 立绘摆正 | contain 等比；有图不画椭圆底 |
| A1 | 整界面卡通皮 | `THEME` 浅底；窗口/背景/大厅壳换皮 |
| A2 | 三初始样品 | 灶狸、井蛛、桃梗卡通 PNG |

依赖：A0 → A1 → A2。

### A0 立绘摆正

> 2026-08-21 已完成。细计划：`2026-08-21-A0-portrait-fit.md`。`portraitFit` contain；有立绘不画椭圆底。

### A1 整界面卡通皮

> 2026-08-21 已完成。细计划：`2026-08-21-A1-theme.md`。`THEME` 浅底；窗口/背景/大厅壳已换皮。未挪 `coverHit`。

### A2 三初始样品

> 2026-08-21 已完成。细计划：`2026-08-21-A2-starters.md`。灶狸、井蛛、桃梗卡通 PNG，RGBA 透明底。未换其余 24 张。

细计划路径：`docs/superpowers/plans/YYYY-MM-DD-An-*.md`。

## 后续开发怎么接

A0–A2 已全部完成。不要再开新 A 阶段，除非另写规格。不要往第 16 节加勾。
