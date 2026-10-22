# 旧 Boot 退役决策（2026-09-01，U13）

## 现状（已用工具确认）

- `assets/boot.scene` 挂载的活动组件是 `Boot`（`@ccclass("Boot")`，`implements LobbyHost`）。
  场景中**没有** `AppShell`。Boot 是当前实际发货的唯一 UI 入口。
- Boot 自带一整套 lobby/battle/shop UI 与状态机（`start()` → `restore()` → `showTitle()`），
  直接驱动 `ClassicSlice` + `PartyBattle`，并读写本地存档。
- AppShell（U1–U12 的 presentation 入口）至今**未挂到任何场景**，只在运行时脚本里手动
  `addComponent('AppShell')` 做验证。U1 起就是这个决策，避免与 Boot 争
  `view.setDesignResolutionSize` 两个视口所有者。

## 决策

**保留旧 Boot，不在本阶段删除、不改 boot.scene 挂载。**

理由（安全边界）：
1. 删除 Boot 或把 boot.scene 的组件从 Boot 换成 AppShell，会**立刻改变正在发货的产品入口**，
   爆炸半径大、难以回滚。这类高风险操作在缺少"AppShell 已在真机端到端全面替代 Boot"的
   证据前不应执行。
2. AppShell 的真实回合驱动（U12 RunController）已在 web headless 验证渲染与接线链，
   但**尚未**在两平台真机上跑通完整一局并验证存档兼容与无双入口。这正是退役的前置条件，
   本阶段还未满足。

## 退役条件清单（全部满足后，另开阶段执行删除）

- [ ] AppShell 挂到 boot.scene 后，能独立完成"标题→模式→初始→战斗→战后→地图→结局→回厅"
      完整一局，**不依赖运行时手动注入**。
- [ ] RunController 接真实 KvStore（微信/抖音各自的本地存储适配），存档能与旧 Boot 写出的
      存档互读（codec 兼容已由 save codec 保证，需真机确认）。
- [ ] 两平台真机各跑通一局并截图，主包仍 ≤4 MiB。
- [ ] 视口/安全区所有权只剩 AppShell 一个，确认无 Boot 残留监听
      （`canvas-resize` / `window-resize`）。
- [ ] 一个受控回退窗口：保留 Boot 代码但不挂载，观察一个发布周期无回归后再物理删除。

## 本阶段已完成的可逆接线（降低退役风险）

- RunController 商店定价改用真实 `stockForWave`（不再占位）。
- RunController 存档改走真实 `saveRunLocal/loadRunLocal/saveAccountLocal/loadAccountLocal`，
  可注入 `KvStore`；`listSlots()` 提供 slots 页真实数据，替代宿主注入。
- 这些都是纯 core 改动，不触碰 boot.scene，可随时回滚。

## 结论

U13 完成"真实定价 + 真实存档 IO"接线，并对旧 Boot 给出可复核的退役条件与保留决策。
旧 Boot 的物理删除留待清单全部满足后的独立阶段，符合"验收/收尾阶段不顺手删未验证边界"的纪律。
