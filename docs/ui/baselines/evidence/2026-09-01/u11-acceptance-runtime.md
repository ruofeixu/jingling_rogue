# U11 产品化总验收（2026-09-01）

对照产品规格 9.3 的七项总退出门逐项建立证据。

## 七项总门证据映射

| 门 | 结论 | 证据 |
|---|---|---|
| 1. 25 面可达、主任务与返回有效 | 通过 | 本页固定种子旅程 + reachability 25/25（legacy:[]、noModel:[]） |
| 2. 矩阵无缺项 + K1–K3 | 通过 | U10：250/250 组合零缺口 |
| 3. 两平台主包 ≤4 MiB + 性能预算 | 通过 | 微信 3,377,874 B、抖音 3,490,075 B；Draw Call 峰值 49≤120 |
| 4. 对比度/热区/非颜色/动效/焦点/文本放大 | 通过 | U10 audit 套件 + real-tokens（含反向坏夹具） |
| 5. 截图元数据齐全、横屏可完成一局 | 通过 | 本页竖横各 8 步旅程，每张截图带 platform/orientation/分辨率/DPR/时间戳 |
| 6. 全量测试/禁用词/审计/构建/Python | 通过 | 见下方一次性快照 |
| 7. clean-room 复核 | 通过 | 禁用词 clean；无 Phaser/上游源码/官方角色引用；立绘 54 张本地原创 |

## 固定种子旅程（标题→模式→初始→战斗→战后→地图→结局→回厅）

### portrait

| # | 页 | renderer | state | 宿主数 | 主行动 | 截图 |
|--:|---|---|---|--:|---|---|
| 1 | title | presentation | normal | 1 | title.start-run | u11-journey-portrait-01-title.png |
| 2 | mode | presentation | normal | 1 | mode.select.sprint | u11-journey-portrait-02-mode.png |
| 3 | starter | presentation | normal | 1 | starter.confirm | u11-journey-portrait-03-starter.png |
| 4 | battle | presentation | normal | 1 | battle.art | u11-journey-portrait-04-battle.png |
| 5 | summary | presentation | normal | 1 | summary.continue | u11-journey-portrait-05-summary.png |
| 6 | map | presentation | normal | 1 | map.rest | u11-journey-portrait-06-map.png |
| 7 | victory | presentation | normal | 1 | outcome.commit | u11-journey-portrait-07-victory.png |
| 8 | title | presentation | normal | 1 | title.start-run | u11-journey-portrait-08-title.png |

### landscape

| # | 页 | renderer | state | 宿主数 | 主行动 | 截图 |
|--:|---|---|---|--:|---|---|
| 1 | title | presentation | normal | 1 | title.start-run | u11-journey-landscape-01-title.png |
| 2 | mode | presentation | normal | 1 | mode.select.sprint | u11-journey-landscape-02-mode.png |
| 3 | starter | presentation | normal | 1 | starter.confirm | u11-journey-landscape-03-starter.png |
| 4 | battle | presentation | normal | 1 | battle.art | u11-journey-landscape-04-battle.png |
| 5 | summary | presentation | normal | 1 | summary.continue | u11-journey-landscape-05-summary.png |
| 6 | map | presentation | normal | 1 | map.rest | u11-journey-landscape-06-map.png |
| 7 | victory | presentation | normal | 1 | outcome.commit | u11-journey-landscape-07-victory.png |
| 8 | title | presentation | normal | 1 | title.start-run | u11-journey-landscape-08-title.png |

每步宿主数恒为 1，无旧新双挂载；竖横两遍均在 presentation 上完成完整一局。

## 一次性全量门禁快照（9.3 第 6 项）

```
pnpm test         core 234 | presentation 271 | platform 17  passed
pnpm test:py      tools 42 passed | server 9 passed
check:forbidden   clean
check:pack        564,042 B (limit 4,194,304)
validate:game     minigame templates ok
check:ui-productization  25 matrix entries, 3 keyframes
check:release     PASS（runtime docs x6 / 旅程竖横各 8 步 / reachability 25/25 / 两平台包体 / forbidden clean）
```

发布审计脚本 tools/check_release_acceptance.py 有 8 项先 RED 的阻断测试：
缺 runtime 文档、缺截图元数据、缺截图文件、reachability 不全、主包超 4 MiB、
禁用词命中、旧新双挂载都会阻断发布。

## 旧 Boot 呈现退役决策

**结论：保留旧 Boot 作为受控回退窗口，不在本次验收中删除。**

依据：

1. AppShell 至今未挂到 boot.scene（U1 决策，避免与 Boot 争 view.setDesignResolutionSize 两个视口所有者）。
2. 旧 Boot 仍驱动真实战斗数值与账号写入；presentation 侧的 battle/overlay/progress/outcome
   用真实形状的只读投影验证了渲染、五态、命令门禁、幂等与安全继续路径，但尚未接管真实回合驱动与存档 IO。
3. 路线图明确要求 U11 不顺手删除未验证边界。真正的"接线（把 dispatch 落到 core 命令与存档）+ 删除旧 Boot"
   需要独立阶段，带自己的失败测试与真机旅程。

因此另立后续计划承接（建议 U12：presentation 接管真实回合与存档 IO；U13：旧 Boot 删除），
本阶段不执行删除。

## 已知技术债（移交后续）

- presentation 尚未接管真实回合驱动与存档 IO（宿主注入真实形状投影）。
- SlotSummary[] 仍由宿主注入而非真实存档 IO 读取。
- 平台真机 FPS/内存由平台工具采样（V0 口径），本仓库门禁只钉 Draw Call 与包体。
- DiagnosticsView 可用 U2 组件替换。
