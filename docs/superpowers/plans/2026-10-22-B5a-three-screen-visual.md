# B5a：标题 / 选宠 / 战斗三页视觉收口（2026-10-22）

> **For agentic workers:** 按任务顺序执行，一次一个任务；每个任务先 RED 再实现。Steps 用 `- [ ]` 跟踪。

**上游：** [内测准备路线图](./2026-10-01-internal-beta-roadmap.md) 的 B5「视觉打磨与游戏感」，按用户要求提前、且只覆盖三页。

**Goal：** 让真实入口下的 title / starter / battle 三页达到设计稿（`docs/ui/design-mockups/renders/{title,battle}.png`）的结构与质感：有主视觉、有主次层级、战场上有精怪和血条。

**Architecture：** 几何放进 presentation 的纯函数（可无头测试），renderer 只按盒子摆节点。战斗/选宠需要的结构化数据（血量、精怪 id、选中项）作为该页专属的扩展模型字段透传，不改通用 `ScreenModel`、不改 core。控件沿用 AppShell 已有的程序化果冻按钮/面板（厚描边 + 底部立体边 + 顶部高光），本阶段不生成新图。

**Tech Stack：** Cocos Creator 3.8.2、TypeScript、vitest、esbuild（`pnpm sync:presentation`）。

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`（AGENTS.md）。
- presentation 不建节点、不读设备、不算玩法（ADR-0001）。renderer 不从文案反推命令或数值。
- 热区 ≥ 44×44（`MIN_HIT_SIZE`）；禁用按钮必须有原因。
- 立绘等比 contain（`portraitFit`），身后不垫椭圆底（卡通验收 A0）。
- 减少动效下任一动画 ≤ `MOTION.reducedMaxMs`（150ms）。
- 每个任务结束：`pnpm test`、`pnpm check:forbidden`；改 presentation 后 `pnpm sync:presentation`。
- 产出截图的验证必须逐张肉眼看（ui-productization 规格 6.1.1）。

## 前置门（Task 0）

B2「单一 UI 入口」由另一会话进行中（Boot → AppShell，`launchProductShell` / `routeAfterCommand`）。它改 `AppShell.ts`、`Boot.ts`、presentation `index.ts` 与两份 vendor。**B2 落地前本计划不改任何代码**，避免双方覆盖。

- [x] 另一会话结束（transcript 末行为 `turn_ended` 且 ≥2 分钟无写入）。
- [x] `rg launchProductShell assets/scripts/Boot.ts` 有结果；`pnpm test` 全绿（2026-10-22 10:54，core 249 / presentation 302 / platform 17）。
- [ ] 从 `boot.scene` 真入口拍 title / starter / battle 竖屏新基线。**卡住：** `localhost:7456` 没有预览进程。对比基线暂用 `docs/ui/baselines/evidence/2026-09-30/`，Task 8 重拍。

## 美术决定（已定，不阻塞）

| 资产 | 决定 | 理由 |
|---|---|---|
| 13 个 `icon_*` | 保留 | 粗描边、糖果色、果冻光泽，与卡通立绘同族 |
| `portraits/spirits/*`（卡通版） | 保留 | 已过 A2；`deng_e`、`she_mu` 细节密度偏高，记为后续重画候选，本阶段不动 |
| `bg_lobby` / `bg_battle` / `bg_indoor` | 保留 | 偏写实，但 UI 用不透明奶白面板压得住；若肉眼验收发现抢戏，再加 25% 白蒙层 |
| 面板 / 按钮 / 名牌 / 血条 | 程序化 | 生成规范第 7 节：模型出的 9-slice 四角不对称，拉伸变形 |

截图里的「廉价感」主因是旧 Boot 的扁平色块控件和布局，不是图本身；B2 切到 AppShell 后控件质感自动对齐设计稿。

## 文件结构

| 文件 | 职责 |
|---|---|
| Create `packages/presentation/src/layout/box.ts` | `Box` 类型与 `overlaps` / `inside` 判定 |
| Create `packages/presentation/src/layout/battle-layout.ts` | 战斗页几何（竖/横） |
| Create `packages/presentation/src/layout/title-layout.ts` | 标题页几何 |
| Create `packages/presentation/src/layout/starter-layout.ts` | 选宠页几何 |
| Create `packages/presentation/src/layout/hp.ts` | 血量比例与色调 |
| Create 对应 `*.test.ts` | 无重叠、在内容框内、热区、拇指区 |
| Modify `packages/presentation/src/tokens.ts` | 新增 `HP_COLOR` |
| Modify `packages/presentation/src/screens/battle.ts` | 返回 `BattleScreenModel`（含 `plates`） |
| Modify `packages/presentation/src/screens/starter.ts` | 返回 `StarterScreenModel`（含 `selectedId`） |
| Modify `packages/presentation/src/index.ts` | 导出上述 |
| Create `assets/scripts/app/ui/HpBar.ts` | 血条节点（槽 + 填充 + 数字） |
| Modify `assets/scripts/app/screens/{Battle,Title,Starter}Screen.ts` | 按 layout 盒子摆放 |
| Modify `assets/scripts/app/ui/Button.ts` | 按下缩放反馈 |

坐标约定：所有 `Box` 为**中心点坐标**，原点在内容框中心，y 向上（与现有 renderer 一致）。

---

### Task 1：Box 工具与血量函数

**Files：** Create `layout/box.ts`、`layout/hp.ts`、`layout/hp.test.ts`；Modify `tokens.ts`

**Produces：**
- `interface Box { x: number; y: number; width: number; height: number }`
- `overlaps(a: Box, b: Box): boolean`（边相接不算重叠）
- `inside(inner: Box, width: number, height: number): boolean`
- `hpRatio(hp: number, maxHp: number): number`（夹到 0..1；maxHp ≤ 0 返回 0）
- `hpTone(side: "ally" | "foe", ratio: number): "ally" | "foe" | "low"`（ratio ≤ 0.25 → `low`）
- `HP_COLOR = { track, ally, foe, low }`（`#e3edf5`、`#6ed07a`、`#ff8f8f`、`#ff6b4a`）

- [x] RED：`hp.test.ts`（先因 `./box.ts` 不存在失败，再实现）

```ts
import { describe, expect, it } from "vitest";
import { hpRatio, hpTone } from "./hp.ts";
import { inside, overlaps } from "./box.ts";

describe("hp", () => {
  it("clamps the ratio to 0..1 and survives a zero max", () => {
    expect(hpRatio(12, 32)).toBeCloseTo(0.375);
    expect(hpRatio(-3, 32)).toBe(0);
    expect(hpRatio(40, 32)).toBe(1);
    expect(hpRatio(5, 0)).toBe(0);
  });

  it("keeps side colors until a quarter, then warns", () => {
    expect(hpTone("ally", 0.5)).toBe("ally");
    expect(hpTone("foe", 0.5)).toBe("foe");
    expect(hpTone("ally", 0.25)).toBe("low");
    expect(hpTone("foe", 0)).toBe("low");
  });
});

describe("box", () => {
  it("treats touching edges as not overlapping", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    expect(overlaps(a, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
    expect(overlaps(a, { x: 9, y: 0, width: 10, height: 10 })).toBe(true);
  });

  it("checks a box against a centered content frame", () => {
    expect(inside({ x: 0, y: 0, width: 100, height: 100 }, 100, 100)).toBe(true);
    expect(inside({ x: 1, y: 0, width: 100, height: 100 }, 100, 100)).toBe(false);
  });
});
```

- [x] 跑 `pnpm --filter @jingling/presentation exec vitest run src/layout/hp.test.ts`，预期因模块不存在失败。
- [x] 实现（类型名用 `LayoutBox`，避开 a11y 里只有宽高的 `Box`）：

```ts
// layout/box.ts
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const EPS = 1e-6;

export function overlaps(a: Box, b: Box): boolean {
  return (
    Math.abs(a.x - b.x) * 2 < a.width + b.width - EPS &&
    Math.abs(a.y - b.y) * 2 < a.height + b.height - EPS
  );
}

export function inside(inner: Box, width: number, height: number): boolean {
  return (
    inner.x - inner.width / 2 >= -width / 2 - EPS &&
    inner.x + inner.width / 2 <= width / 2 + EPS &&
    inner.y - inner.height / 2 >= -height / 2 - EPS &&
    inner.y + inner.height / 2 <= height / 2 + EPS
  );
}
```

```ts
// layout/hp.ts
export type HpTone = "ally" | "foe" | "low";

const LOW = 0.25;

export function hpRatio(hp: number, maxHp: number): number {
  if (!(maxHp > 0)) return 0;
  return Math.max(0, Math.min(1, hp / maxHp));
}

export function hpTone(side: "ally" | "foe", ratio: number): HpTone {
  return ratio <= LOW ? "low" : side;
}
```

`tokens.ts` 追加：

```ts
/** 血条色。不进 COLOR：COLOR 与 core THEME 一一对应。 */
export const HP_COLOR = Object.freeze({
  track: [227, 237, 245] as Rgb,
  ally: [110, 208, 122] as Rgb,
  foe: [255, 143, 143] as Rgb,
  low: [255, 107, 74] as Rgb,
});
```

- [x] 测试转绿。presentation 307 通过（含新增 5 项），`check:forbidden` 干净。全量 `pnpm test` 在改动前已绿，本任务只加了 presentation 纯函数。

### Task 2：战斗/选宠模型补结构化字段

**Files：** Modify `screens/battle.ts`、`screens/battle.test.ts`、`screens/starter.ts`、`screens/starter.test.ts`、`index.ts`

**Produces：**
- `interface PlateModel { spiritId; name; level; hp; maxHp; status }`
- `interface BattleScreenModel extends ScreenModel { readonly plates: { readonly foe: PlateModel; readonly ally: PlateModel } }`
- `buildBattleModel(): BattleScreenModel`
- `interface StarterScreenModel extends ScreenModel { readonly selectedId: string | null }`
- `buildStarterModel(): StarterScreenModel`

- [x] RED（battle.test.ts 追加）：

```ts
it("exposes structured plates so the renderer never parses text", () => {
  const model = buildBattleModel({ state: "normal", view });
  expect(model.plates.foe).toEqual({ spiritId: "deng_e", name: "灯蛾", level: 1, hp: 32, maxHp: 32, status: "常态" });
  expect(model.plates.ally.spiritId).toBe("zao_li");
  expect(Object.isFrozen(model)).toBe(true);
});
```

- [x] RED（starter.test.ts 追加）：`buildStarterModel({... selectedId: "zao_li"}).selectedId === "zao_li"`；未选中为 `null`；选了不存在的 id 也为 `null`。
- [x] 实现：在原 `buildStateModel(...)` 结果上 `Object.freeze({ ...base, plates })`；`status` 复用 `plateLine` 里的同一判断（抽成 `plateStatus(plate)`），`lines` 不变以保持旧测试。
- [x] `index.ts` 导出新类型与 `layout/*`。
- [x] presentation 相关测试 30 项通过，`tsc --noEmit` 通过，`pnpm sync:presentation` 后 `check:vendor` 一致。

### Task 3：战斗页几何

**Files：** Create `layout/battle-layout.ts`、`layout/battle-layout.test.ts`

**Produces：**

```ts
export interface BattleLayout {
  readonly topBar: Box;
  readonly foePlate: Box;
  readonly foeArt: Box;
  readonly allyArt: Box;
  readonly allyPlate: Box;
  readonly log: Box;
  /** 顺序 术 / 队伍 / 囊 / 走，2×2。 */
  readonly commands: readonly [Box, Box, Box, Box];
}
export function battleLayout(frame: ResponsiveFrame): BattleLayout;
```

规则（W/H 为 `frame.content`，pad = `SPACE.lg`）：
- 竖屏：顶栏贴顶（高 52）；命令 2×2 贴底（按钮高 88，宽 `(W-3pad)/2`，行距 `SPACE.md`）；战况条（高 72）在命令上方；其余为战场。
- 战场：敌方立绘右上、名牌左上；我方立绘左下、名牌右下。立绘边长：敌 `min(0.42W, 0.45 fieldH)`，我 `min(0.46W, 0.5 fieldH)`。名牌宽 `W/2 - pad`、高 96。
- 横屏：左栏 = 战场，右栏 = 战况条 + 命令 2×2（贴底）；顶栏横跨两栏。

- [x] RED：

```ts
import { describe, expect, it } from "vitest";
import { buildResponsiveFrame } from "../responsive.ts";
import { buildViewport } from "../viewport.ts";
import { MIN_HIT_SIZE } from "../a11y.ts";
import { battleLayout } from "./battle-layout.ts";
import { inside, overlaps, type Box } from "./box.ts";

