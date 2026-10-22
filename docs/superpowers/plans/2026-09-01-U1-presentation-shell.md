# U1：presentation 与 AppShell 骨架（2026-09-01）

**上游：** [路线图 U1](./2026-08-31-ui-productization-roadmap.md) · [产品规格](../specs/2026-08-31-ui-productization.md) · [ADR-0001](../../adr/0001-ui-presentation-shell.md) · [页面矩阵](../../ui/screen-matrix.json)

**前置：** U0 已完成；V0 构建/运行阻塞已修复（见 [V0 结果](../../ui/baselines/2026-09-01-V0-results.md)）。

## 目标

只建骨架，不迁移任何产品页：

1. 纯 TypeScript presentation：把 core snapshot + 资源状态 + UI 状态确定映射为只读 `ScreenModel`。
2. screen manifest：25 个 `screenId` 各自记录 renderer 选择，U1 全部默认 `legacy`。
3. Cocos `AppShell` 组合根：路由、弹层栈、viewport（竖/横）、安全区、单 renderer 不变式、逐页与全局回退。
4. 诊断路由：不含任何产品内容，用来在实际 Cocos 里验证壳层。

## 非目标（越界即回退）

- 不迁移 `title`/`mode`/`starter`/`battle` 等任何产品页；`Boot.ts` 继续承载全部产品呈现。
- 不改玩法、存档结构、随机结果、资源 ID。
- core 不得导入引擎模块；presentation 不得创建节点或读设备 API。
- AppShell 不写页面坐标，也不做玩法条件判断。

## 架构落点

```text
assets/scripts/app/AppShell.ts        ──> vendor/jinglingPresentation.ts ──> vendor/jinglingCore.ts
        │(组合根：路由/弹层/viewport/回退)                （packages/presentation）      （packages/core）
        └──> assets/scripts/Boot.ts（legacy renderer，保持现状）
```

