# U3：标题大厅与模式选择（2026-09-03）

**上游：** [路线图 U3](./2026-08-31-ui-productization-roadmap.md) · [产品规格](../specs/2026-08-31-ui-productization.md) · [ADR-0001](../../adr/0001-ui-presentation-shell.md)

**前置：** U1、U2 已完成（见各自计划的完成记录）。

## 目标

只迁移 `title` 与 `mode` 两页，其余 23 页保持 `legacy`：

1. presentation 侧新增 `title` / `mode` 的 ScreenModel builder，输入是只读 core 快照，输出确定模型。
2. 标题页只有一个一级行动；模式锁定必须带文字原因。
3. 事件只回传稳定 action id，由壳层 dispatcher 转成 core 命令；ScreenModel 不直接改 core。
4. Cocos 侧用 U2 组件渲染这两页，接入 AppShell 路由。
5. manifest 把 `title`、`mode` 切到 `presentation`，其余仍 `legacy`；逐页回退可用。

## 非目标

- 不迁移 `starter`/`battle` 等其他页。
- 不改玩法规则、存档结构、随机结果、模式解锁条件本身。
- 不新增美术资源；背景层沿用 U2 token 与现有 `THEME`。

## 数据来源（只读）

| 内容 | 来源 |
|---|---|
| 标题文案 | 现有 `assets/scripts/ui/lobby.ts` 的 `showTitle`：标题「契灵志怪」、提示语、八个入口 |
| 模式列表与名称 | 现有 `Boot.ts` 的 `MODE_NAME` + `showModePick` 的六项（含短征） |
| 解锁状态 | core 只读查询：`AccountProgress`（`classicCleared`、`fusedClear` 等） |

若 core 暴露不足，只新增**只读 selector**，不改玩法结构。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/presentation/src/screens/title.ts` | `buildTitleModel(input)`：一级行动 + 次级入口 + 五态 |
| `packages/presentation/src/screens/title.test.ts` | 单一一级行动、五态、动作 id 稳定 |
| `packages/presentation/src/screens/mode.ts` | `buildModeModel(input)`：模式卡、锁定原因 |
| `packages/presentation/src/screens/mode.test.ts` | 锁定必须有文字原因、无未解释禁用 |
| `packages/presentation/src/screens/index.ts` | 汇总导出 |
| `packages/presentation/src/dispatch.ts` | action id → 命令意图映射（纯数据，不执行） |
| `packages/presentation/src/dispatch.test.ts` | 未知 action 抛错；同一 id 稳定映射 |
| `assets/scripts/app/screens/TitleScreen.ts` | 用 U2 组件渲染 title ScreenModel |
| `assets/scripts/app/screens/ModeScreen.ts` | 渲染 mode ScreenModel |
| `packages/presentation/src/u3-contract.test.ts` | 钉死两页 renderer 无玩法判断、无硬编码颜色、action 只回传 id |

## 失败测试（先 RED）

1. `title.test.ts`
   - 恰好一个 `primaryAction`，其余进 `secondaryActions`。
   - 五态可注入；`error`/`locked` 带 reason。
   - 动作 id 稳定：`start-run`、`open-settings`、`open-codex`… 不随文案变化。
2. `mode.test.ts`
   - 六个模式项；锁定项 `enabled:false` 且 `disabledReason` 非空。
   - 未解锁原因来自输入，不由 presentation 猜测。
3. `dispatch.test.ts`
   - `resolveAction('start-run')` 返回意图 `{ kind: 'route', to: 'mode' }` 之类的纯数据。
   - 未知 id 抛 `unknown action`。
4. `u3-contract.test.ts`
   - 两个 renderer 不含 `jinglingCore`、玩法符号、硬编码颜色。
   - 只通过回调回传 action id，不在 renderer 里调用 core。

## 退出门

- `title`、`mode` 在 manifest 中为 `presentation`，其余 23 页仍 `legacy`。
- 两页 normal/loading/empty/error/locked 与竖横屏均可渲染，截图入档。
- 逐页回退：把任一页切回 `legacy` 后旧呈现仍可用，core 状态不重建。
- 仓库全量验证通过；主包仍 ≤ 4 MiB。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u3-title-mode-runtime.md` 与同目录
`u3-title-portrait.png` / `u3-title-landscape.png` / `u3-mode-portrait.png` / `u3-mode-landscape.png`。

| 项 | 实测 |
|---|---|
| presentation 包测试 | 101 passed（17 文件） |
| 仓库测试 | core 223 + presentation 101 + platform 17；Python 34 + 9 |
| manifest | `title`、`mode` = `presentation`；其余 23 页 = `legacy`（测试逐项断言） |
| 标题页 | 主行动 `title.start-run` + 7 个次级入口，竖横屏均渲染 `title-screen` |
| 模式页 | 主行动 `mode.select.sprint` + 5 项，竖横屏均渲染 `mode-screen` |
| 逐页回退 | 切回 legacy 后宿主变 `shell-host-legacy`、模型为 null；切回 presentation 恢复 |
| 全局回退 | 开启后 renderer=legacy、模型 null；关闭后恢复 presentation |
| 单挂载不变式 | 所有组合下宿主恰好一个 |
| 门禁 | 禁用词 clean、`check:pack` 494,964 B、模板 ok、页面审计 25+3 |
| 微信真实构建 | 主包 3,337,341 B，分包 15,281,447 B，`check:cocos-build` exit 0 |

### 实现要点与偏差

1. 新增 `assets/scripts/app/ui/Text.ts`（文本组件）。U2 的组件清单里没有它，但两页都要画文本，
   放进 U2 组件层比在每个页面里重复实现更合适；颜色/字号仍只来自 token，契约测试覆盖。
2. **产品文案暂时是壳层常量**。`AppShell.copy` 里放了与旧大厅一致的标题、副标题、提示语与六个模式。
   计划里写的"core 只读 selector"推到 U4：U4 的 7 个页面必须读真实账号数据，那时一并建立 selector 层
   更省一次返工。当前状态下 presentation 仍然是纯映射（文案由调用方注入），没有破坏分层。
3. 模式解锁原因目前没有实际锁定项（六个模式都可用），但 `buildModeModel` 已经强制"锁定必须带文字原因"，
   并有 RED→GREEN 测试覆盖；接 selector 后直接传 `lockedReason` 即可。
4. 旧 `Boot.ts` 未改动，仍承载全部 25 页的旧呈现路径；契约测试断言 Boot 不引用 AppShell 与 presentation。
