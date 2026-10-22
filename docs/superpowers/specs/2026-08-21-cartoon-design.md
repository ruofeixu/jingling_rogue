# 卡通观感验收条（A0–A2）

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

本文件是 **S0–S3 手感完成之后** 的验收真源：立绘不变形、精怪身后无底，整套界面改成明亮卡通皮，三初始先出卡通样品。  
系统覆盖仍以 [2026-08-17-full-feature-parity.md](./2026-08-17-full-feature-parity.md) 第 16 节为准（已勾完）。  
难度数字仍以 [2026-08-19-playability-bar.md](./2026-08-19-playability-bar.md) 为准（本规格不拧通关率）。  
Q / R / S 门不拆、不加勾。  
实施按 [../plans/2026-08-21-cartoon-roadmap.md](../plans/2026-08-21-cartoon-roadmap.md) 的 A0→A2，一次只做一个阶段。

**气质参考国产儿童向卡通：浅底、圆角、平涂、勾线。** 抄的是「亮、圆、好认」，不是某款已有游戏的角色、UI 切图或商标。文案与文件里不要写别家游戏名。

---

## 1. 现状（2026-08-21）

已关上：Q0–Q5、R0–R5、S0–S3。

仍漏（本规格要收）：

| 债 | 证据 |
|----|------|
| 立绘被框硬拉 | `attachPortraitSprite` 用 `CUSTOM` 把图拉成传入的 `width×height`；选初始约 140×180，战斗约 168×220，比例不一致 |
| 精怪身后有底 | `paintPortrait` 先画半透明椭圆（灵性色 alpha 55）和脚下阴影椭圆 |
| 整界面是暗金年画皮 | `PAPER (18,22,36)`、`PANEL (24,28,44)`、大厅 Canvas `#1a1410`；与卡通浅底冲突 |
| 三初始仍是旧立绘 | `zao_li` / `jing_zhu` / `tao_geng` 未按卡通平涂重画 |

---

## 2. 原则

- 开新玩法、不改底栏仿品、不改十八系、不改 `policies.ts`
- 布局几何（`HIT_MIN`、按钮坐标、`coverHit`）不挪，只换皮
- 立绘仍走 remote，`pnpm check:pack`
- 文案走 spirit-bible；禁官方名与别家角色换皮
- 一次一块；达不到只记差距
- 质量分层同质量规格：L1 无头必跑，L2 改 `assets/scripts/` 必跑

---

## 3. 阶段（顺序固定）

依赖：A0 → A1 → A2。

### A0 立绘摆正

**Produces:** 选初始和战斗里精怪等比显示；有立绘时身后无任何底。

必须：

1. core 新增 `portraitFit(boxW, boxH, imgW, imgH)`：按 **contain** 算出绘制宽高，短边留空，禁止把图拉满框。
2. `attachPortraitSprite` 用 `portraitFit` 后的宽高；选初始卡与战斗立绘都走同一函数。
3. `paintPortrait`：`hasPortrait` 为真时不画椭圆底、不画脚下阴影、不画色块剪影。无图才回退剪影。
4. 测试钉死：正方形图放进 140×180 框，输出宽高相等且 ≤ 框；`paint.ts` 在贴图路径上不再 `ellipse` 垫底。

验收：`pnpm test`；改了脚本则 L2 导出清单仍绿。

### A1 整界面卡通皮

**Produces:** 大厅、选初始、战斗、术签、名牌、小游戏壳，看起来是同一套浅底卡通皮。

必须：

1. core 新增 `THEME` 色板（RGB 数组，可测）。默认值钉死：`paper [232,244,252]`、`panel [255,253,248]`、`ink [61,50,40]`、`accent [255,138,74]`、`edge [91,184,232]`、`field [123,198,122]`。`paper` 三通道之和 ≥ 600；`ink` 三通道之和 ≤ 200。禁止继续用现在的 `PAPER 18,22,36` 当纸色。
2. `paint.ts` 的 `PAPER` / `PANEL` / `INK` / `GOLD` / `FIELD` / 窗口描边改读 `THEME`。`paintWindow` 圆角 ≥ 16；浅填 + 彩色描边，不要暗金描边套海军蓝底。
3. `paintBackdrop` 改成浅天 + 浅草地（或等价亮色分带），不要近黑纸色铺满。
4. `packages/platform/src/lobby-boot.js` 大厅 Canvas 同步浅底与圆角主按钮，禁止 `#1a1410` 满屏。
5. `kit.ts` 按钮/术签/初始卡继续 `coverHit`；Q1 点中门仍绿。不改点击热区尺寸。

验收：`THEME` 单测 + 读源码断言 `lobby-boot.js` / `paintWindow` 不再用旧暗纸色。`pnpm check:forbidden`。

### A2 三初始卡通立绘

**Produces:** 灶狸、井蛛、桃梗三张卡通样品，透明底、无烘焙圆底。

必须：

1. 替换 `game/remote/spirits/{zao_li,jing_zhu,tao_geng}.png` 与 `assets/resources/remote/spirits/` 对应文件。RGBA，主体外透明。
2. 风格：赛璐璐卡通。少数大色、一根粗外轮廓、Q 版全身 3/4，二三档明暗加高光。禁止毛发丝、木纹、书法小字、绳结流苏，也禁止无阴影纯色块。剪影仍是本项目这三只，不是别家角色换色。
3. PNG 内不得烘焙圆形/椭圆底。
4. `pnpm check:pack` 仍不把立绘算进主包。其余 24 张本阶段不换。

验收：三文件存在且带 alpha；`PORTRAIT_IDS` 仍含这三只。

---

## 4. 明确不做

- 其余 24 张立绘重画（A2 之后另开）
- 新模式、聊天、支付、改底栏、改十八系
- 改 `policies.ts`、拧高档通关率
- 引入别家游戏素材、商标、角色剪影
- 往第 16 节加勾

---

## 5. 阶段完成的定义

一个 A 阶段完成 = 该阶段细计划全部勾完 **且**：

1. `pnpm test`、`pnpm check:forbidden` 通过
2. 改了 core → `pnpm sync:core`
3. 改了 UI → 质量规格第 3 节相关断言仍绿
4. 验收句能在测试名字或脚本输出里找到