新增 workspace 包 `packages/presentation`，依赖 `@jingling/core`，与 `packages/platform` 同构
（`package.json` / `tsconfig.json` / `vitest.config.ts` / `src`）。通过 `pnpm sync:presentation`
用 esbuild 打包成 `assets/scripts/vendor/jinglingPresentation.ts` 供 Cocos 侧导入，
与既有 `sync:core` 同一套做法。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/presentation/package.json` | 新包，依赖 `@jingling/core` |
| `packages/presentation/tsconfig.json` | 与 platform 同构 |
| `packages/presentation/vitest.config.ts` | 与 platform 同构 |
| `packages/presentation/src/screen-model.ts` | `ScreenModel`、`ScreenState`、`ScreenAction` 类型与构造器 |
| `packages/presentation/src/manifest.ts` | 25 页 manifest、renderer 选择、未知 screen 拒绝 |
| `packages/presentation/src/diagnostics.ts` | 诊断路由的 ScreenModel（无产品内容） |
| `packages/presentation/src/viewport.ts` | 由 viewport 尺寸推导 `portrait`/`landscape` 布局模式与安全区模型 |
| `packages/presentation/src/index.ts` | 对外导出 |
| `packages/presentation/src/*.test.ts` | 上述四个模块的失败测试 |
| `assets/scripts/app/AppShell.ts` | Cocos 组合根：单 renderer 挂载、路由、方向、回退 |
| `assets/scripts/vendor/jinglingPresentation.ts` | 由 `pnpm sync:presentation` 生成，禁止手改 |
| `packages/core/src/app-shell-contract.test.ts` | 钉死 AppShell 源码不越界（不含坐标/玩法条件、不双挂载） |
| `package.json` | 新增 `sync:presentation` 与 `test` 纳入新包 |

## 失败测试（先 RED，且必须因缺实现而红）

1. `screen-model.test.ts`
   - 同一输入两次构造，结果结构相等（确定性）。
   - 五态齐全：`normal/loading/empty/error/locked` 均可构造，且 `error`/`locked` 必须带 `reason`。
   - 每个 model 必须有 `screenId`、`state`、`primaryAction`（或显式 `null`）、`accessibleName`。
   - 未知 `screenId` 抛错。
2. `manifest.test.ts`
   - manifest 覆盖 `docs/ui/screen-matrix.json` 的 25 个 id，无多余项。
   - U1 阶段全部为 `legacy`。
   - `selectRenderer('unknown')` 抛错。
   - 逐页切换到 `presentation` 后，`legacy` 与 `presentation` 不可同时为真（单一所有者）。
3. `viewport.test.ts`
   - `750×1334` → `portrait`，`1334×750` → `landscape`。
   - 安全区内缩不改变逻辑设计分辨率。
   - 方向变化只影响 viewport model，不改 `state` 与未提交选择。
4. `diagnostics.test.ts`
   - 诊断 model 不含任何产品文案（用禁用清单断言：精怪名、模式名、术、囊等）。
5. `app-shell-contract.test.ts`
   - `AppShell.ts` 不出现硬编码坐标数字组、不出现玩法条件（`getSpirit`、`beginUiRun` 等）。
   - 源码中存在 `destroy` 前置的挂载路径，且不存在"隐藏而不销毁"的写法（`active = false` 用于切换 renderer）。

## 最小实现顺序

1. 建包骨架 → RED（模块不存在）。
2. `screen-model.ts` → GREEN。
3. `manifest.ts`（读矩阵 id 常量，不在运行时读 JSON） → GREEN。
4. `viewport.ts` → GREEN。
5. `diagnostics.ts` → GREEN。
6. `sync:presentation` + `AppShell.ts` + 契约测试 → GREEN。
7. 实际 Cocos 构建跑一次，确认诊断宿主可挂载、可竖横切换、可回退。

## 验证命令

```bash
rtk pnpm --filter @jingling/presentation test
rtk pnpm test
rtk pnpm sync:presentation
rtk pnpm check:forbidden
rtk pnpm check:pack
rtk pnpm validate:game
rtk pnpm check:ui-productization
rtk pnpm test:py
```

真实构建与运行（沿用 V0 通道）：

```bash
rtk /Applications/Cocos/Creator/3.8.2/CocosCreator.app/Contents/MacOS/CocosCreator \
  --project . --build 'configPath=./build-configs/wechatgame.json'
rtk pnpm pack:subpackages .u0-build3/wechat/wechatgame --bundle portraits
rtk pnpm check:cocos-build -- --wechat .u0-build3/wechat/wechatgame
```

## 退出门

- 25 页 manifest 全部仍为 `legacy`，产品页行为零变化（Boot 现有页面截图与 V0 证据一致）。
- presentation 不导入 `cc`；core 不导入 `cc`；AppShell 不含坐标与玩法条件。
- 单 renderer 不变式有测试；逐页与全局回退有测试。
- 新包测试与仓库全量验证通过；主包仍 ≤ 4 MiB。
- 实际 Cocos 里诊断宿主可挂载并在竖横屏切换（截图入档 `docs/ui/baselines/evidence/`）。

## 完成记录（2026-09-01）

全部退出门已满足，证据见 `docs/ui/baselines/evidence/2026-09-01/u1-appshell-runtime.md`
与同目录 `u1-diagnostics-portrait.png` / `u1-diagnostics-landscape.png`。

| 项 | 实测 |
|---|---|
| presentation 包测试 | 40 passed（7 文件） |
| 仓库测试 | core 223 + presentation 40 + platform 17；Python 34 + 9 |
| 门禁 | 禁用词 clean、`check:pack` 459,751 B、模板 ok、页面审计 25+3 |
| 微信真实构建 | 主包 3,317,144 B，分包 15,281,447 B，`check:cocos-build` exit 0 |
| 单挂载不变式 | 真实引擎中任一时刻 `hosts` 恰好一个宿主 |
| 竖横切换 | `750×1334` ↔ `1334×750`，`screenId`/`renderer` 不变 |

### 计划外新增（已用契约测试约束）

1. `assets/scripts/app/DiagnosticsView.ts`：原计划只在控制台打印壳层信息，但那样无法产出有意义的截图。
   新增一个只渲染 diagnostics ScreenModel 文本行的最小 renderer，并用
   `diagnostics-view-contract.test.ts` 钉死它无产品文案、无玩法依赖、卸载即销毁。
   它不是 U2 的设计系统组件，U2 建立正式组件后应当替换它。
2. `packages/presentation/src/isolation.test.ts`：补上 presentation 层的引擎/设备隔离守卫，
   与 core 的 `engine-isolation.test.ts` 对应。

### 与路线图措辞的偏差

- 路线图要求"实际 Cocos 启动 AppShell"。当前壳层未挂进 `boot.scene`：U1 若把 AppShell 挂进产品场景，
  它与 Boot 会同时调用 `view.setDesignResolutionSize`，形成两个 viewport 所有者，违反本阶段"无双状态源"。
  因此改为在真实 Cocos 运行时中挂载壳层验证（同一份代码已随平台构建打包），
  挂进场景留到 U3 第一页真正切换到 presentation 时一并处理。
- 截图时用探针把壳层宿主提到最上层，因为 Boot 在 resize 后会重建自己的节点并覆盖壳层文本。
  这是取证手段，产品代码里没有 z-order 改动。
