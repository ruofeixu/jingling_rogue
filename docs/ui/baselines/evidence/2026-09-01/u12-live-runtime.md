# U12 真实回合驱动接线验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。

## 目标

把壳层 dispatch 的 command 意图从"只 console.log"接到真实回合驱动：
renderer 回传 action id → dispatch → resolveAction → RunController.execute → 重投影。

## 1. RunController（core，唯一改真实 run/account 状态处）

- 包住既有 ClassicSlice 状态机 + 活动 PartyBattle，不重造循环。
- 命令入口 `execute(command, payload)`；只读投影复用既有 selector。
- 8 项单测覆盖：真实开局、出术改状态、非法术拒绝、提交幂等、存档往返、
  视图投影、命令路由、指定初始 + 空账号。core 全量 242 passed。

## 2. dispatch 扩展（presentation，纯数据）

battle / overlay（六面）/ progress / outcome / starter 的 action id 全部解析为
带正确 payload 的 CommandIntent；dispatch 测试 11 项通过；仍不 import core、不执行。

## 3. 壳层接线（renderer）

- 新增结构化句柄 `RunControllerLike` + `setRunController` 注入点；壳层不 import RunController 类。
- dispatch 的 command 分支：有 controller 则 `execute` 后 `refreshFromController` + 重投影；
  否则退回演示日志（保持无 controller 时可演示）。
- `u12-wiring` 契约测试：壳层不含 openBattle / applyBattleEnd / ClassicSlice / choose 等玩法符号。

## 4. 真实引擎实测（点击战斗按钮驱动真实链路）

在真实 Cocos 里注入桩 controller（记录 execute 调用、敌方 HP 每次命令 -5），
对 `button-battle.art` 派发 TOUCH_END（走 Button 绑定的真实 onAction→dispatch 链）：

| 步骤 | 战况行 |
|---|---|
| 初始 | 敌 灯蛾 20/20，命令数 0 |
| 第 1 次命令后 | 敌 灯蛾 15/20，命令数 1 |
| 第 2 次命令后 | 敌 灯蛾 10/20，命令数 2 |

`execute` 实际被调用两次（executed=["battle.art","battle.art"]），敌方 HP 20→15→10
随命令真实递减，宿主恒为 1（rendered=shell-host-presentation）。
这证明 renderer 侧接线链在真实引擎中生效；RunController 真实玩法行为由 core/presentation 测试覆盖。

按钮触摸绑定实测：只有 enabled 的 `battle.art` 与 `battle.flee` 有 TOUCH_END，
锁定的 `battle.party` / `battle.bag` 无绑定（与 U6 门禁一致）。

## 5. 全量与两平台

| 项 | 实测 |
|---|---|
| core / presentation / platform | 242 / 282 / 17 passed |
| Python tools / server | 42 / 9 passed |
| 禁用词 | clean |
| 微信主包 | 3,385,547 B（≤4 MiB） |
| 抖音主包 | 3,497,748 B（≤4 MiB） |
| 两平台构建门禁 | 均 exit 0 |

## 偏差与移交（U13）

- 商店条目定价：progress 投影当前用 BoonRow.value 占位，真实货摊定价在 stockForWave，
  接真实定价属 U13 收口范围。
- outcome 结算：commitOutcome 做了"只记一次"的幂等标记并推进 revision；
  真实账号明细写入已在 ClassicSlice.noteWin/noteLoss 完成，落库由宿主 save() 承接。
- 旧 Boot 仍在：本阶段只做接线与真实驱动验证，旧 Boot 删除仍归 U13。
