# 质量与可玩路线图

> **For agentic workers:** 每个 Q 阶段开工前另写该阶段细计划（含失败测试与文件路径）。推荐 `superpowers:subagent-driven-development` 或 `executing-plans`。规格真源：[../specs/2026-08-20-quality-bar.md](../specs/2026-08-20-quality-bar.md)。系统对标：[../specs/2026-08-17-full-feature-parity.md](../specs/2026-08-17-full-feature-parity.md) 第 16 节（已勾完）。难度数字：[../specs/2026-08-19-playability-bar.md](../specs/2026-08-19-playability-bar.md)。

**Goal:** 把「系统有了」变成「能测、能玩、能点」。先把门焊进 CI，再改易用与难度，最后补表现与真机。

**Architecture:** 继续 `packages/core` 纯逻辑 + Cocos 只订阅事件。质量断言优先写在 core（layout / PreviewApp / sim）；Cocos 只补命中与贴图。禁止 Phaser、禁止上游源码、禁止官方名。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2 / FastAPI / 微信与抖音小游戏。

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/legal/forbidden-terms.md`、`docs/ip/spirit-bible.md`
- 改完跑 `pnpm test`、`pnpm check:forbidden`；涉及预览则 `pnpm sync:core`
- 核心不得 `import "cc"`；Cocos 不得引用 `packages/`（只引 vendor）
- 竖屏 750×1334；主包 4MB；立绘走 CDN
- **一次只做一个 Q 阶段**；未写细计划不准改代码
- 达不到可玩数字只改公开口径，不给 AI 开作弊视野

---

## 现状（2026-08-20）

F1–F12 系统项已在第 16 节勾完。P0–P6 可玩切片（无头 sim、成长、难度初校、卵/镇物、短征、上手、目录）已落地，但：

- `sim:bench` **没有**挂进 `pnpm test`
- 预览曾出现：点了没反应（立绘盖 Button）、导出名字缺失、文字重叠、模式钮溢出、立绘黑框
- 这些是 **质量债**，不是缺一套新玩法

本路线图替代「再开 F13」。内容扩无尽 240 精怪不在 Q0–Q2。

## 文件归属

- 质量规格：`docs/superpowers/specs/2026-08-20-quality-bar.md`
- 无头 UI：`packages/core/src/ui/preview-app.ts` 及测试
- 几何：`packages/core/src/ui/layout.ts` 及测试
- 上手 / 死点击：`packages/core/src/sim/onboarding.ts`
- 可玩 bench：`packages/core/src/sim/bench.ts`、`cli.ts`
- 预览壳：`assets/scripts/Boot.ts`、`ui/kit.ts`、`ui/paint.ts`、`ui/portrait.ts`
- 导出面：`packages/core/src/creator-entry.ts`
- 平台：`packages/platform/`、`docs/platform/minigame-pack.md`

---

## 阶段一览

| 阶段 | 一句话 | 完成物 |
|------|--------|--------|
| Q0 | 质量门焊进 CI | 40 种子 bench 进测试；walk 覆盖死点击；Cocos 命中约定有测 |
| Q1 | 交互易用 | 每个 waitingFor 有控件；点了有反馈；指挥/术签/囊不迷路 |
| Q2 | 可玩调参 | 40 种子落在条带内；200 种子校准表；高档通关有数字 |
| Q3 | 表现 | 下一批立绘或真图标；收契/受击反馈可测 |
| Q4 | 内容余量 | 无尽规模 / 剩余剪影批次（按规格第 13 节） |
| Q5 | 平台 | wx/tt 开发者工具可预览；云存档路径可测 |

依赖：Q0 → Q1 → Q2。Q3 可与 Q2 后并行于不同会话，但不得回头拆 Q0 的门。Q4、Q5 互不阻塞，仍一次只做一块。

---

### 阶段 Q0：质量门

> 2026-08-20 已完成。细计划：`2026-08-20-Q0-quality-gates.md`。`pnpm test` 含 40 种子低档均波门、`walkPlayableUi` 死点击 <5%、`probeWaitingUi` 覆盖 7 种等待态。

**Files:** `packages/core/src/sim/`、`packages/core/src/ui/preview-app.ts`、`packages/core/src/ui/layout.ts`、`package.json`、`packages/core/src/creator-entry.ts`

**Produces:** 声称「能玩」必须过脚本，而不是过感觉。

细计划必须包含：

1. **失败测试先写：** `benchSims({ tier: "all", seeds: 40 })` 的低档均波落在 playability-bar 容差内（40 种子容差写在细计划里，宽于 200 种子条带）。挂到 `pnpm test` 或独立 `pnpm test:bench` 且根脚本默认会跑。
2. **失败测试：** `walkPlayableUi`（或新 walker）对战斗指令路径统计死点击，阈值与引导路径相同（<5%），覆盖 术 / 术签返回 / 队伍 / 囊，不只大厅。
3. **失败测试：** 每个 `waitingFor` 在 PreviewApp 上至少有一个 label 可 tap 且状态变化。
4. **约定测试：** Cocos 从 jinglingCore 引进的符号继续由 `creator-entry.test.ts` 钉死；新增预览 API 必须先加导出再 sync。
5. 不在本阶段改数值、不加立绘。

验收：`pnpm test`、`pnpm check:forbidden`、`pnpm sync:core`。40 种子超时则降到可接受的 n 并在细计划写明，但不得删门。

---

### 阶段 Q1：交互易用

> 2026-08-20 已完成。细计划：`2026-08-20-Q1-usability.md`。命中 ≥44、术签返回不挡格、空地/尽术有文案、指挥路径 log 变化。

**Files:** `packages/core/src/ui/`、`assets/scripts/ui/`、`assets/scripts/Boot.ts`、`packages/core/src/ui/copy.ts`

**Produces:** 人不用猜下一步；点了必有下文。

细计划必须包含（可再拆成更小任务，但本阶段一次做完「战斗主路径」）：

1. 指挥四格 + 术签进出 + 囊/队伍返回：layout 不重叠（竖+横）；PreviewApp 点完 log 变化。
2. 收契 / 点目标 / 择境：无头有对应 tap；非法点击有文案。
3. 控件逻辑尺寸 ≥44；Cocos 装饰 `coverHit()`，可点的是 Button。能写成测试的写测试（几何）；命中回归用「导出 + layout 槽位」避免再靠预览撞雷。
4. 不改战斗公式。

---

### 阶段 Q2：可玩调参

> 2026-08-20 已完成。细计划：`2026-08-20-Q2-playability.md`。波 21+ 敌等级 +7、双人率 0.25。200 种子：低 22.4 / 中 58.6 入条；高通关 0% 已记。

**Files:** `packages/core/src/combat/`、`packages/core/src/run/`、`packages/core/src/shop/`（只动公开口径常数）

**Produces:** 低/中均波、高通关率按 playability-bar；留下校准表。

细计划必须包含：

1. 先跑 `pnpm sim:bench --tier all --seeds 40`，把数字抄进细计划「改前」。
2. 达不到则改公开口径（P2 已动过：一阶种、先手、双人率、战后回复、野遇等级、克制钳）。**禁止**给策略看隐藏种族值。
3. 改后再跑 40 种子；夜间 200 种子写入细计划「改后」。高档若仍远低于 40% 通关，只调伤害/回复/双人，并写明差距，不改观察面、不开新系统。
4. 依赖 Q0 的 bench 门仍然绿。

---

### 阶段 Q3：表现

> 2026-08-20 已完成。细计划：`2026-08-20-Q3-portraits.md`。第二批 9 立绘进 remote（512 RGBA）；`PORTRAIT_IDS` 18；`hasPortrait` 看全集。物品图标与受击 tween 未做。

**Files:** `packages/core/src/assets/`、`game/remote/`、`assets/resources/remote/`、`assets/scripts/ui/paint.ts`、`portrait.ts`、`packages/core/src/ui/catch-fx.ts`

**Produces:** 下一批可见物，且 PNG 门（RGBA）不回退。

候选（细计划只选 **一块**）：下一批立绘（仍走 remote，不进主包）**或** 物品从 Graphics 换成远程小图 **或** 受击/还魂的预览 tween。立绘必须原创志怪，禁止官方剪影。

---

### 阶段 Q4：内容余量

> 2026-08-20 已完成。细计划：`2026-08-20-Q4-catalog.md`。精怪 **240**（一次一种表）；术/魂契/奇遇地板未动。

对照规格第 13 节：经典 200 地板已满足。本阶段只做 **无尽可玩** 缺口（精怪 ≥240 等）或奇遇 40，且必须配 `catalog.test.ts` 新地板。一次一种表。文案走 spirit-bible，先跑 `check:forbidden`。

---

### 阶段 Q5：平台

> 2026-08-20 已完成。细计划：`2026-08-20-Q5-platform.md`。`pnpm pack:minigame` 写出 wx/tt 预览包；`SAVE_ORIGIN` 对齐合法域名；`loginCloud` + `getRun` 可测。不上架。完整引擎包仍走 Creator。

**Files:** `packages/platform/`、`build-templates/`、`docs/platform/minigame-pack.md`、`server/`

**Produces:** 微信、抖音开发者工具里各打出可预览包；云存档路径有测试。商店上架不在本阶段。主包继续 `pnpm check:pack`。

---

## 后续开发怎么接

1. 读本文件 + 质量规格，确认当前最小未勾阶段（**Q0–Q5 已全部完成**）。新工作改走 [2026-08-20-optimize-roadmap.md](./2026-08-20-optimize-roadmap.md) 的 R0→R5。
2. 按 `writing-plans` 写 `docs/superpowers/plans/YYYY-MM-DD-Q0-quality-gates.md`（或对应 Qn），任务带失败测试与文件路径。
3. 执行该细计划；不要在同一会话做完 Q0 又开 Q1，除非用户明确说继续下一阶段。
4. 阶段完成定义见质量规格第 8 节。

旧的 F1–F12 与 P0–P6 计划保留作历史；**新工作不要往第 16 节加勾**，往本路线图的 Q 阶段细计划里勾。
