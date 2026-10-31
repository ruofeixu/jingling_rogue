# I2a：水墨 token 与程序化控件（2026-10-31）

> **上游：** [PvP 与水墨路线图](./2026-10-29-pvp-ink-roadmap.md) 的 I2（= 内测路线图 B5 的第一部分）。规格：[../specs/2026-10-29-ink-design.md](../specs/2026-10-29-ink-design.md) 第 3.1、4、5 节。
> 本阶段只做**不需要新素材、不需要负责人看图就能验证**的部分（a），贴图、背景、书法字体留给 I2b。

**Goal：** 全部颜色换成定稿的宣纸/墨/朱砂色板，对比度审计按新色板通过；程序化画法（缺贴图时的回退）不再画卡通"果冻"质感。

## 范围

做：
- `THEME`（core）换成 3.1 节色板，命名为 `xuan`；补 `gold`（赭金，给"钱"类图标用，不再借朱砂）。血条色 `HP_COLOR` 换成水墨版。
- 一级按钮文字改为宣纸色（墨字压朱砂只有 2.29:1）；禁用的一级按钮底色改为 `slip`（淡墨字压朱砂只有 1.12:1，看不清）。
- `real-tokens.test.ts`：真实组合按新取色更新；反向用例改为"墨字压朱砂必须被抓住"。
- `paint.ts`、`item-icon.ts` 里的硬编码颜色改为从 `THEME` 取（规格第 4 节）。
- `Panel.ts` / `Button.ts` 的 Graphics 回退：去掉底部立体厚边和顶部高光条，改为平涂 + 细墨边（规格第 5 节"边框程序化"）。

不做（I2b，需要负责人或看图）：
- 9-slice 笔触贴图、宣纸背景贴图、血条贴图（要出图并人工验收）。
- 书法标题字（负责人清单第 13 项：字体授权）。
- 多套色板切换（规格 3.2，本版不做，只把当前色板命名为 `xuan` 留口子）。

## 任务

### Task 1：色板（RED → GREEN）
- [x] `theme.test.ts` 改锁水墨值，保留亮度约束（纸通道和 ≥600、墨 ≤200、slip 比 accent 亮）。先红。
- [x] `theme.ts` 换值；导出 `THEME_NAME = "xuan"`；新增 `gold`。
- [x] `hp.test.ts` 锁新血条色；`tokens.ts` 换 `HP_COLOR`。

### Task 2：对比度与按钮取色
- [x] `real-tokens.test.ts`：一级按钮文字对 `paper / accent`；禁用一级按钮 `muted / slip`；新增 `accent / paper`（朱砂强调字压纸）；反向用例改为 `ink / accent` 必须失败。
- [x] `Button.ts`：一级按钮文字 `COLOR.paper`，禁用按钮底色 `COLOR.slip`，边 `COLOR.edge`。
- [x] `a11y.test.ts` 的基础组合仍过。

### Task 3：硬编码颜色收进 token
- [x] `paint.ts` 的 `SLIP / MUTED / HP_*` 从 `THEME` 取。
- [x] `item-icon.ts` 的 `gold` 取 `THEME.gold`；`item-icon.test.ts` 改为 `gold === THEME.gold`，并保留"每个图标在纸上读得出"。

### Task 4：程序化控件去卡通
- [x] `Panel.ts`、`Button.ts` 回退画法：一层平涂主体 + 一条 `edge` 细描边，不画立体厚边与高光条。`u16-skin-skeleton.test.ts` 的契约（有 Sprite 路径、有 Graphics 回退、不写颜色字面量）保持。

### Task 5：验证
- [x] `pnpm test`、`pnpm check:forbidden`、`pnpm sync:core`、`pnpm sync:presentation`、`assets/scripts/app/` strict 类型检查。
- [ ] **人工看图（需负责人）**：Cocos 预览里看 title / starter / battle / summary / victory。本机无预览时记未完成。

## 执行记录（2026-10-31）

- 色板：`THEME` 换成规格 3.1 的八色，加 `THEME_NAME = "xuan"`、`gold`（赭金 150,112,40）和水墨血条色。血条与图标是非文字图形，按 WCAG 3:1 选值，对纸底和血槽都过：

| 色 | RGB | 对纸底 | 对血槽 |
|---|---|---|---|
| hpHigh / 我方 | 86,124,92 | 4.02 | 3.28 |
| 敌方 | 176,84,60 | 4.27 | 3.47 |
| hpMid | 150,106,36 | 4.07 | 3.31 |
| hpLow / 残血 | 140,32,26 | 7.63 | 6.21 |
| gold | 150,112,40 | 3.84 | 3.13 |

- 按钮：一级按钮宣纸色字压朱砂（5.85:1）；禁用的一级按钮退到 slip 底（淡墨压朱砂只有 1.12:1）。对比度审计新增"朱砂强调字压纸"（5.85:1）；反向用例改为"墨字压朱砂必须被抓住"。
- 硬编码颜色：`paint.ts` 的次级底、淡墨、血条色、白色高光、倒下圆点全部改取 `THEME`；`paint.ts` 删掉自带的 18 色图标表，改用 core 的 `iconFill`（新导出到 creator-entry），web 与 Cocos 两端图标同色。小游戏首屏 `lobby-boot.js` 换宣纸底、浓墨字、朱砂按钮配宣纸色字。
- 程序化控件：`Panel.ts`、`Button.ts` 的回退画法去掉卡通的底部立体厚边与顶部高光条，改为平涂 + 半宽淡墨细边。
- 被改写的测试（都是锁卡通字面量的，改为锁 token）：`theme.test.ts`、`hp.test.ts`、`item-icon.test.ts`、`creator-entry.test.ts`（paint.ts 与 lobby-boot 的颜色断言）、`preview-pack.test.ts`、`real-tokens.test.ts`。没有删除任何非颜色断言。
- `pnpm test`：core 279 / presentation 358 / platform 17；禁用词 clean；vendor 一致。`assets/scripts/app/` strict 类型检查无报错；`assets/scripts/ui/lobby.ts:206, :447` 两处 `Label` 传给 `Node` 参数的类型错误在 HEAD 就有，属于旧 Boot 绘制路径（`LEGACY_BOOT = false` 时不走），未改。
- **人工看图未完成**：本机无 Cocos 预览。

## 退出证据

对比度审计全过；`pnpm test` 全绿；人工看图项或"未完成"记录。
