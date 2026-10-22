# 第一局手感验收条（S0–S3）

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

本文件是 **R0–R5 优化完成之后** 的验收真源：点了有回声、输了知道为什么、死局还能看见带走了什么。  
系统覆盖仍以 [2026-08-17-full-feature-parity.md](./2026-08-17-full-feature-parity.md) 第 16 节为准（已勾完）。  
难度数字仍以 [2026-08-19-playability-bar.md](./2026-08-19-playability-bar.md) 为准（本规格不拧通关率）。  
Q 门仍以 [2026-08-20-quality-bar.md](./2026-08-20-quality-bar.md) 为准（不拆、不加勾）。  
R 轮仍以 [2026-08-20-optimize-design.md](./2026-08-20-optimize-design.md) 为准（已完成）。  
实施按 [../plans/2026-08-21-feel-roadmap.md](../plans/2026-08-21-feel-roadmap.md) 的 S0→S3，一次只做一个阶段。

**R 勾完 ≠ 第一局像在玩游戏。** 空地点了只有一句「点空处」；受击 tween 有函数但时长未钉进 core；败北只写契录条数，看不出这局见了谁、拿了什么。

---

## 1. 现状（2026-08-21）

已关上：Q0–Q5、R0–R5。预览能进大厅，点得中，高档 200 通关有数字（3%），立绘 27，奇遇 40，预览包能画出「契灵志怪 / 新的旅途」。

仍漏（本规格要收）：

| 债 | 证据 |
|----|------|
| 非法点诊断偏糊 | `formatMiss()` 固定「点空处无事」，不管当前该点术还是换人 |
| 该换人没文案 | 场上克制差、残血有药时，log 不提示「换人」或「囊」 |
| 受击时长未进 core | `flashNode` / `lungeNode` 写在 `paint.ts`，没有像 `CATCH_FX` 那样可测的时间表 |
| 败北收获不明显 | 败北 log 是 `溃败 · 契录 N`，不写见/收增量，也不写灵糖 |

策划依据（网上公开经验，落到现有系统，不开新玩法）：

- 点了立刻有回声（闪白 / 短位移），否则战斗像点菜单
- 前几分钟只强化已有动作；失败说明白，不堆弹窗
- 死局能看见局外带走的东西，否则肉鸽像白打

---

## 2. 原则

- 不开新模式、新境域、新支付；不改 `policies.ts` 观察面
- 不为「更像官方 UI」改底栏或十八系
- 一次一块；达不到只记差距，不作弊给 AI 视野
- 文案走 spirit-bible；禁官方名
- 立绘仍走 remote；`pnpm check:pack`
- 质量分层同质量规格：L1 无头必跑，L2 改 `assets/scripts/` 必跑，L3 不挡 L1

---

## 3. 阶段（顺序固定）

依赖：S0 → S1 → S2 → S3。

### S0 点了知道下一步

**Produces:** 空地、尽术、该换人，战斗 log 各有一句可测文案。

必须：

1. `formatMiss(waitingFor?)`：无参仍含「空」；传入 `command` / `switch` / `arts` 时，句子点出该点的控件（术、名字、术签），禁止只说「点空处」。
2. `formatSpentArt` 仍含「灵力已尽」。
3. 新增 `formatBattleNudge`：只用 HUD 能看见的信息（场上敌灵性、己方术灵性、HP、小药）。当上场克制倍率都 &lt; 1 且替补有更好克制时，文案含「换人」；当上场 HP 比 ≤ 0.4 且小药 &gt; 0 时，文案含「囊」。两者都不满足则返回空串。
4. `PreviewApp` 空地点走 miss；尽术走 spent；开战 log 在 nudge 非空时带上 nudge。

验收：`copy.test.ts`、`preview-app.test.ts` 或 `quality.test.ts` 能搜到上述子串。不改伤害公式。

### S1 打中有回声

**Produces:** 受击闪白与出手位移的时长进 core，预览仍用现有 tween。

必须：

1. 新增 `HIT_FX`（比照 `CATCH_FX`）：至少 `flashDim`、`flashEnd`、`lungeOut`、`lungeBack`，单位秒；`hitFxDuration()` 等于闪白全长。
2. 测试钉死数字；`flashEnd` 与 `lungeOut+lungeBack` 均在 **0.15–0.45** 秒（短、可感知，不拖节奏）。
3. `assets/scripts/ui/paint.ts` 的 `flashNode` / `lungeNode` 使用 `HIT_FX` 导出值（读源码断言，或从 `jinglingCore` 引用）。禁止 Phaser。
4. 已有命中路径（HP 变化闪白、出手位移）不得删掉。

验收：`pnpm test`；改了脚本则 L2 导出清单仍绿。

### S2 死局能看见收获

**Produces:** 败北/通关结算写清本局局外带走了什么。

必须：

1. 新增 `formatRunHarvest`：入参为局外可见量（见过人数、契录人数、灵糖总数或本局增量、是否新解锁）。句子至少含 **见** 与 **收**；若灵糖 &gt; 0 再含 **灵糖**。
2. `PreviewApp` 败北与通关的 `log` 使用该函数，不再只用 `溃败 · 契录 N`。
3. 仍有「再来一局」回到标题。

验收：无头测试点进败北（或通关）后 `log` 匹配见/收。不改掉落公式；没有增量就写 0，不许造假。

### S3 引导局仍能打完再来

**Produces:** 前 10 波引导门不回潮；死了能看见收获并再开。

必须：

1. 引导 12 种子 × 10 波存活 ≥ 80%；死点击 &lt; 5%（现有 `onboarding.test.ts` 仍绿）。
2. 无头走到败北或通关后：收获文案在、`再来一局` 后 `screen === "title"`。
3. 不改引导策略，不改难度口径。

验收：`pnpm test` 含 onboarding 与一条 harvest→再来 的 walk。

---

## 4. 明确不做

- 新模式、聊天、支付、广告复活
- 改 `policies.ts`、给策略隐藏种族值
- 再拧高档 200 通关率（仍 3% 记下，本轮不管）
- 第四批立绘、物品远程图、术法 280、魂契 120
- 往第 16 节加勾

---

## 5. 阶段完成的定义

一个 S 阶段完成 = 该阶段细计划全部勾完 **且**：

1. `pnpm test`、`pnpm check:forbidden` 通过
2. 改了 core → `pnpm sync:core`
3. 改了 UI → 质量规格第 3 节相关断言仍绿
4. 验收句能在测试名字或脚本输出里找到
