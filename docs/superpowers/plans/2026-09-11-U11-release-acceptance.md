# U11：产品化总验收与旧呈现退役决策（2026-09-11）

**上游：** [路线图 U11](./2026-08-31-ui-productization-roadmap.md) · [产品规格 9.3](../specs/2026-08-31-ui-productization.md)

**前置：** V0、U1–U10 全部完成，25/25 产品面已迁移，250 组合矩阵零缺口，两平台主包 ≤4 MiB。

## 目标

对产品规格 9.3 的七项总门逐项建立**新鲜证据**，并对"旧 Boot 呈现是否退役"做出有依据的决策。

## 非目标

- 不新增产品面或功能。
- 不在验收阶段顺手删除未验证边界（路线图明确禁止）。

## 七项总门 → 证据映射

| 门 | 证据来源 |
|---|---|
| 1. 25 面可达、主任务与返回有效 | U9 全量核对（legacy:[]、noModel:[]）+ 本阶段固定种子旅程 |
| 2. 矩阵无缺项 + K1–K3 | U10 250/250 + 关键帧审计 |
| 3. 两平台主包 ≤4 MiB + 性能预算 | U10 两平台构建 + measured-budget 快照 |
| 4. 对比度/热区/非颜色/动效/焦点/文本放大 | U10 audit 套件 + real-tokens |
| 5. 实际截图元数据齐全、横屏可完成一局 | 本阶段：带元数据的截图矩阵 + 横屏旅程 |
| 6. 全量测试/禁用词/审计/构建/Python | 本阶段一次性全绿快照 |
| 7. clean-room 复核 | 本阶段：check_forbidden + 素材/布局/动效来源复核 |

## 失败测试（先 RED，作为发布阻断）

新增 `tools/check_release_acceptance.py`：
1. 截图矩阵缺元数据（平台/分辨率/DPR/时间戳）→ 阻断。
2. 证据目录缺任一 U 阶段 runtime.md → 阻断。
3. 25 面覆盖记录缺页 → 阻断。
4. 主包字节回退超 4 MiB → 阻断。
5. 禁用词命中 → 阻断。
6. 旧新双挂载（同一 screenId 同时有 legacy 与 presentation 活动宿主）→ 阻断。

## 固定种子旅程

真实 web-mobile 构建，固定种子跑「标题→模式→初始→战斗→战后→地图→结局→回厅」，
竖屏与横屏各一遍，逐步截图并记录 action 流。

## 旧 Boot 退役决策

给出结论与依据，不在本阶段执行删除：
- 现状：AppShell 未挂到 boot.scene（U1 决策，避免与 Boot 争 viewport）。
- 旧 Boot 仍驱动真实战斗数值；presentation 侧战斗/推进/结局用真实形状投影验证渲染与契约。
- 决策：保留旧 Boot 作为受控回退窗口；另立"接线 + 删除"计划，不在验收里删未验证边界。

## 退出门

- 9.3 七项各有本阶段可复现证据。
- 发布审计脚本先 RED 后 GREEN。
- 独立复核无 Critical/Important。
- 旧 Boot 去留有明确书面决策。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u11-acceptance-runtime.md`、`u11-acceptance.json`、
竖横各 8 张 `u11-journey-*.png`。

| 项 | 实测 |
|---|---|
| core / presentation / platform 测试 | 234 / 271 / 17 passed |
| Python（tools+server） | 42 + 9 passed |
| 9.3 七项总门 | 全部通过（逐项证据见 runtime.md） |
| 固定种子旅程 | 竖横各 8 步全在 presentation，宿主数恒为 1，无双挂载 |
| 25 面可达 | reachability legacy:[]、noModel:[] |
| 两平台主包 | 微信 3,377,874 B、抖音 3,490,075 B（≤4 MiB） |
| 发布审计 | `check:release` PASS；8 项阻断测试先 RED 后 GREEN |
| clean-room | 禁用词 clean、无第三方框架/角色引用、立绘本地原创 |
| **独立复核** | **子代理外部审计 8 项全 PASS，VERDICT: no critical/important** |

### 实现要点与决策

1. 新增 `tools/check_release_acceptance.py` + 8 项先 RED 的阻断测试：缺 runtime 文档、
   缺截图元数据、缺截图文件、reachability 不全、主包超 4 MiB、禁用词命中、旧新双挂载都会阻断。
   接入 `pnpm check:release`。
2. 固定种子旅程脚本产出 `u11-acceptance.json`，每张截图带 platform/orientation/分辨率/DPR/时间戳，
   满足 9.3 第 5 项"截图元数据齐全、无替身证据"。
3. **旧 Boot 退役决策：保留为受控回退窗口，不在验收阶段删除。** 依据：AppShell 未挂 boot.scene；
   旧 Boot 仍驱动真实战斗数值与存档；presentation 侧用真实形状投影验证了渲染与契约但未接管真实回合驱动。
   路线图禁止顺手删未验证边界，故另立后续阶段（建议 U12 接线、U13 删除）。
4. 独立审计由子代理完成，亲自运行测试、检查坏夹具真实性、确认 core 不 import cc、
   核对证据与代码一致，未发现造假/空壳测试/层边界破坏。

## UI 产品化完成定义

V0 + U1–U11 已按序全部通过各自退出门。25 个产品面全部迁移到 presentation 层，
250 组合矩阵零缺口，两平台主包 ≤4 MiB，可访问性与预算审计有故意坏夹具守卫，
发布审计通过并经独立复核。**UI 产品化路线图完成。**
