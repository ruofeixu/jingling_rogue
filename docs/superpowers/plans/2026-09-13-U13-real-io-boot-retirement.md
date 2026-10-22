# U13：真实定价/存档接线与旧 Boot 退役决策（2026-09-13）

**上游：** U12 完成记录移交项。

**前置：** V0、U1–U12 完成。RunController 已接真实回合驱动；壳层 command 意图真正执行。

## 目标

1. 把 RunController 的两处 U12 占位换成真实来源：
   - 商店定价：`progressView("shop")` 用 `stockForWave` 的真实 `cost`，而不是 BoonRow.value。
   - 存档 IO：`save/load` 走 `saveRunLocal/loadRunLocal/saveAccountLocal/loadAccountLocal`（注入 KvStore），
     而不是自拼 JSON。
2. 对"旧 Boot 退役"给出**基于证据的决策**，并落地一个可逆、安全的处置，而不是直接删除
   正在发货的入口。

## 非目标（安全边界）

- **不删除旧 Boot、不改 boot.scene 挂载**——Boot 是当前实际发货的 UI 入口，
  在 AppShell 未经真机端到端验证全面替代前，删除它是高爆炸半径、难回滚的操作，
  违反安全准则。U13 只做决策与可逆处置。
- 不改战斗数值、掉落、事件权重。

## 关键设计

### RunController 真实定价
`progressView("shop")` 改为：读取 `stockForWave(run.wave)` 得到真实 `{id,name,cost}`，
与当前 shop 可购集合取交集，喂给 `selectRunProgress`。买不起原因由既有 selector 依 gold 计算。

### RunController 真实存档
- 构造时可注入 `KvStore`（默认内存实现，供测试）。
- `save(slot)` → `saveRunLocal(store,slot,run)` + `saveAccountLocal(store,account)`。
- `load(slot)` → `loadRunLocal`+`loadAccountLocal` → `ClassicSlice.fromState`。
- `listSlots()` → 读 5 个槽，返回 `SlotSummary[]`（供 slots 页真实数据，替代宿主注入）。

### 旧 Boot 退役决策
可逆处置：在 `manifest` 增加一个受控开关（默认关）记录"AppShell 是否已可作为独立入口"，
并写一份退役条件清单（真机端到端旅程、两平台、存档兼容、无双入口）。**满足前不删 Boot。**

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/core/src/run/run-controller.ts` | 真实定价 + KvStore 存档 + listSlots |
| `packages/core/src/run/run-controller.test.ts` | 真实 cost、KvStore 往返、listSlots、幂等 |
| `docs/ui/baselines/evidence/2026-09-01/u13-retirement-decision.md` | 退役条件与决策 |

## 失败测试（先 RED）

1. `progressView("shop")` 的条目 cost 等于 `stockForWave(wave)` 的真实值（非 0/占位）。
2. 注入 KvStore：`save(2)` 后新 controller `load(2)` 得到等价 run（经真实 codec+store）。
3. `listSlots()` 对空 store 返回 5 个空槽；写入某槽后该槽非空且 wave 正确。
4. 未注入 store 时 `save/load` 明确报错，不静默吞。
5. 幂等与既有 8 项测试无回归。

## 退出门

- 商店定价与存档走真实来源，有测试。
- 旧 Boot 保留；退役决策文档给出可复核的条件清单与结论。
- U1–U12 全绿；两平台主包 ≤4 MiB；发布审计 PASS。
- core 仍不 import cc。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u13-retirement-decision.md` + RunController 12 项测试。

| 项 | 实测 |
|---|---|
| core / presentation / platform 测试 | 246 / 282 / 17 passed |
| Python（tools+server） | 42 + 9 passed |
| RunController 单测 | 12 项（原 8 + U13 新增 4：真实定价/KvStore 往返/listSlots/无 store 报错） |
| 禁用词 | clean |
| 微信 / 抖音主包 | 3,386,634 B / 3,498,835 B（≤4 MiB） |
| 两平台构建门禁 | 均 exit 0 |
| 发布审计 | PASS |

### 实现要点与决策

1. **真实定价**：`progressView("shop")` 改用 `stockForWave(wave)` 的真实 `{id,name,cost}`，
   测试断言每个条目的 cost 都来自真实 stock 表（非占位）。
2. **真实存档 IO**：RunController 构造可注入 `KvStore`；`save(slot)/load(slot)` 走
   `saveRunLocal/loadRunLocal/saveAccountLocal/loadAccountLocal`；`listSlots()` 读 5 槽返回真实状态；
   未注入 store 时 `save/load` 明确报错不静默。U12 的字符串往返改名 `serialize/deserialize`（无 IO）。
3. **旧 Boot 退役决策**：用工具确认 `assets/boot.scene` 挂的是 Boot、无 AppShell，Boot 是发货入口。
   **保留 Boot，不删除、不改场景挂载**——删除发货入口是高爆炸半径、难回滚操作，在 AppShell
   未经真机端到端替代验证前不执行。写出可复核的退役条件清单（真机完整一局、存档互读、
   两平台真机截图、单一视口所有者、受控回退窗口），全部满足后另开阶段执行物理删除。
   这符合"验收/收尾阶段不顺手删未验证边界"的纪律与安全准则。

## UI 产品化全链路状态

V0 + U1–U13 完成：25 面迁移 → 质量门 → 总验收 → 真实回合驱动 → 真实定价/存档接线 →
旧 Boot 退役决策。剩余的旧 Boot 物理删除是一个明确定义、有前置条件清单的独立后续阶段，
不属于当前收尾范围。
