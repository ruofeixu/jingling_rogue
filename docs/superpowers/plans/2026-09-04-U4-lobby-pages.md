# U4：大厅资料与管理页（2026-09-04）

**上游：** [路线图 U4](./2026-08-31-ui-productization-roadmap.md) · [产品规格](../specs/2026-08-31-ui-productization.md) · [ADR-0001](../../adr/0001-ui-presentation-shell.md)

**前置：** U1/U2/U3 已完成（见各计划完成记录）。

## 目标

迁移八个大厅页：`settings`、`codex-list`、`codex-entry`、`eggs`、`achievements`、`stats`、`slots`、`glossary`。
同时补上 U3 推迟的 **core 只读 selector 层**，让 presentation 不再依赖壳层常量。

## 非目标

- 不改玩法规则、存档 schema、成就/解锁条件、随机结果。
- 不迁移 `starter`/`battle` 及其子页。
- 不新增美术资源。

## 架构补充：selector 层

新增 `packages/core/src/ui/selectors.ts`：把 `AccountProgress` 等只读快照投影成
presentation 需要的**扁平只读视图**，不含颜色、坐标、组件语义。

```text
core state ──selectors──> ViewData ──presentation──> ScreenModel ──renderer──> Cocos
```

规则：selector 只读、纯函数、不产生新的玩法结论；需要的派生值（如收集进度）用已有 core 函数计算。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/core/src/ui/selectors.ts` | `selectSettings/selectCodex/selectEggs/selectAchievements/selectStats/selectSlots/selectGlossary` |
| `packages/core/src/ui/selectors.test.ts` | 只读性、确定性、空态、锁定语义 |
| `packages/presentation/src/screens/settings.ts` | 设置分组与保存反馈 |
| `packages/presentation/src/screens/codex.ts` | 列表 + 详情两个 builder |
| `packages/presentation/src/screens/eggs.ts` | 卵槽进度与空态 |
| `packages/presentation/src/screens/achievements.ts` | 成就分组、进度、锁定 |
| `packages/presentation/src/screens/stats.ts` | 统计摘要与无记录空态 |
| `packages/presentation/src/screens/slots.ts` | 五槽存档、冲突与幂等操作 |
| `packages/presentation/src/screens/glossary.ts` | 名词索引与详情 |
| `packages/presentation/src/screens/*.test.ts` | 每页表驱动五态测试 |
| `assets/scripts/app/ui/ListView.ts` | 共享列表壳（长列表、空态、双栏） |
| `assets/scripts/app/screens/LobbyScreen.ts` | 共享列表/详情宿主，按 screenId 绑定各页模型 |
| `packages/presentation/src/u4-contract.test.ts` | 钉死共享壳不混业务、renderer 无玩法依赖 |

## 失败测试（先 RED）

1. selector：同一快照两次调用结构相等；空账号得到 empty 语义；锁定项带原因；不返回函数或可变引用。
2. 每页表驱动：五态齐全；主行动唯一；`empty` 必须有 `emptyHint`；`locked` 必须有原因。
3. 长列表：超过一页时给出分页/滚动信息，不静默截断。
4. `slots`：同一槽重复提交同一操作必须幂等（同 action id 连点两次结果一致）。
5. `codex-entry`：未解锁条目只暴露"未知"占位，不泄露未收集数据。
6. 共享壳契约：`ListView`/`LobbyScreen` 不含任何单页业务判断（无 `if (screenId === ...)` 之外的业务分支）、无硬编码颜色。

## 退出门

- 八页在 manifest 中为 `presentation`，其余仍 `legacy`。
- 每页五态可渲染；契录列表与详情各有证据；空态含文字而非仅插图。
- 存档操作幂等；U3 两页无回归；未迁移页仍安全回退。
- 仓库全量验证通过；主包仍 ≤ 4 MiB。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u4-lobby-runtime.md` 与同目录 10 张 `u4-*.png`。

| 项 | 实测 |
|---|---|
| core 测试 | 234 passed（含 selector 11 项） |
| presentation 测试 | 133 passed（21 文件） |
| platform / Python | 17 passed；34 + 9 passed |
| manifest | 10 页 `presentation`（title/mode + 八个大厅页），其余 15 页 `legacy` |
| 八页渲染 | 全部经 `list-view` 壳渲染成功 |
| 空态 | 空账号下 codex-list / eggs / achievements / stats / slots 自动 `empty`，且 `emptyHint` 有文字 |
| 锁定态 | codex-entry 未见过时 `locked` + 文字原因；锁定条目全部带 `disabledReason`（契录 8/8、成就 71/71、存档 4/5） |
| 幂等 | `buildSlotsModel` 同一视图两次构造结构相等；五个槽 action id 互不重复 |
| 长列表 | 契录与名词按 `pageSize=8` 分页，模型行显式给出「第 N / M 页」 |
| U3 回归 | title / mode 仍为 presentation 且渲染 `title-screen` / `mode-screen` |
| 未迁移页 | starter / battle 仍返回 `legacy`，壳层不挂任何节点 |
| 门禁 | 禁用词 clean、`check:pack` 515,126 B、模板 ok、页面审计 25+3 |
| 微信真实构建 | 主包 3,349,161 B，分包 15,281,447 B，`check:cocos-build` exit 0 |

### 实现要点与偏差

1. **新增 core selector 层**（`packages/core/src/ui/selectors.ts`），补上 U3 推迟的部分。
   selector 深冻结返回值、不返回函数、不修改传入账号，测试逐项断言。
   `selectCodexEntry` 对未收集条目只返回「未知」占位，不泄露属性与蜕变线。
2. **AppShell 现在导入 core**。U1 的契约测试原本断言"壳层不得导入 core"，这与 ADR 的事件流
   （renderer → AppShell dispatcher → core command → snapshot → presentation）矛盾。
   已把该契约收紧为白名单：壳层只能导入 `select*` 投影、`emptyAccount`、`utcDateStamp` 与类型，
   任何玩法函数仍然禁止，由 `app-shell-contract.test.ts` 逐名校验。
3. 八页没有各自的 renderer，全部走 `ListView` + `LobbyScreen`。契约测试禁止共享壳出现任何
   单页业务词（codex/eggs/slots/achievements/glossary/settings），差异只能来自 ScreenModel。
4. `LobbyScreen` 把销毁委托给 `ListView`，所以契约里"清理"这条允许"自己 destroy 或委托 unmount"。
5. selector 新增导出必须同时加到 `index.ts` 与 `creator-entry.ts`——只加前者会导致 Creator 构建报
   `MISSING_EXPORT`（本轮实际踩到，已修）。
6. 存档摘要（`SlotSummary[]`）目前由宿主注入，壳层默认空数组。真正的存档读取属于平台/IO 层，
   不在 U4 范围；`selectSlots` 已定义好契约，U11 收口时接真实 IO。
