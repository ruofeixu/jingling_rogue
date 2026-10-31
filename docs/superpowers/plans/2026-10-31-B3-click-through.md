# B3：真实点击闭环（2026-10-31）

> **For agentic workers:** 按任务顺序执行，一次一个任务；每个任务先 RED 再实现。Steps 用 `- [x]` 跟踪。

**上游：** [内测准备路线图](./2026-10-01-internal-beta-roadmap.md) 的 B3「真实用户流程与功能缺口」。前置 I1 已完成（[2026-10-30-I1-ink-spec.md](./2026-10-30-I1-ink-spec.md)）。

**Goal：** 只按每页**自己给出的可用按钮**，就能从标题点完一局短征回到标题，不靠测试钩子，不被卡住。

**Architecture：** 玩法仍全在 core 的 `RunController`；presentation 只做 action id 映射、路由和页模型；`AppShell` 只持有瞬时 UI 状态（弹层选中项）。新增一条无头旅程测试，走的就是发货链路：`resolveAction → RunController.execute → routeAfterCommand → build*Model`。

**Tech Stack：** TypeScript、vitest、esbuild（`pnpm sync:core` / `pnpm sync:presentation`）。

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`。
- presentation 不建节点、不算玩法；`AppShell` 不 import 玩法函数（`app-shell-contract.test.ts`、`u12-wiring.test.ts`）。
- 不用 `forceOutcomeForTest` 作为验收证据（路线图 B3 要求）。
- 不改战斗数值，不改 `startPartyBattle` 行为；PvE 既有测试断言不改。
- 每个任务结束：`pnpm test`、`pnpm check:forbidden`；改 core 后 `pnpm sync:core`，改 presentation 后 `pnpm sync:presentation`。
- B3 只修"能不能点通"；视觉归 B5（水墨），文案名词仍按 spirit-bible。

## 证据：无头点击探针（2026-10-30 / 10-31）

探针脚本放在 `/tmp/b3-probe/`，不入库。它用发货链路模拟玩家：战斗里按「术」，其余页按主按钮，主按钮不可用就按第一个可用的次按钮。三个种子（b3a / b3b / b3c）结果一致：

| # | 卡点 | 现象 | 根因 |
|---|------|------|------|
| 1 | **收契页死锁**（第 1 波就卡） | 唯一可用按钮是「返回」，返回后还在收契页 | 收契页列的是 `battle.seals`，但战斗结束后 `RunController.battle` 已置空，`overlaysView()` 回空列表；主按钮 `catch.throw.confirm` 因"先选一项"禁用；没有「放过」；`overlay.cancel` 在 catch 相位路由回 catch |
| 2 | **奖励直接被领走** | 结算页只有「继续」，按下就领了 `boonChoices[0]` | `continueAfterReward` 硬取第一项；结算/货摊页不列可选机缘 |
| 3 | **按「术」偶发报错** | 多目标战里 `battle.art` → `must pick a target` | `battle.art` 直接出第一招，不看 `waitingFor`；战斗页也不知道在等目标 |
| 4 | **胜局「收下这一局」点了没反应** | `outcome.commit` 后页面不变，只能「回厅」 | 提交后 `committed` 变 true，但 `AppShell` 不重投影 outcome 视图，按钮没变灰也没提示 |
| 5 | **回厅后旧局还在** | `toLobby` 只清 `battle` | `slice` 仍在，`phase()` 还是 victory/defeat；再开新局前状态不干净 |
| 6 | **「术」直接出招，不经术法弹层** | 战斗页「术」= 立即用第一招 | `battle.art` 在 controller 里等于 `useArt(first)`；术法弹层 `arts` 从未被打开 |
| 7 | **弹层选中项不生效** | 点了某一招再按「出术」，主按钮仍"先选一项" | `AppShell.overlaySelectedId` 从不随 `*.pick` 更新 |
| 8 | **术法和境域显示内部 id** | 弹层列表是 `art_xxx`，地图节点是 `town_ruins` | `selectBattleOverlays` 用 `label: artId`；`progressView` 用 `name: realmId` |

另外记录、本阶段**不修**的：
- 「原地歇脚」（`map.rest`）是空命令，按了不动；地图上总有可进的节点，不构成死锁。B4 前若仍无设计，改成禁用并给原因。
- 机缘（omen）在发货链路里没有入口（只有旧 `PreviewApp` 调 `openOmen`）。短征打不到，不阻塞 B3；归入 B3 结束后的缺口清单。
- 存档槽在发货链路里没有 `KvStore` 注入，归 B4。

## 文件结构

| 文件 | 职责 |
|---|---|
| Create `packages/presentation/src/journey.test.ts` | 发货链路无头旅程：标题 → 短征 → 初始 → 战斗 →…→ 胜/负 → 标题；三个种子；只按可用按钮 |
| Modify `packages/core/src/run/run-controller.ts` | 收契与放过；按 id 领机缘；回厅清局；`battle.art` 不再直接出招；结算前提供机缘列表 |
| Modify `packages/core/src/ui/selectors.ts` | 术法与境域显示中文名；收契列表来源 |
| Modify `packages/presentation/src/route-after.ts` | `battle.art` → `arts`；`target` 等待 → `target`；catch 相位的取消行为 |
| Modify `packages/presentation/src/screens/progress.ts` | 结算页列可选机缘 |
| Modify `packages/presentation/src/screens/overlays.ts` | 收契页加「放过」 |
| Modify `assets/scripts/app/AppShell.ts` | `*.pick` 记选中项；`outcome.commit` 后重投影 |

## 任务

### Task 0：旅程测试（RED）

- [x] 新建 `journey.test.ts`，把探针的点击循环写成测试：每页只从模型的 `primaryAction` / `secondaryActions` 里挑 `enabled` 的按钮；战斗里优先打开「术」并选第一招可用的术；断言三个种子都在 600 次点击内回到 `title`，且途中没有抛错、没有"按了不变"。
- [x] 跑一次，确认在卡点 #1 失败（RED）。

### Task 1：收契页能收也能放（#1）

- [x] RED：controller 测试，野战胜利进入 catch 后，`overlaysView().seals` 至少有一项可用；`catch.throw` 选中后 `catch.confirm` 推进到 boon；`catch.skip` 也推进到 boon。
- [x] 实现：战斗结束时把镇物库存留在 run 上（`run.seals` 已由 `applyBattleEnd` 同步），`overlaysView()` 在无战斗且 phase 为 catch 时从 `run.seals` 投影；新增 `catch.skip` 命令调 `slice.skipCatch()`；`attemptCatch` 按所选镇物档位扣库存。
- [x] presentation：收契页次按钮加「放过」(`catch.skip`)；`dispatch` 登记 `catch.skip`；`routeAfterCommand` 在 catch 相位按相位走。

### Task 2：结算页按 id 选机缘（#2）

- [x] RED：结算页模型列出当前 `boonChoices`，每项是 `summary.pick.<id>`；选第二项后领到的是第二项。
- [x] 实现：`progressView("summary")` 带出 `boonChoices`（名字 + `formatBoonHint`）；新增 `summary.pick` 命令，`takeBoon(id)`；「继续」保留为"跳过不选"还是"领第一项"——**按旧 PreviewApp 的行为：必须选一项**，「继续」改为禁用并提示"先选一项机缘"；没有可选机缘时「继续」可用。

### Task 3：「术」先开弹层，目标走目标页（#3、#6、#7）

- [x] RED：`routeAfterCommand({ command: "battle.art", phase: "battle" })` → `arts`；`arts.confirm` 后若战斗在等目标 → `target`；`target.confirm` 后回 `battle`。
- [x] 实现 controller：`battle.art` 只是打开弹层，不再出招；`arts.confirm` 用 `pendingArtId`；若 `waitingFor === "target"` 记下并等 `target.confirm`；新增只读 `waitingFor()` 给路由用。
- [x] 实现 AppShell：`*.pick` 命令更新 `overlaySelectedId`，重挂当前弹层；进入/离开弹层时清空。
- [x] 保留 `RunControllerLike` 的结构化接口，只加 `waitingFor?()` 可选方法。

### Task 4：结局提交有反馈，回厅清局（#4、#5）

- [x] RED：`outcome.commit` 后 outcome 模型的提交按钮禁用，原因"已经记下了"；`outcome.lobby` 后 `phase()` 为 `none`，再 `starter.confirm` 能开新局。
- [x] 实现：`AppShell` 执行命令后统一 `refreshFromController()`（已有）并在 outcome 路由重挂；controller 的 `toLobby` 清 `slice`、`battle`、`committed`。

### Task 5：显示中文名（#8）

- [x] RED：术法弹层每项 `label` 等于 `getArt(id).name`；地图节点 `label` 等于境域表的 `name`。
- [x] 实现：`selectBattleOverlays` 用表名；`progressView("map")` 用境域名。

### Task 6：旅程测试转绿

- [x] `journey.test.ts` 三个种子全部从标题点回标题，途中至少一次收契成功或放过、至少一次按 id 选机缘、至少一次到 victory 或 defeat。
- [x] `pnpm test`、`pnpm check:forbidden`、`pnpm sync:core`、`pnpm sync:presentation`。

### Task 7：Cocos 真机点一局（人工）

- [ ] 在 Cocos 预览（`localhost:7456`）从 `boot.scene` 点完一局短征，截图 title / battle / catch / summary / victory 或 defeat，逐张看。**卡住条件：** 本机没有预览进程时记为未完成，不用无头测试冒充。

## 执行记录（2026-10-31）

- Task 0：`journey.test.ts` 先红在缺 `waitingFor()`（不是要证明的卡点），补上只读方法后红在 #1 收契死锁。
- 与计划的出入：
  - Task 2 原写"「继续」禁用直到选一项"。实现改为「继续」恒可用、文案改成"不领，继续赶路"，因为 `progress.test.ts` 锁定"结算页主按钮恒可用"（安全继续路径，ui-productization 规格）。不再替玩家默认领第一项。新增 `ClassicSlice.skipBoon()`，推进规则与 `takeBoon` 共用，`takeBoon` 行为不变。
  - 顺手修了探针没覆盖到但同类的问题：`bag.use` / `switch.pick` 原来点一下就直接生效（可能一次点击用两瓶药），改成选中后由 `.confirm` 执行；对训练者的战斗里「走」改为禁用并给原因（core 会拒绝，原来点了无反应）。
  - Task 4 的"结局提交有反馈"不需要改：AppShell 执行命令后本来就重投影并重挂，`outcome.commit` 后提交按钮按 `committed` 变灰。探针里"按了不变"只是因为它比较的是旧模型。回厅改为清空 run，账号留给下一局；`product-run.ts` 不再每局用开机时的空账号。
- 旅程统计（三个种子都从标题点回标题，均为短征通关）：

| 种子 | 点击数 | 出术 | 选目标 | 收契 | 放过 | 选机缘 | 提交 |
|---|---|---|---|---|---|---|---|
| b3a | 186 | 41 | 1 | 5 | 11 | 19 | 1 |
| b3b | 175 | 38 | 0 | 5 | 11 | 19 | 1 |
| b3c | 211 | 50 | 0 | 5 | 11 | 19 | 1 |

  三局都是胜局，没有走到败局页；败局页的提交与回厅由 `outcome.test.ts` 覆盖，旅程未覆盖。
- `pnpm test`：core 263 / presentation 354 / platform 17，含类型检查与 vendor 漂移检查；`pnpm check:forbidden` clean。
- `pnpm test` 的类型检查只覆盖 `packages/`，不覆盖 `assets/scripts/`。另用 Cocos 的 `temp/declarations/cc.d.ts` 加指向 `creator-entry.ts` / presentation 源码的 vendor 替身，对 `AppShell.ts`、`product-run.ts` 做了一次 strict 类型检查：本次改动无报错。唯一报错是 `AppShell.ts:64` 的 `type AccountProgress` 从 `jinglingCore` 导入，而 `creator-entry.ts` 没导出它；这一行在 HEAD 就存在，不是本次引入，Cocos 编译只擦类型所以运行不受影响。记为缺口：`assets/scripts/` 没有类型检查门。
- **Task 7 未完成**：本机 `localhost:7456` 没有预览进程，Cocos Creator 未运行。
- 2026-11-01：负责人开了预览但画面空白。查到三个在 HEAD 就有的渲染问题并修掉（`app-shell-contract.test.ts`、`u16-skin-skeleton.test.ts` 加了回归测试）：
  1. 壳层根节点继承 Boot 的 DEFAULT 层，UI 相机只画 UI_2D/UI_3D → 改为固定 `Layers.Enum.UI_2D`。
  2. Boot 挂在 UI 相机（z=1000）下，整页贴在相机平面上被裁 → 宿主 `setWorldPosition(x, y, 0)`。
  3. 先设尺寸再赋 `spriteFrame`，尺寸被重设成贴图原尺寸（图标 256×256）→ 改为先赋图、设 CUSTOM、再设尺寸。
  修复后读帧缓冲确认：宿主在 UI_2D、世界 z=0、图标 34×34，画面中心是朱砂按钮与背景色。负责人截图确认标题页可见。

## 退出证据

`journey.test.ts` 三种子全绿；`pnpm test` 全绿；禁用词扫描通过；Task 7 的截图或"未完成"记录。
