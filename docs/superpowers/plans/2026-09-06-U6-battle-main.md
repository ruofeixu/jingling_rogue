# U6：战斗主界面（2026-09-06）

**上游：** [路线图 U6](./2026-08-31-ui-productization-roadmap.md) · [产品规格](../specs/2026-08-31-ui-productization.md) · [关键帧](../../ui/keyframes/battle.svg)

**前置：** U1–U5 已完成。

## 目标

只迁移 `battle` 一页：战场层、敌我名牌、战况文本、上方工具、右侧术法入口、命令可用性与增量更新。

## 非目标

- 不改战斗规则、伤害公式、随机结果、命令语义。
- 不迁移 `arts`/`switch`/`party`/`bag`/`target`/`catch`（U7）。
- renderer 不得计算伤害或改状态——只渲染 ScreenModel。

## 数据来源（只读）

新增 selector `selectBattle(battle, run)`：投影敌我名牌（名字、等级、HP 当前/上限）、
波次、金钱、队伍点位、可用命令与禁用原因、战况文本。

派生值一律取自 core 现有对象，不在 selector 里重算规则。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/core/src/ui/selectors.ts` | 追加 `selectBattle` |
| `packages/core/src/ui/selectors.test.ts` | 名牌、HP、命令可用性、无战斗时的空态 |
| `packages/presentation/src/screens/battle.ts` | `buildBattleModel`：命令顺序、名牌、战况 |
| `packages/presentation/src/screens/battle.test.ts` | 命令顺序固定、禁用原因、五态、增量确定性 |
| `assets/scripts/app/screens/BattleScreen.ts` | 战场 + 名牌 + 命令 + 战况 |
| `packages/presentation/src/u6-contract.test.ts` | renderer 不算伤害不改状态 |

## 失败测试（先 RED）

1. 命令顺序固定为 术 / 队伍 / 囊 / 走，且同一输入两次构造完全相等。
2. 每个不可用命令必须有文字原因（例如无可用术、囊内无物）。
3. 名牌必须含名字、等级、HP 当前/上限；HP 为 0 时标记倒下。
4. 五态齐全；`loading` 下所有命令禁用并说明原因。
5. 没有战斗时进入 `empty` 并给出下一步。
6. renderer 契约：不含 `applyArt`、`speciesCatchRate`、`openBattle` 等玩法符号，也不含颜色字面量。

## 退出门

- `battle` 在 manifest 中为 `presentation`；五态与竖横屏可渲染，截图入档。
- 命令顺序与禁用原因与迁移前一致；重复点击不产生双重提交。
- 逐页回退有效；U3–U5 页面无回归。
- 仓库全量验证通过；主包仍 ≤ 4 MiB。
- 性能硬门（95% ≥50 FPS、峰值 Draw Call ≤120）留到 U10 统一采样，本阶段记录 Draw Call 对照值。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u6-battle-runtime.md` 与同目录 4 张 `u6-battle-*.png`。

| 项 | 实测 |
|---|---|
| core / presentation / platform 测试 | 234 / 168 / 17 passed |
| Python | 34 + 9 passed |
| manifest | 12 页 `presentation`（含 battle），其余 13 页 `legacy` |
| 命令顺序 | 恒为 `battle.art` / `battle.party` / `battle.bag` / `battle.flee` |
| 命令门禁 | 无战斗 4/4 禁用；进行中 0 禁用；无术+单人+空囊 3 禁用，各带文字原因 |
| 名牌 | 敌我均含名字、Lv、HP 当前/上限；HP 0 显示「倒下」 |
| Draw Call | 峰值 49（U10 硬门 120） |
| 逐页回退 | battle 切回 legacy → `renderer=legacy`、模型为空 |
| 回归 | title / mode / starter / codex-list 全部无回归 |
| 门禁 | 禁用词 clean、`check:pack` 533,927 B |
| 微信真实构建 | 主包 3,359,682 B，`check:cocos-build` exit 0 |

### 实现要点与偏差

1. 新增 selector `selectBattle(battle, run, log)`：只投影名牌、波次、金钱、队伍存活数与命令锁定原因。
   命令锁定条件复用现有战斗状态（`artIds` 为空 / 存活伙伴 ≤1 / `potions` 为 0），不新增规则。
2. selector 用结构化入参（`BattleLike` / `RunLike`）而不是直接依赖 `PartyBattle` 类型，
   避免 UI 投影层反向耦合战斗实现细节；测试用最小对象覆盖。
3. renderer 契约禁止 `applyArt`、`speciesCatchRate`、`openBattle`、`startPartyBattle`、`choose(`
   以及对 `hp` 的算术，确保"不算伤害不改状态"。布局用的 `Math.floor` 属于排版，已从禁列中移除
   并改为更精确的 hp 算术检测。
4. 受击反馈用 `motionDurationMs(MOTION.fast, reduceMotion)`，减少动效下自动压到 150 ms 以内。
5. 战斗视图由宿主 `setBattleView` 注入；壳层不持有战斗对象，也不驱动回合。真正接 `openBattle`
   属于 U11 收口（旧 Boot 仍在跑真实战斗），本阶段用真实形状的投影验证渲染与门禁。
