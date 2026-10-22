# W1 全屏绘制清单 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `buildScene` 覆盖 `PreviewScreen` 全部 23 屏，`pnpm shot` 一次跑出全部界面的 PNG，之后才有资格统一评审视觉。

**Architecture:** 沿用 W0 的绘制清单。core 里按屏补 `buildScene` 分支，PNG 后端只在需要新图元时才动。Cocos 仍然不碰。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 不提交 git
- 不改 `policies.ts`、不挪 `HIT_MIN` / `coverHit`
- 本阶段仍不动 `assets/scripts/`，Cocos 侧零改动
- 本阶段只搬摆放规则，不顺手改视觉。W0 记下的那七个毛病一个都不在这里修，留到 W2 统一改，否则截图基线和评审会混成一团

## 23 屏分三族

| 族 | 屏 | 来源 |
|---|---|---|
| 大厅 | title mode starter settings codex eggs achievements stats slots glossary hatch | `lobby.ts` + `Boot.showModePick/showStarterPick` |
| 局内面板 | shop map omen summary catch defeat victory | `Boot.showShop/showSummary/paintEndSheet` |
| 战斗 | battle arts switch bag target | `Boot.drawBattleField/drawPlates/drawMainCommands/drawArts/showBag` |

## 待拍板：立绘先画剪影

`paintPortrait` 有真图就贴图、没有就画属性色剪影。PNG 后端要贴真图就得 `loadImage` 变异步，整条链路跟着异步化。本阶段全部按剪影画，`portrait` 指令带上 `spiritId`，等真要评审立绘质量时再单独加一步异步版出图。

代价：契录详情页和选灵页的截图暂时看不出立绘好坏，只能看版式。

---

### Task 0: 巡游表（原计划没有，做的时候发现必须先有）

**Files:** `packages/core/src/ui/tour.ts`、`tour.test.ts`

- [x] 光靠一串 tap 到不了全部屏：收契要先把敌人打残，多敌选目标要 `run.forceDual`，胜败要 `noteWin` / `noteLoss`
- [x] `TOUR` 每站给一个 `open(seed)` 函数，测试断言每站真的落在它承诺的屏，且 23 屏一个不缺

### Task 1: 通用图元与大厅族

**Files:** `packages/core/src/ui/scene.ts`、`scene.test.ts`

- [x] 抽出 `drawSlip` / `panelWindow` / `panelCopy` / `spiritCard` / `nameplate`，开场屏改用它们
- [x] 新增 `portrait` 与 `bar` 指令类型（卡片直接拆成 window + portrait + text，不另立类型）
- [x] 补 mode、settings、eggs、achievements、stats、slots、glossary、hatch 八屏
- [x] 补 codex 列表页与详情页、starter 选灵页
- [x] 失败测试先行：画出来的按钮集合与 `tappableLabels(app)` 双向相等
- [x] 每屏所有指令都在屏内、按钮互不重叠、按钮内的图标文字不出框
- [x] `pnpm test`

### Task 2: 局内面板族

**Files:** `packages/core/src/ui/scene.ts`、`scene.test.ts`

- [x] 补 shop、map、omen、summary、catch、defeat、victory 七屏
- [x] 同样断言标签集合与 `app.labels()` 一致
- [x] `pnpm test`

### Task 3: 战斗族

**Files:** `packages/core/src/ui/scene.ts`、`scene.test.ts`、`packages/platform/src/scene-png.ts`

- [x] 新增 `bar` 图元，铭牌拆成 window + text + bar，PNG 后端补画立绘剪影与血条
- [x] 补 battle、arts、switch、bag、target 五屏
- [x] `pnpm test`

### Task 4: 全屏截图

**Files:** `packages/platform/src/shot-cli.ts`

- [x] `pnpm shot` 按巡游表走到每一屏，竖屏横屏各出一张
- [x] 走错屏就抛错退出
- [x] `pnpm test`、`pnpm check:forbidden`、`pnpm check:pack`（主包 443848 字节）

---

## 本阶段完成的定义

1. [x] `pnpm shot` 一次产出 48 张 PNG（24 站 × 竖横，契录列表页与详情页各算一站）
2. [x] 每屏都有断言把画出来的按钮和 `tappableLabels(app)` 双向对齐
3. [x] `pnpm test`、`pnpm check:forbidden` 通过，`assets/scripts/` 零改动

## 几何断言当场抓到的三个真 bug（已修）

1. 横屏底部日志板有 15px 悬在屏外——横屏截图里就是被切掉的那一条。把 `message` / `log` 从 -348 提到 -316，指令格从 -205 提到 -175 腾地方
2. 选目标屏两个敌人按钮重叠：按钮默认宽 220，而 `menuDx` 只有 168。换屏两侧菜单一律用 `min(buttonW, menuDx - 8)`
3. 术签的术名文字上沿超出术签框 5px

## 与 Cocos 的已知分歧（留给后续阶段）

- Cocos 在术签、换人、囊三个子菜单上还画了「回厅」「跳10波」，`PreviewApp` 的控制表里没有。绘制清单以 `PreviewApp` 为准，所以这几个按钮在新链路里暂时消失
- `TITLE_MENU`、`THEME.slip`、`iconFill`、`boonKindLabel` 现在 core 与 `paint.ts` / `Boot.ts` 各存一份，等 Cocos 侧改读 core 才算收口

## 看完 48 张之后攒下的视觉问题（W2 处理）

沿用 W0 记的那七条，再加这轮新看到的：

8. 战斗屏中间一大片空地：敌方立绘飘在天空带里、我方立绘孤零零站在草地中央，指令挤在右下角，左半边整块浪费
9. 坊市的三张增益卡左右和下沿都戳出面板外，卡片比装它的框还大
10. 增益卡上的类别标签直接显示 `charm`、`sealPack` 这种英文 id，`boonKindLabel` 没覆盖到这两类
11. 选灵屏顶栏到镇物行之间空 180px，装饰橙柱从这片空地里穿过并被镇物按钮压住
12. 队伍托盘只剩铭牌下面一个小圆点，看不出是队伍
13. 战斗屏的「回厅」挤在顶栏左端和「？」贴在一起，像是从顶栏里长出来的
