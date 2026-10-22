# W2 视觉整改 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 W0/W1 看图攒下的 13 条毛病改掉，重截 48 张对比确认。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 不提交 git
- 不改 `policies.ts`、不挪 `HIT_MIN` / `coverHit`

## 待拍板：改动只落在 core 与 PNG 后端

`creator-entry.test.ts` 有 175 条针对 `paint.ts` / `Boot.ts` 源码字符串的断言，动 Cocos 侧要连带重写一大片脆测试，而且改完也验证不了——本机跑不起 Creator 预览。

所以这一阶段：

- 位置、尺寸一律改 `layout.ts`。Cocos 读的是同一份，`pnpm sync:core` 后自动跟上
- 配色、文案改 `theme.ts` / `copy.ts`，同理自动跟上
- 背景装饰与图标的**形状**只改 PNG 后端。这块 Cocos 侧暂时对不上，等它改读绘制清单才收口

---

### Task 1: 坊市与文案

- [x] `boonKindLabel` 覆盖 boons.json 全部 33 种 kind，加测试断言一个不漏、且不回落成英文 id
- [x] 增益卡按面板宽度均分算位置与宽度，三张卡完整落在面板内

### Task 2: 背景

- [x] 去掉那根穿模的装饰橙柱
- [x] 草地色带一直铺到屏幕下沿，消掉第二条地平线
- [x] 土丘椭圆改成骑在地平线上、用略深的草色，让它真的看得见

### Task 3: 图标

- [x] 按钮图标 32 → 36
- [x] `atk/def/spd/hp/exp/catch/map/lure` 八种从「都是圆点」改成各自的形状

### Task 4: 开场屏与大厅

- [x] 横屏大标题下移，与顶栏不再重叠
- [x] 竖屏按钮加大、行距加宽，菜单面板贴合内容，消掉标题与菜单之间那 300px 空白
- [x] 顶栏在大厅屏改显账号信息，不再和大标题重复

### Task 5: 战斗屏

- [x] 敌方立绘下移到草地上，不再飘在天空带里
- [x] 指令格从右下角改为居中，左半边不再整块浪费
- [x] 「回厅」从顶栏挪到指令区
- [x] 队伍托盘画满六格，不再只剩一个点

### Task 6: 重截对比

- [x] `pnpm shot` 重出 48 张，逐屏确认 13 条都改掉且没引入新问题
- [x] `pnpm test`、`pnpm check:forbidden`、`pnpm sync:core`、`pnpm check:pack`

---

## 本阶段完成的定义

1. [x] 13 条毛病逐条对着截图确认改掉
2. [x] 场景几何断言（在屏内、不重叠、不出框）全部保持绿
3. [x] `pnpm test`、`pnpm check:forbidden` 通过

## 验证（2026-08-24）

- core 219 / platform 17 全绿
- `check:forbidden` clean
- 主包 444165 字节
- `.shots/` 48 张

评审时顺手修了两处新毛病：开卵屏补了剪影；局内「返回/回厅」改坐在面板内沿，不再骑描边。

## 留给后续的（需另写规格，不在 W3）

- 立绘仍是剪影，真图要等异步贴图
- PNG 后端的图标形状尚未回灌 Cocos（等它改读绘制清单）
