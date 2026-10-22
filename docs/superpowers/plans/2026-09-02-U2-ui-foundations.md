# U2：设计系统与五态基础组件（2026-09-02）

**上游：** [路线图 U2](./2026-08-31-ui-productization-roadmap.md) · [产品规格](../specs/2026-08-31-ui-productization.md) · [ADR-0001](../../adr/0001-ui-presentation-shell.md)

**前置：** U1 已完成（见 `2026-09-01-U1-presentation-shell.md` 的完成记录）。

## 目标

建立**无玩法判断**的基础层，仍不迁移任何产品页：

1. token：颜色、间距、圆角、字号阶梯、动效时长；与 A1 已落地的 `THEME` 保持同一视觉语言。
2. 排版与可访问性规则：对比度、最小热区 `44×44`、文本放大 200% 不裁切。
3. 五态基础组件模型：`normal/loading/empty/error/locked` 各自必需字段。
4. 响应式容器模型：`ResponsiveFrame`（竖/横布局模式）与 `SafeArea` 内缩。
5. 减少动效：所有动效在 reduce-motion 下 ≤ `150 ms`。
6. Cocos 侧：按钮/面板/列表/状态页最小组件与一个**组件陈列页**（非产品页）。

## 非目标

- 不迁移 `title`/`mode`/`starter`/`battle` 等产品页；manifest 仍全 `legacy`。
- 不改玩法、存档、随机结果。
- 不替换 A1 的 `THEME` 数值；U2 只是把它规范成可测的 token 层并补齐语义。
- 不做完整组件库，只做产品化需要的最小集合。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/presentation/src/tokens.ts` | 颜色/间距/圆角/字号/动效 token，含 RGB 与十六进制 |
| `packages/presentation/src/tokens.test.ts` | token 结构、与 `THEME` 一致性 |
| `packages/presentation/src/a11y.ts` | 对比度计算、热区校验、文本缩放校验、reduce-motion 时长裁剪 |
| `packages/presentation/src/a11y.test.ts` | WCAG AA 对比度、`44×44` 热区、200% 文本、`150 ms` 上限 |
| `packages/presentation/src/states.ts` | 五态组件模型构造器（复用 `ScreenModel` 约束） |
| `packages/presentation/src/states.test.ts` | 缺原因/主行动/可访问名时失败 |
| `packages/presentation/src/responsive.ts` | `ResponsiveFrame`：由 viewport 推导内容框、列数与安全区内缩 |
| `packages/presentation/src/responsive.test.ts` | 竖/横两向、安全区、极端长文不溢出 |
| `packages/presentation/src/index.ts` | 追加导出 |
| `assets/scripts/app/ui/Button.ts` | 最小按钮：热区 ≥ `44×44`，禁用必须有原因 |
| `assets/scripts/app/ui/Panel.ts` | 最小面板：圆角/描边来自 token |
| `assets/scripts/app/ui/StateView.ts` | 五态渲染：原因、主行动、可访问名 |
| `assets/scripts/app/GalleryView.ts` | 组件陈列页（非产品页），可切五态/方向/文本缩放/减少动效 |
| `packages/presentation/src/ui-contract.test.ts` | 钉死上述 Cocos 组件无玩法依赖、无产品文案、token 来自 presentation |

## 失败测试（先 RED）

1. `tokens.test.ts`：token 缺项或与 `THEME` 数值不一致时失败；字号阶梯必须单调递增。
2. `a11y.test.ts`
   - 正文色与背景色对比度 < `4.5` 时失败；大字号 < `3.0` 时失败。
   - 热区小于 `44×44` 时失败。
   - 文本放大到 200% 后行高/容器高度不足时失败。
   - reduce-motion 下动效时长 > `150 ms` 时失败。
3. `states.test.ts`：五态构造缺 `reason`（error/locked）、缺 `accessibleName`、`empty` 缺主行动或明确 null 时失败。
4. `responsive.test.ts`：竖屏单列、横屏双列；安全区内缩后内容框不越界；超长标签必须给出截断/换行策略字段。
5. `ui-contract.test.ts`：Cocos 组件出现 `jinglingCore`、`getSpirit`、产品文案或硬编码颜色字面量时失败。

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

真实构建与陈列页留证沿用 U1 通道（`build-configs/*.json` + 无头 Chrome + 平台构建门禁）。

## 退出门

- 基础组件无玩法判断；五态可复用；token 与 `THEME` 一致。
- 自动对比度/热区/文本缩放/减少动效测试通过。
- 组件陈列页在实际 Cocos 中可切五态、方向、文本缩放、减少动效，截图入档。
- manifest 仍全 `legacy`，产品页零变化；仓库全量验证通过；主包仍 ≤ 4 MiB。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u2-gallery-runtime.md` 与同目录四张
`u2-gallery-*.png`（竖屏 / 横屏 / 文本 200% / 减少动效）。

| 项 | 实测 |
|---|---|
| presentation 包测试 | 76 passed（13 文件） |
| 仓库测试 | core 223 + presentation 76 + platform 17；Python 34 + 9 |
| 门禁 | 禁用词 clean、`check:pack` 479,783 B、模板 ok、页面审计 25+3 |
| 微信真实构建 | 主包 3,328,555 B，分包 15,281,447 B，`check:cocos-build` exit 0 |
| 竖/横列数 | 竖屏 1 列，横屏 2 列（运行时坐标去重实测） |
| 文本 200% | 标题字号 28 → 56 |
| 主行动热区 | 514×56 / 447×56，均 ≥ `44×44` |
| 单挂载不变式 | 四种组合下宿主恰好一个 |
| 五态 | 每种组合渲染 5 格；error/locked 显示 reason；loading 主行动禁用并带原因 |

### 实现要点与偏差

1. token 直接复用 `packages/core/src/ui/theme.ts` 的 `THEME` 数值，测试断言两者一致，
   避免和 A1 已验收的卡通皮产生视觉分叉。规格没要求换色，U2 只补语义层。
2. 对比度阈值同时提供 `body`(4.5) 与 `large`(3.0) 两档，`assertContrast` 默认按 body。
   实测 `ink/paper`、`ink/panel`、`muted/panel` 均 ≥ 4.5。
3. `states.ts` 在 `loading` 下强制把所有 action 置为 `enabled:false` 并写入禁用原因，
   这是规格"不允许无解释灰按钮"的机器化落地。
4. 陈列路由 `gallery` 是壳层保留 id（与 `diagnostics` 同类），不进产品矩阵，
   `SCREEN_MANIFEST` 仍是 25 页全 `legacy`。
5. 首次截图曾拍到诊断页而非陈列页，原因是渲染等待不足（1.4 s）。已延长到 3 s 并复采；
   同时补了不依赖截图的运行时几何验证，避免再靠肉眼判断。
6. `DiagnosticsView`（U1 引入的临时 renderer）尚未替换。它与 U2 的 `StateView` 职责不同
   （前者是壳层自检文本，后者是五态组件），保留到 U3 第一页迁移时再评估是否合并。

