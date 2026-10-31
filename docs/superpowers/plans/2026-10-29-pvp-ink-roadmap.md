# PvP 与水墨路线图（I1–I3 / P1–P7）

> **For agentic workers:** 每个阶段开工前另写该阶段细计划（含失败测试与文件路径）。规格真源：[../specs/2026-10-29-pvp-design.md](../specs/2026-10-29-pvp-design.md)、[../specs/2026-10-29-ink-design.md](../specs/2026-10-29-ink-design.md)。

**Goal:** 内测前把观感改成水墨风；内测之后新增竞技场、天梯、AI 天梯三种 PvP。

**和内测路线图的关系**（[2026-10-01-internal-beta-roadmap.md](./2026-10-01-internal-beta-roadmap.md)）：

- **水墨线在内测之前。** I1 现在做（B3 之前），I2、I3 就是 B5 的内容。内测版用水墨皮。
- **PvP 线在内测之后。** P1 起依赖 B6。B6 之前 PvP 只做"现在并行"一项（服务器与备案）。

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/legal/forbidden-terms.md`、`docs/ip/spirit-bible.md`
- 一次只做一个阶段；未写细计划不准改代码
- 改完 `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`，改 presentation 再 `pnpm sync:presentation`
- 核心不得 `import "cc"`；不改 `startPartyBattle` 的行为；PvE 测试不改断言
- 立绘不进主包

## 总顺序

```
I1 水墨规格+样张 → B3 → B4 → B5（= I2 + I3 + 水墨皮上的打磨）→ B6 内测
                                                              ↓
                                   P1 → P2 / P3 → P4 → P5 → P6 → P7
服务器与备案：现在开始，和上面并行
```

## 阶段一览

| 阶段 | 内容 | 依赖 | 退出证据 |
|------|------|------|----------|
| 现在并行 | 买腾讯云轻量服务器、域名，开始 ICP 备案；准备两平台 AppID / AppSecret | 无 | 备案号 |
| **I1 水墨规格** | 改写 spirit-bible 美术方向；出 title、battle 两屏样张和一只精怪立绘样张；定稿水墨规格 | 无，**现在做** | 负责人看样张确认 |
| B3、B4 | 内测路线图原内容，不变 | I1 | 见内测路线图 |
| **I2 水墨 token 与贴图**（B5） | `THEME`、对比度测试、9-slice 贴图、血条贴图、书法标题字 | I1、B4 | 对比度审计过；人工看图 |
| **I3 水墨立绘**（B5） | 54 张原地替换 | I1 | `pnpm check:pack`；分包 ≤20 MiB |
| B6 | 内测总验收，视觉门按水墨规格 | B5 | 见内测路线图 |
| P1 确定性底座 | `RngStream.snapshot/restore`、`orderBySpeed`、`tablesVersion` | B6 | PvE 全过且逐位一致；快照恢复测试 |
| P2 培养生效 + 名册 | 性灵、骨药、秘卷 3 选 1、麻痹；`roster`、codec v2、结算页收录 | P1 | `pnpm sim:bench` 在难度规格内；旧存档可读 |
| P3 对战 reducer | `pvp/` 的 types、normalize、duel-ai、duel-reducer、replay | P1 | 确定性、复算、座位镜像、不抛异常 |
| P4 竞技场轮抽 | `draft.ts`；本地人对 AI 竞技场打完一局 | P3 | 本地点完一局 |
| P5 对战服 | `server-pvp/`：真登录、SQLite、匹配、房间、30 秒计时、AI 代打、断线重连 | P3、备案 | 两个脚本客户端跑完一局；超时与重连测试 |
| P6 客户端联网 | `platform/net`；匹配中、PvP 战斗、战报各屏（直接按水墨做） | P4、P5 | 两平台开发者工具里两个账号实时对战 |
| P7 天梯 + AI 天梯 | Elo、名册组队、AI 天梯上传复算 | P2、P6 | 篡改指令序列被拒 |

I3 出图量最大、和代码不冲突，I1 确认后就可以开始出图，和 B3、B4 并行，B5 时再接入。

细计划路径：`docs/superpowers/plans/YYYY-MM-DD-In-*.md`、`YYYY-MM-DD-Pn-*.md`。

## 决策记录

- 2026-10-29：天梯先让培养成果生效（P2），接受肉鸽难度随之重调。负责人 2026-10-30 确认。
- 2026-10-30：**内测前必须定好美术风格，内测用水墨风。** 推翻 10-29 草案里"内测仍用卡通皮"的安排。I1 提到 B3 之前，I2、I3 并入 B5。
- 2026-10-30：**后期兼容赛季制**（2 个月一季、限定精怪、排名重置、赛季皮肤和称号）。本版不实现，P1–P7 和 I2、I3 按 PvP 规格第 7 节预留字段和接口，`seasonId` 本版固定 `"s0"`。
- 需要负责人做的事单列在 [2026-10-29-owner-tasks.md](./2026-10-29-owner-tasks.md)。

## 风险

- **水墨出图是内测的关键路径。** 54 张立绘加整套 9-slice 贴图，出图慢会直接推迟内测。I1 一确认就开始出图。
- **对比度：** 淡墨字很容易低于 4.5:1，配色先过审计再出贴图。
- **B5a 已做的卡通三页：** 布局几何保留，配色和控件质感由 I2 重做。
- 备案是 PvP 最长的外部等待（通常 1–3 周），不提前开始会卡住 P5。
- 同时出招时客户端不能提前预测结果，只能在 `commandsRevealed` 后本地重算并核对哈希。
- 表数据一改旧录像失效，靠 `tablesVersion` 识别，天梯赛季切换时处理。
- P2 改变 PvE 难度，必须重跑难度基准。
