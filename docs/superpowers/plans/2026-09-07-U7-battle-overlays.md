# U7：战斗子界面（2026-09-07）

**上游：** [路线图 U7](./2026-08-31-ui-productization-roadmap.md) · [产品规格](../specs/2026-08-31-ui-productization.md)

**前置：** U1–U6 已完成。

## 目标

迁移六个战斗弹层：`arts`、`switch`、`party`、`bag`、`target`、`catch`。
同时在壳层建立**弹层栈**：打开/关闭、取消语义、关闭后焦点回到触发控件。

## 非目标

- 不改术法效果、换位规则、捕获率、物品效果。
- 不迁移 `summary`/`shop`/`omen`/`map`（U8）。
- renderer 不计算合法性——合法性由 selector 给出。

## 数据来源（只读）

新增 selector `selectBattleOverlays(battle)`：一次性投影六个弹层需要的列表与锁定原因
（可用术法及其消耗、可换伙伴、队伍状态、囊内物品、合法目标、可用镇物）。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/core/src/ui/selectors.ts` | 追加 `selectBattleOverlays` |
| `packages/core/src/ui/selectors.test.ts` | 六类列表与空态、锁定原因 |
| `packages/presentation/src/screens/overlays.ts` | 六个 builder + 取消动作 |
| `packages/presentation/src/screens/overlays.test.ts` | 表驱动五态、空态、非法目标、单次提交 |
| `packages/presentation/src/overlay-stack.ts` | 弹层栈模型：push/pop/焦点恢复 |
| `packages/presentation/src/overlay-stack.test.ts` | 连续开关、取消、焦点恢复 |
| `assets/scripts/app/screens/OverlayScreen.ts` | 共享弹层 renderer |
| `packages/presentation/src/u7-contract.test.ts` | renderer 不判合法性、无颜色字面量 |

## 失败测试（先 RED）

1. 六页各自：无可用项时进入 `empty` 并给出下一步；主行动唯一。
2. 非法目标必须 `enabled:false` 且带原因；renderer 不得自行过滤。
3. 弹层栈：连续 push 三层后 pop 顺序正确；每层记录触发控件 id，pop 后可取回。
4. 取消语义：`cancel` 动作永远可用（即使列表为空），且不产生 core 命令。
5. 单次提交：同一选择 action 连续两次解析出的意图相同，不累积。
6. `party` 即使没有 TOUR stop 也必须在覆盖审计中出现（页面矩阵已含 `party`）。

## 退出门

- 六页在 manifest 中为 `presentation`；五态与竖横屏可渲染，截图入档。
- 弹层关闭后焦点回到触发控件（模型层记录并可断言）。
- 战斗主界面无回归；逐页回退有效。
- 仓库全量验证通过；主包仍 ≤ 4 MiB。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u7-overlays-runtime.md` 与同目录 7 张 `u7-*.png`。

| 项 | 实测 |
|---|---|
| core / presentation / platform 测试 | 234 / 197 / 17 passed |
| Python | 34 + 9 passed |
| manifest | 19 页 `presentation`，6 页 `legacy` |
| 六弹层 | arts / switch / party / bag / target / catch 全部 `presentation` + `list-view` 渲染 |
| 非法项 | 保留在列表中但禁用并带原因（用尽的术、倒下伙伴、倒下敌人、缺货镇物） |
| 取消 | 全部弹层 `overlay.cancel` 恒可用（含空列表） |
| 弹层栈 | battle→arts→target 深度 1→2；关闭 1→0 |
| 焦点恢复 | 依次回到 `arts.pick.a1`、`battle.art`，最后回到 battle |
| 横屏 | u7-target-landscape.png 正常 |
| 回归 | battle / title / starter / codex-list 无回归 |
| 门禁 | 禁用词 clean、`check:pack` 543,969 B、`validate:game` ok、覆盖审计 25 项 |
| 微信真实构建 | 主包 3,366,091 B，`check:cocos-build` exit 0 |

### 实现要点与偏差

1. `selectBattleOverlays(source)` 一次性投影六类列表，锁定原因在 selector 里给出；
   presentation 与 renderer 都不判合法性，只显示。
2. 六个弹层共用一个 builder `buildOverlayModel({kind,...})`，由 `SPECS` 表决定标题、
   主行动文案与空态提示。避免六份近乎相同的代码。
3. renderer 层直接复用 U4 的 `ListView`（`OverlayScreen` 只是薄封装），
   因为六个弹层的产品形态就是"列表 + 主行动 + 返回"。这是相对计划的简化，已在此记录。
4. 焦点恢复实现在模型层：`OverlayLayer` 记录 `triggerActionId`，`closeOverlay` 返回
   `focusActionId`，壳层通过 `currentFocusActionId()` 暴露以便断言。真实键盘焦点属于 U10 a11y。
5. `party` 有独立截图与独立实测行，满足路线图"party 需独立证据"的要求。
6. 弹层的 core 命令提交仍由宿主完成（壳层不驱动回合，与 U6 一致），
   真正接 `choose()` 属于 U11 收口。单次提交语义已在模型层用确定性测试钉死。
