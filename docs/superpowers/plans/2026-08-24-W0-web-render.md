# W0 可截图渲染层 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** agent 能在无头环境里把任意一屏画成 PNG 并自己看，不再依赖 Cocos Creator 预览。本阶段只覆盖开场一屏，跑通链路。

**Architecture:** core 新增「绘制清单」中间层。`buildScene(app, ui)` 读 `PreviewApp` 状态与 `ScreenLayout`，输出纯数据的绘制指令数组；后端把清单画出来。本阶段只做 PNG 后端。Cocos 保留不动。

```
PreviewApp.tap()  ->  buildScene()  ->  DrawCmd[]  ->  PNG 后端（本阶段）
   已有                  W0 新增          纯数据        Cocos 后端（后续 W 阶段）
```

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 不提交 git
- 不改 `policies.ts`、不挪 `HIT_MIN` / `coverHit`
- 本阶段不动 `assets/scripts/`，Cocos 侧零改动

## 待拍板：为什么是「绘制清单」而不是直接写一个 Canvas 渲染器

直接照着 `lobby.ts` 再写一份 Canvas 版最快出图，但会有两套屏幕逻辑，改一处忘一处，正是要避免的漂移。清单层多一次转换，换来三件事：

1. 布局断言可以直接查几何和颜色，不用再 grep 源码字符串。`creator-entry.test.ts` 现在大量在断言 `addText(node, "label", ... 24, INK` 这种源码子串，脆而且不证明任何实际结果。
2. 后续把 Cocos 换成 Canvas 时，屏幕逻辑一行不用改，只换后端。
3. 清单本身可以在 vitest 里跑，出图只是第二层保险。

代价：多一层抽象；`PreviewApp` 目前只有状态不含几何，`buildScene` 要把 `lobby.ts` 的摆放规则搬进 core。

## 待拍板：出图不走浏览器

`PreviewApp.tap(label)` 已经能无头驱动全部界面，所以截图链路根本不需要浏览器点按钮。用 `@napi-rs/canvas`（预编译二进制，无需 Chromium）在 node 里直接把清单画成 PNG，快且不会挂。

真浏览器/Playwright 留到后续阶段——等 Canvas 渲染器要变成实际上线运行时、需要验证真实输入与缩放时再引入。

---

### Task 1: 绘制清单类型与开场屏

**Files:** `packages/core/src/ui/scene.ts`、`packages/core/src/ui/scene.test.ts`、`index.ts`

- [x] 失败测试：开场屏清单含标题「契灵志怪」、八个按钮标签、「新的旅途」为主按钮；每个按钮矩形都落在菜单窗内；文字不超出各自框
- [x] 定义 `DrawCmd`（`backdrop` / `window` / `text` / `icon`）与 `buildScene(app, ui)`
- [x] 只实现 `screen === "title"`，其余屏只出顶栏日志这类外壳，不出大厅按钮
- [x] 导出 `buildScene`、`DrawCmd`；`pnpm test`

坐标沿用 `layout.ts` 的中心原点、y 向上，后端负责翻成画布坐标，这样断言和 `layout.test.ts` 同一套。`TITLE_MENU`（标签＋图标＋主按钮）现在是 core 与 `lobby.ts` 各存一份，后续阶段让 `lobby.ts` 改读 core 这份。

---

### Task 2: PNG 后端

**Files:** `packages/platform/src/scene-png.ts`、`scene-png.test.ts`、`packages/platform/package.json`

- [x] 加依赖 `@napi-rs/canvas`（理由：无浏览器出图，预编译无需本机编译）；放 devDependencies，只给开发工具用，不进小游戏运行时
- [x] `paintScene` 返回画布供像素断言，`renderScenePng` 返回 PNG buffer；圆角、双描边、SHRINK 与换行都照 `paint.ts`
- [x] 测试：尺寸 750×1334、天空是纸色、地带是草色、主按钮是主色、PNG 魔数、标题处有墨迹
- [x] `pnpm test`

图标配色原来只在 `paint.ts` 里，已挪进 core 的 `iconFill()`，`THEME.slip` 同理；`paint.ts` 改读这两处留到下一阶段（现在两边各存一份字面量）。字体在 node 里要自己注册，按 PingFang → Hiragino → Noto CJK → 文泉驿 顺序找，找不到退回 sans-serif。

---

### Task 3: 截图脚本

**Files:** 根 `package.json`、`packages/platform/src/shot-cli.ts`

- [x] `pnpm shot` 走一遍 `PreviewApp`，把每一屏写到仓库根的 `.shots/`（已 gitignore）
- [x] 本阶段只有开场屏，竖屏与横屏各一张
- [x] `pnpm test`、`pnpm check:forbidden`、`pnpm check:pack`（主包 443699 字节未变）

---

## 本阶段完成的定义

1. [x] `pnpm shot` 产出开场屏 PNG，agent 直接读得到
2. [x] `pnpm test`（core 216 + platform 17）、`pnpm check:forbidden` 通过
3. [x] `assets/scripts/` 零改动，Cocos 预览行为不变

## 第一次真看到画面后记下的毛病

链路一通就抓到几个纯靠读代码看不出来的问题，留给下一阶段：

1. 横屏大标题压在顶栏上：`splashY` 248 加 36 偏移后文字框上沿 320，顶栏下沿 300，实打实重叠，现有布局测试没覆盖这一对
2. 背景那根装饰橙柱被菜单面板压掉一半，只剩左边一个半圆和一小截竖条，看着像渲染事故
3. 绿色地带下沿又切回浅蓝，屏幕下方出现第二条地平线
4. 草地上那两个椭圆装饰完全看不见——都落在同色绿带内部，白画
5. 竖屏标题到菜单之间空 300px，菜单到底部日志之间又空 260px，中间一大片空地
6. 顶栏重复了一遍「契灵志怪」，和正下方的大标题撞车
7. 32px 的圆点图标分不出种类，等于装饰噪点
