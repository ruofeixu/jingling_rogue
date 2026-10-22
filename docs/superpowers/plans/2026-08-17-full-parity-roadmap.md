# 精怪肉鸽全功能对标 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.  
> 本文件是总路线图。每个 F 阶段开工前另写该阶段的细计划（含失败测试与文件路径）。规格真源：[../specs/2026-08-17-full-feature-parity.md](../specs/2026-08-17-full-feature-parity.md)。

**Goal:** 在现有 30 波切片上，按规格把公开肉鸽的全部**系统**做完（机制对齐，内容原创）。

> 2026-08-20：F1–F12 对应的第 16 节已勾完。后续工作改走 [2026-08-20-quality-roadmap.md](./2026-08-20-quality-roadmap.md)，不要在本文件追加 F13。

**Architecture:** 继续 `packages/core` 纯逻辑 + Cocos 只订阅事件。新系统全部进 core 并 `pnpm sync:core` 打进 `assets/scripts/vendor/jinglingCore.ts`。禁止 Phaser、禁止上游源码、禁止官方名。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2 / FastAPI / 微信与抖音小游戏。

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/legal/forbidden-terms.md`、`docs/ip/spirit-bible.md`
- 改完跑 `pnpm test`、`pnpm check:forbidden`、涉及预览则 `pnpm sync:core`
- 核心不得 `import "cc"`；Cocos 脚本不得引用 `packages/` 路径（只引 vendor 包）
- 类名禁止：BattleScene、PhaseManager、MoveEffectPhase、globalScene
- 竖屏 750×1334；主包 4MB；立绘走 CDN
- 内容必须原创志怪，不搬上游文案与道具名
- 对照公开 wiki 描述，不读上游源码

---

## 现状（2026-08-17）

已完成：Rng、1v1 伤害、ClassicSlice 30 波、捕捉、三选一、本地存档、Cocos 预览选初始开战。  
未完成：规格第 16 节全部未勾项。旧 P4 摘要已并入全功能规格。

对照 wiki 后，旧稿漏了这些，新规格已补：无尽费用 15、5 波换境不回满、劫印、再择公式、封匣、动态权重、疫气、苛令只有 5 条、今日无购买、金契槽、移佩、5 存档槽。

## 文件归属

- 战斗规则：`packages/core/src/combat/`
- 流转：`packages/core/src/flow/`
- 局/账号：`packages/core/src/run/`、`packages/core/src/save/`、`packages/core/src/meta/`
- 商店：`packages/core/src/shop/`
- 配表：`packages/core/src/tables/`
- 预览 UI：`assets/scripts/Boot.ts`（后续拆 `assets/scripts/ui/`）
- 平台：`packages/platform/`
- 服务：`server/app/main.py`
- 规格：`docs/superpowers/specs/2026-08-17-full-feature-parity.md`

---

## 阶段对照规格第 16 节

| 阶段 | 覆盖 |
|------|------|
| F1 | 术/队伍/囊/走、队伍 6、换人、逃走 |
| F2 | 状态、能力级、挣扎、学术、效果块 |
| F3 | 魂契/隐契、佩饰、天时地脉场地、移佩结算 |
| F4 | 五档商店、再择公式、封匣、购买栏、动态权重、金契槽 |
| F5 | 经典 200、等级闸、固定战、强制奖励波、12 境域、山河图 |
| F6 | 训练师 AI、头目盾、镇世兽两阶段 |
| F7 | 双人、诱饵、显圣/巨灵/灵极 |
| F8 | 五模式、劫印、苛令 5 条、7 项解锁 |
| F9 | 卵房、孵券 Pity、灵糖、疫气、初始费用 10/15 |
| F10 | 奇遇 ≥24、合体、成就机制、缎带 |
| F11 | 内容规模、界面全套、设置五类、契录见/收 |
| F12 | 5 槽云存档、wx/tt 包、CDN、主包 4MB |

---

### 阶段 F1：队伍 6 与战斗指令

**Files:** `packages/core/src/combat/`、`packages/core/src/run/classic-slice.ts`、`assets/scripts/Boot.ts`

**Produces:** 上场 1 只、后备最多 6；指令术/换/囊/走；濒死强制换人；野遇可走、训练师不可走。

- [ ] 写失败测试：6 只队伍、换人后新实体进场、野遇可走、训练师不可走
- [ ] 实现最小 `PartyBattle`（保留 `startDuel` 给单测）
- [ ] 预览增加换人 / 走
- [ ] `pnpm test` 通过并 `pnpm sync:core`

### 阶段 F2：术法效果库与状态

**Files:** `packages/core/src/combat/effects/`、`packages/core/src/tables/arts.json`

**Produces:** 可组合效果块覆盖规格第 4 节（状态、能力级、多段、守、替身、吸取、挣扎）。不是每个术一个 switch。

- [ ] 测试：灼烧削攻、剧毒叠层、多段次数、守当回合无效、灵力耗尽挣扎
- [ ] 实现效果块并给现有 40 术挂真实效果
- [ ] 扩到 ≥80 术后再进 F3

### 阶段 F3：魂契、佩饰、天时地脉、场地

**Files:** `packages/core/src/combat/pact.ts`、`charm.ts`、`field.ts`、`tables/pacts.json`、`boons.json`

**Produces:** 魂契入伤/出伤/换人触发；佩饰场上结算；天时/地脉/壁/钉；商店移佩在战斗生效。

- [ ] 测试：雨天潮术加成、钉换人伤、佩饰回合回血、移佩后结算对象改变
- [ ] 实现并接入伤害公式

### 阶段 F4：战后五档商店与再择

**Files:** `packages/core/src/shop/`、`tables/boons.json`

**Produces:** 规格第 5 节：凡/上/特/奇/劫概率、再择公式、封匣、购买栏按波解锁、动态权重、金契槽 3–6、移佩 UI 数据。

- [ ] 测试：`cost = 250 * ceil(w/10) * 2^R`；波 25 强制 1 特 2 上；残血提高药权重；金契槽使选项变 4
- [ ] 替换当前「仅三选一机缘」为完整商店
- [ ] 预览商店 + 再择 + 购买栏

### 阶段 F5：经典 200 波与固定战

**Files:** `packages/core/src/run/classic-schedule.ts`、`tables/realm-graph.json`、`trainers.json`

**Produces:** 规格 2.1 波次表、等级闸全表、头目护盾、镇开局邻接、山河图。`ClassicSlice` 支持 200 波。至少 12 境域表。

- [ ] 测试：波 8 同行者、波 20/30 首城主各 50%、闸 10 波 10 级、波 165 含封匣
- [ ] debug 跳波便于预览

### 阶段 F6：训练师 AI 与镇世兽两阶段

**Files:** `packages/core/src/combat/trainer-ai.ts`、`boss.ts`

**Produces:** 训练师选术/换人；镇世兽末盾变形、回盾+1、迷途吞、转双人、超闸加威力。

- [ ] 测试：二阶段回盾且场上 2 目标；AI 优先有效术；超闸炮威力分段
- [ ] 预览可打到缩短版（debug 跳波）验证

### 阶段 F7：双人战与显圣/巨灵/灵极

**Files:** `packages/core/src/combat/side.ts`、`form-change.ts`

**Produces:** 2v2 速度条与点选目标；三种战斗形态；诱饵叠层；同行者 4 战发灵极器。

- [ ] 测试：双人点选目标；显圣结束退回；无尽 50 波头目不可双人
- [ ] 诱饵机缘提高双人遭遇率

### 阶段 F8：五种模式

**Files:** `packages/core/src/run/modes/`、`packages/core/src/run/night-marks.ts`

**Produces:** 经典、今日试炼 seed、无尽（费用 15、5 波换境、劫印）、长夜·合体、苛令五条、7 项解锁。

- [ ] 测试：同日 seed 序列稳定；翻转后炎打潮为 2 倍；无尽波 6 换境且不回满；波 50 叠 1 劫印；白纸只有三初始
- [ ] 标题界面选模式（Cocos）

### 阶段 F9：卵、孵券、灵糖、疫气、初始费用

**Files:** `packages/core/src/meta/eggs.ts`、`candy.ts`、`miasma.ts`、`tables/eggs.json`

**Produces:** 四档孵券、Pity、三池、卵槽步数、费用 10/15、骨相继承、每日 5 疫气、扩散 ×1.5 经验。

- [ ] 测试：金券 25 卵且含史诗；灵糖降费；UTC 日界 5 个疫气稳定；扩散后队友享 1.5×
- [ ] 大厅卵房 UI

### 阶段 F10：奇遇、合体、成就

**Files:** `packages/core/src/run/omen-event.ts`、`fusion.ts`、`achievements.ts`

**Produces:** ≥24 奇遇（覆盖规格第 8 节机制类型）、双生契、成就机制全集、缎带、未化骨解锁。

- [ ] 测试：奇遇选项改金钱；合体灵性各一；成就只触发一次；携幼通关后未化骨入池
- [ ] UI：奇遇文案页、队伍合体操作

### 阶段 F11：内容填满与界面全套

**Files:** `packages/core/src/tables/*`、`assets/scripts/ui/`

**Produces:** 精怪 ≥120、术 ≥180、境域 12、奇遇 24；契录见/收、摘要/移佩、设置五类、败北/通关结算。无尽境域扩到 ≥30 可放 F11 末或运营表。

- [x] 配表校验脚本拒绝缺字段与禁用词
- [x] 拆分 Boot.ts，按界面文件
- [x] 规格第 12 节界面清单逐项可点

### 阶段 F12：云存档与双端包

**Files:** `server/`、`packages/platform/`、`game/templates/`、`assets/` CDN

**Produces:** 5 槽真机登录云存档；冲突留本地/用云端；微信/抖音构建；远程立绘清单；可选今日战绩榜。

- [x] 服务端测试补每日榜可选接口
- [x] 构建清单与合法域名文档
- [x] 主包体积检查 ≤4MB

---

## 阶段完成后再做

规格第 13 节「无尽可玩」内容扩到 240 精怪、40 奇遇。那是运营扩表，不阻塞 F12 系统验收（境域邻接 ≥30 若 F11 未做完，可与扩表一起）。

## 每个阶段的共同收尾

```bash
pnpm test
pnpm check:forbidden
pnpm sync:core
```

预览：`http://localhost:7456/` 能点完该阶段新界面。对照规格第 16 节勾选本阶段条目。

## 执行约定

1. 一次只做一个 F 阶段。
2. 开工前为该阶段写细计划到 `docs/superpowers/plans/2026-08-17-F<n>-<slug>.md`（含失败测试代码）。
3. 细计划写完再改代码。