const SIZES = [
  { width: 750, height: 1334 },
  { width: 640, height: 1136 },
  { width: 1334, height: 750 },
];

function boxes(l: ReturnType<typeof battleLayout>): Box[] {
  return [l.topBar, l.foePlate, l.foeArt, l.allyArt, l.allyPlate, l.log, ...l.commands];
}

describe("battle layout", () => {
  for (const size of SIZES) {
    const frame = buildResponsiveFrame(buildViewport(size));
    const l = battleLayout(frame);

    it(`keeps every box inside the content at ${size.width}x${size.height}`, () => {
      for (const b of boxes(l)) expect(inside(b, frame.content.width, frame.content.height)).toBe(true);
    });

    it(`never overlaps two boxes at ${size.width}x${size.height}`, () => {
      const all = boxes(l);
      for (let i = 0; i < all.length; i++)
        for (let j = i + 1; j < all.length; j++) expect(overlaps(all[i]!, all[j]!), `${i}-${j}`).toBe(false);
    });

    it(`puts the foe up-right and the ally down-left at ${size.width}x${size.height}`, () => {
      expect(l.foeArt.y).toBeGreaterThan(l.allyArt.y);
      expect(l.foeArt.x).toBeGreaterThan(l.allyArt.x);
    });

    it(`keeps commands tappable at ${size.width}x${size.height}`, () => {
      for (const c of l.commands) {
        expect(c.width).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
        expect(c.height).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
      }
    });
  }

  it("puts commands in the bottom 35% of a portrait screen (thumb zone)", () => {
    const frame = buildResponsiveFrame(buildViewport({ width: 750, height: 1334 }));
    const l = battleLayout(frame);
    const limit = -frame.content.height / 2 + frame.content.height * 0.35;
    for (const c of l.commands) expect(c.y + c.height / 2).toBeLessThanOrEqual(limit);
  });
});
```

（`MIN_HIT_SIZE` 实际导出位置以 `index.ts` 为准，执行时核对。）

- [x] 实现 `battleLayout`。13 项几何测试通过。横屏立绘和名牌按左栏宽度算，避免名牌盖住右栏命令。`index.ts` 已导出。

### Task 4：战斗页 renderer + 血条

**Files：** Create `assets/scripts/app/ui/HpBar.ts`；Modify `assets/scripts/app/screens/BattleScreen.ts`（及 AppShell 中传入模型的类型，若为 `ScreenModel` 则改为 `BattleScreenModel`）

- [x] `makeHpBar`：槽、左对齐填充、顶部 35% 提亮。`setRatio(ratio, tone)` 只改填充。
- [x] 名牌上行名字与等级，非常态时把状态接在名字后；下行血条加 `hp/max`。
- [x] 立绘走 `attachPortraitSprite`，敌方 `scaleX = -1`。
- [x] 血条从 `lastRatio` 缓动到新值；下降时立绘透明度一闪，整段时长不超过 `motionDurationMs`。
- [x] 顶栏文案改为「第 N 波 · 金 X · 队伍 N」（模型行从 `第波N` 改成 `第 N 波`）。战况条用正文色。
- [x] u6 契约 6 项与 battle 模型 11 项通过，没有改契约。真机画面留到 Task 8。

### Task 5：标题页

**Files：** Create `layout/title-layout.ts` + test；Modify `TitleScreen.ts`

**Produces：** `titleLayout(frame, secondaryCount): { title: Box; subtitle: Box; mascot: Box; primary: Box; grid: readonly Box[] }`

- [x] RED：三种尺寸下无重叠、在框内；`primary.width ≥ 1.8 × grid[0].width`；`primary.height > grid[0].height`；竖屏 `mascot.height ≥ 0.2H`。11 项通过。
- [x] 实现：竖屏自上而下 标题 → 副标题胶囊 → 吉祥物（灶狸立绘，无垫底）→ 主按钮（整宽）→ 次级 2 列网格；横屏左栏标题+吉祥物，右栏主按钮+网格。
- [x] renderer：次级按钮带图标，映射 `title.open-settings→icon_settings`、`open-codex→icon_codex`、`open-eggs→icon_eggs`、`open-achievements→icon_achievements`、`open-stats→icon_stats`、`open-slots→icon_slots`、`open-glossary→icon_scroll`。
- [x] `pnpm test` 见本轮记录。titleLayout 已从 index 导出。

### Task 6：选宠页

**Files：** Create `layout/starter-layout.ts` + test；Modify `StarterScreen.ts`

**Produces：** `starterLayout(frame, cardCount): { title: Box; cards: readonly Box[]; detail: Box; confirm: Box; back: Box }`

- [x] RED：无重叠、在框内；竖屏卡高 ≥ 0.3H；`confirm` 底边在下 25% 内；`confirm.width > back.width`。10 项通过。
- [x] 实现：卡片撑满中段（消除上下大留白），详情面板在卡下，确认贴底，返回在确认左侧且更窄。
- [x] renderer：`model.selectedId` 对应卡换主色描边 + 放大 1.04；有选中时其余卡 `UIOpacity` 170；详情用正文字号放进面板。
- [x] u5 契约与 starter 布局测试见本轮记录。`starterLayout` 已导出。

### Task 7：按下反馈

**Files：** Modify `assets/scripts/app/ui/Button.ts`

- [x] `TOUCH_START` 缩到 0.94（60ms），`TOUCH_END` / `TOUCH_CANCEL` 回 1（90ms）；禁用按钮不缩。时长都 < 150ms，减少动效下也合规。
- [x] ui-contract 按下反馈断言通过。真机手感留到 Task 8。

### Task 8：验收

- [x] `pnpm test`、`pnpm check:forbidden`、`pnpm sync:presentation`、`pnpm check:ui-productization`。2026-10-22 11:16 全绿：core 249 / presentation 344 / platform 17，禁用词干净，vendor 一致。
- [ ] 真入口拍 title / starter / battle 竖屏 + 横屏。**未拍：** `localhost:7456` 仍无预览进程。循环按约定停在这里，不再预约。
- [x] 完成记录已写在文末。

## 基线

2026-10-22 10:54：B2 已在 `main`（`把产品入口接到 AppShell`）。`LEGACY_BOOT = false`，`Boot.launchProductShell()` 存在。全量 `pnpm test` 通过。

真入口截图未拍：Cocos 预览 `http://localhost:7456/` 无监听。视觉对比暂用 2026-09-30 的 title / starter / battle（纯色标题、选宠无选中态、战斗无血条无立绘）。Task 8 用同一入口重拍。

