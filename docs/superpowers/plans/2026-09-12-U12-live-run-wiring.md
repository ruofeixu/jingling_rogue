# U12：presentation 接管真实回合驱动与存档 IO（2026-09-12）

**上游：** U11 完成记录中的移交项。[路线图](./2026-08-31-ui-productization-roadmap.md) 已到 U11；本阶段为路线图之外、U11 明确记录的后续接线阶段。

**前置：** V0、U1–U11 全部完成。25/25 产品面已迁移；壳层 `dispatch` 目前对 `command` 类意图只 `console.log`，未真正执行——这是 U11 记录的技术债。

## 目标

让 presentation 侧的 battle / overlay / progress / outcome 由**真实 core run session 驱动**，
不再依赖宿主注入的只读投影。壳层的每个 action id 解析成 CommandIntent 后，交给一个 core 侧的
`RunController` 执行真实命令（开局、出术、换位、用物、放过、下一波、买/机缘/进节点、结算提交），
再由既有 selector 重新投影出 ScreenModel。

## 非目标

- 不改战斗数值、掉落、商店定价、事件权重、捕获率（这些留在 core 既有实现）。
- 不改 25 个 ScreenModel 的形状与既有测试。
- 不删旧 Boot（U13 负责，删除前需本阶段接线充分验证）。
- 不改存档服务端协议（只接客户端 save codec 的读写）。

## 关键设计

### RunController（core，新增）
薄编排层，包住既有 `createRun / nextEncounter / openBattle / applyBoon / useBagItem /
commitParty / recordCatch` 与 save codec。对外只暴露：
- `startRun(opts)`、`chooseStarter(id)`、`confirmStarter()`
- 战斗：`useArt(artId, targetId?)`、`switchTo(id)`、`useItem(id)`、`flee()`
- 推进：`continueSummary()`、`buy(id)`、`leaveShop()`、`pickOmen(id)`、`skipOmen()`、`enterNode(id)`、`rest()`
- 结局：`commitOutcome()`、`toLobby()`
- 只读投影：`battleView()`、`overlaysView()`、`progressView(kind)`、`outcomeView(kind)`（复用现有 selector）
- 存档：`save(slot)`、`load(slot)`、`listSlots()`（接 save codec）

RunController 不 import `cc`，纯 TS，可无头测试。它是**唯一**改真实 run/account 状态的地方。

### dispatch.ts（presentation，扩展）
把 battle/overlay/progress/outcome/starter 的 action id 解析成 CommandIntent；命令命名空间与
既有 `*_ACTIONS` 常量一一对应。仍不 import core、不执行。

### AppShell（renderer，改）
`dispatch()` 的 command 分支不再 `console.log`，改为调用注入的 controller 回调，然后 `route()` 重投影。
`setBattleView` 等注入方法保留（供演示/测试），但真实运行改由 controller 提供视图。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/core/src/run/run-controller.ts` | RunController 编排层 |
| `packages/core/src/run/run-controller.test.ts` | 命令幂等、非法命令拒绝、存档往返、状态推进 |
| `packages/presentation/src/dispatch.ts` | 扩展 5 个命名空间的意图解析 |
| `packages/presentation/src/dispatch.test.ts` | 每个 action id → 正确 CommandIntent |
| `assets/scripts/app/AppShell.ts` | dispatch 接 controller；真实视图来源切换 |
| `packages/presentation/src/u12-contract.test.ts` | controller 回调注入契约；壳层仍不算玩法 |

## 失败测试（先 RED）

1. dispatch：`battle.art` / `arts.pick.a1.confirm` / `shop.buy.s1` / `outcome.commit` 等
   都解析成带正确 payload 的 CommandIntent（当前会抛 unknown action）。
2. RunController 幂等：`commitOutcome()` 调两次只写一次账号。
3. 非法命令拒绝：无术时 `useArt` 抛错或返回未变更状态，不破坏 run。
4. 存档往返：`save(slot)` 后 `load(slot)` 得到等价 run（codec round-trip）。
5. 真实推进：`startRun → useArt` 直到战斗结束，`battleView()` 的 HP 随命令变化。
6. 接线后旅程：同一组 CommandIntent 序列驱动，selector 视图与 U6–U9 断言一致。

## 退出门

- 壳层 command 意图真正执行，battle/overlay/progress/outcome 由 RunController 驱动。
- 固定种子旅程用**真实命令**跑通（不再注入投影），竖横各一遍，截图入档。
- 存档往返有测试；结算幂等有测试。
- U1–U11 全部无回归；250 组合矩阵仍零缺口；两平台主包仍 ≤4 MiB。
- core 仍不 import cc；层边界契约不破。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u12-live-runtime.md` + `u12-live.json` + `u12-live-battle.png`。

| 项 | 实测 |
|---|---|
| core / presentation / platform 测试 | 242 / 282 / 17 passed |
| Python（tools+server） | 42 + 9 passed |
| RunController 单测 | 8 项：开局/出术改状态/非法术拒绝/提交幂等/存档往返/视图投影/命令路由/初始账号 |
| dispatch 扩展 | 5 命名空间解析，11 项测试通过 |
| 壳层接线契约 | u12-wiring：壳层不含 openBattle/applyBattleEnd/ClassicSlice/choose |
| 真实引擎实测 | 点 battle.art → dispatch → execute → 重投影，敌 HP 20→15→10，宿主恒 1 |
| 禁用词 | clean |
| 微信 / 抖音主包 | 3,385,547 B / 3,497,748 B（≤4 MiB） |
| 两平台构建门禁 | 均 exit 0 |

### 实现要点与偏差

1. **RunController 是唯一改真实 run/account 状态的地方**：包住既有 `ClassicSlice` + 活动 `PartyBattle`，
   通过 `execute(command,payload)` 落命令，用既有 selector 投影，`save/load` 走 codec。不 import cc。
2. 给 `ClassicSlice` 增加 `fromState(run,account)` 静态工厂，支持从存档重建（不重新掷种）。
3. dispatch 扩展 5 个命名空间：无参命令白名单 + 弹层 `<ns>.pick.<id>` / `<ns>.pick.confirm`
   + 带 id 的推进命令。仍纯数据、不 import core。
4. 壳层用结构化 `RunControllerLike` 句柄，不 import RunController 类，保持"壳层无玩法"契约；
   dispatch 的 command 分支接 controller，无 controller 时退回演示日志。
5. **接线过程发现的真实缺陷**：首次运行时验证失败，根因是改了 `dispatch.ts` 后未 `pnpm sync:presentation`，
   构建里的 `resolveAction` 仍是旧版对 `battle.art` 抛 unknown。同步后 HP 随命令递减，验证通过。
   这正是仓库约定"改 presentation 要 sync:presentation"的意义所在，已记录。
6. **偏差（移交 U13）**：商店定价用 BoonRow.value 占位（真实定价在 stockForWave）；
   结算落库由宿主 save() 承接；旧 Boot 保留，删除归 U13。

## 后续（U13）

真实商店定价接线、宿主真实存档 IO 接线、旧 Boot 删除与 boot.scene 挂载决策。
