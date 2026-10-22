# U9：结局与孵化（2026-09-09）

**上游：** [路线图 U9](./2026-08-31-ui-productization-roadmap.md)

**前置：** U1–U8 已完成，23/25 产品面已迁移，剩 `defeat`、`victory`、`hatch`。

## 目标

迁移最后三页。核心不是排版而是**幂等**：结算只记一次，重复点按、
中断恢复、跳过动画都不改变结果。

## 非目标

- 不改结算公式、蛋孵化规则、成就判定。
- 不做性能与 a11y 硬门（U10）。

## 数据来源（只读）

新增 selector `selectOutcome(...)`：投影胜负、本局明细、是否已提交（`committed`）、
孵化揭晓内容与资源状态。**明细缺失时给出可理解的占位而不是空白。**

## 幂等模型

关键设计：`committed: boolean` 由 selector 给出。
- `committed === false` → 提交动作可用。
- `committed === true` → 提交动作禁用并写明"已经记下了"，同时"回厅"可用。

这样重复点按在模型层就无法产生第二次提交，中断恢复后重新投影也会落到同一状态。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/core/src/ui/selectors.ts` | 追加 `selectOutcome` |
| `packages/core/src/ui/selectors.test.ts` | 胜/负/孵化 + 缺失明细 + committed |
| `packages/presentation/src/screens/outcome.ts` | 三个 builder + 跳过动画 |
| `packages/presentation/src/screens/outcome.test.ts` | 幂等、重复点按、跳过一致、五态 |
| `assets/scripts/app/screens/OutcomeScreen.ts` | 三页共享 renderer |

## 失败测试（先 RED）

1. 提交幂等：`committed` 为真时提交动作禁用带原因；回厅仍可用。
2. 重复点按：同一模型连续解析两次意图相同；模型本身确定性。
3. 中断恢复：`committed=false` → `true` 两次投影分别落到"可提交"与"已提交"。
4. 明细缺失：空明细进入 `empty` 但仍可理解、仍可回厅。
5. 孵化跳过：`skipped: true` 与 `false` 的揭晓内容**完全一致**（只差动画时长）。
6. 资源错误：`art: "error"` 时给出重试动作，回厅仍可用。

## 退出门

- 三页 manifest 为 `presentation`；25 产品面全部迁移。
- 幂等、跳过一致、回厅路径有实测证据。
- U6–U8 无回归；仓库全量验证通过；主包 ≤ 4 MiB。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u9-outcomes-runtime.md` 与同目录 4 张 `u9-*.png`。

| 项 | 实测 |
|---|---|
| core / presentation / platform 测试 | 234 / 233 / 17 passed |
| Python | 34 + 9 passed |
| **产品面覆盖** | **25/25 全部 `presentation`，`legacy: []`、`noModel: []`** |
| 幂等 | committed 由 false→true 后提交禁用（「已经记下了，不会重复计入」），明细行不变，回厅仍可用 |
| 跳过一致 | hatch 播放/跳过两种情况 `lines` 完全相同，仅差一个 `outcome.skip` 动作 |
| 明细缺失 | 进入 empty 且给出「这一局没有留下明细，仍可记下并回厅」，回厅可用 |
| 资源错误 | 出现 `outcome.retry-art`，回厅仍可用 |
| 载入中 | 提交禁用并写明「正在载入，稍等一下」 |
| 横屏 | u9-hatch-landscape.png 正常 |
| 门禁 | 禁用词 clean、`check:pack` 555,270 B、`validate:game` ok、覆盖审计 25 项 |
| 微信真实构建 | 主包 3,372,959 B，`check:cocos-build` exit 0 |

### 实现要点与偏差

1. 幂等做在**模型层**：`selectOutcome` 输出 `committed`，`buildOutcomeModel` 在其为真时
   直接把提交动作构造成禁用态。这样"重复点按"在数据层就不可能产生第二次提交，
   不依赖 renderer 自己去做防抖。中断恢复同理——重新投影必然落到同一状态。
2. 跳过动画的一致性用 `lines` 相等来钉死：`skipped` 只影响是否提供 `outcome.skip` 动作
   与动效时长，绝不参与内容构造。
3. 三页共用 `buildOutcomeModel` 与 `OutcomeScreen`（仍复用 `ListView`），与 U7/U8 一致。
4. **manifest 测试结构变更**：25 页全部迁移后不再存在"未迁移样例"，
   原先依赖 `legacy` 默认值的两个用例改为通过 `withRenderer(..., "legacy")` 显式回退来验证
   单一所有者与逐页回退。这是全量迁移的必然结果，已在此记录。
5. 结算数字与账号写入的真实接线（把 `outcome.commit` 落到 `AccountProgress`）
   仍属 U11 收口范围；本阶段验证的是模型契约与 UI 行为。