## 完成记录

2026-10-22 11:16。代码门通过，真入口截图没有拍成。

| 命令 | 结果 |
|---|---|
| `pnpm test` | core 249、presentation 344、platform 17 通过 |
| `pnpm check:forbidden` | clean |
| `pnpm sync:presentation` 后 `pnpm check:vendor` | 53.8kb，与源码一致 |
| `pnpm check:ui-productization` | 25 个矩阵页、3 张关键帧 |

截图：`http://localhost:7456/` 无监听，`docs/ui/baselines/evidence/2026-10-22/` 未建。对比仍用 2026-09-30 的 title / starter / battle。预览打开后从 `boot.scene` 重拍竖屏和横屏，逐张看过再勾掉 Task 8 的截图项。

本阶段已落地、尚未用眼睛验收的画面：

- 战斗：双方立绘、血条缓动、掉血闪一下、顶栏「第 N 波 · 金 X · 队伍 N」。
- 标题：灶狸吉祥物，主按钮比入口宽，入口带图标。横屏左吉祥物、右菜单。
- 选宠：卡片占中段，确认贴底，选中描主色并放大，未选变淡。
- 按钮：按下 60ms 缩到 0.94，松开 90ms 回到 1。禁用按钮不动。

遗留：`deng_e`、`she_mu` 细节偏多，本阶段不重画。背景仍是原来的三张场景图。
