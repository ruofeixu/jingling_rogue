# U8：局内推进页（2026-09-08）

**上游：** [路线图 U8](./2026-08-31-ui-productization-roadmap.md)

**前置：** U1–U7 已完成。

## 目标

迁移 `summary`、`shop`、`omen`、`map` 四页，覆盖奖励比较、费用/条件、事件选择、
境域可达性，并保证每页都有**安全继续路径**（任何状态下都存在一个可用的前进/退出动作）。

## 非目标

- 不改奖励公式、商店定价、事件权重、地图生成。
- 不迁移 `defeat`/`victory`/`hatch`（U9）。

## 数据来源（只读）

新增 selector `selectRunProgress(...)`：投影结算差值、商店条目与买不起原因、
机缘选项与不可选原因、地图节点与不可达原因。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/core/src/ui/selectors.ts` | 追加 `selectRunProgress` |
| `packages/core/src/ui/selectors.test.ts` | 四类投影 + 空态 + 费用不足 |
| `packages/presentation/src/screens/progress.ts` | 四个 builder |
| `packages/presentation/src/screens/progress.test.ts` | 表驱动五态、安全继续路径、重复提交 |
| `assets/scripts/app/screens/ProgressScreen.ts` | 四页共享 renderer |
| `packages/presentation/src/u8-contract.test.ts` | renderer 不算价格/权重 |

## 失败测试（先 RED）

1. **安全继续路径**：四页 × 五态共 20 个组合，每个组合必须至少有一个 `enabled` 动作。
2. `summary`：本轮无变化时进入 `empty` 并仍可继续；有奖励时给出前后对比。
3. `shop`：钱不够的条目禁用并写明差额；重复购买同一 action 解析结果相同。
4. `omen`：无事件时 `empty`；不可选项带原因。
5. `map`：无可达节点时 `empty` 且仍有退出路径；不可达节点禁用带原因。
6. 确定性：同一输入两次构造模型完全相等。

## 退出门

- 四页 manifest 为 `presentation`；五态与竖横屏截图入档。
- 20 个组合的安全继续路径全部有实测证据。
- U6/U7 无回归；仓库全量验证通过；主包 ≤ 4 MiB。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u8-progress-runtime.md` 与同目录 5 张 `u8-*.png`。

| 项 | 实测 |
|---|---|
| core / presentation / platform 测试 | 234 / 210 / 17 passed |
| Python | 34 + 9 passed |
| manifest | 23 页 `presentation`，2 页 `legacy`（`defeat`、`victory`、`hatch` 中的剩余项归 U9） |
| 安全继续路径 | 四页主行动分别为 `summary.continue` / `shop.leave` / `omen.skip` / `map.rest`，normal 与 empty 下均 enabled |
| 20 组合 | 模型层测试覆盖 4 页 × 5 态；loading 按 U2 约定全禁用，其余 16 组合主行动必可用 |
| 费用不足 | 「还差 50 钱」写出差额；卖光另给原因 |
| 条件不足 | 机缘写出「需要灶属伙伴」 |
| 不可达 | 地图节点写出「从这里走不过去」，行保留不过滤 |
| 前后对比 | summary 显示「钱 10 → 30」「等级 4 → 5」 |
| 横屏 | u8-map-landscape.png 正常 |
| 回归 | battle / arts / target / title / starter 无回归 |
| 门禁 | 禁用词 clean、`check:pack` 550,173 B |
| 微信真实构建 | 主包 3,369,940 B，`check:cocos-build` exit 0 |

### 实现要点与偏差

1. `selectRunProgress(source)` 一次性投影四页数据；差额、卖光、条件、可达性都在 selector 算好。
2. 四页共用 `buildProgressModel({kind,...})` 与 `ProgressScreen`（同样复用 `ListView`），
   与 U7 一致的简化，已记录。
3. **安全继续路径的实现约定**：每页的主行动就是继续/离开动作，构造时不传禁用条件，
   因此除 `loading` 外恒可用。`loading` 是 U2 状态层的既有约定（瞬时态全禁用），
   本阶段不为了满足"每态都有可用动作"去破坏该约定，而是在测试与证据中显式区分并说明。
   这是相对计划中"20 个组合"表述的偏差：实际是 16 组合要求可用 + 4 组合要求全禁用。
4. 商店/机缘/地图的锁定行一律保留在列表中（不过滤），与 U7 的做法一致，
   保证玩家能看到"为什么不能选"。
5. 真实数据接线（从 run-session 取奖励/商店/地图）仍留给 U11 收口；
   本阶段用真实形状的投影验证渲染、门禁与继续路径。
