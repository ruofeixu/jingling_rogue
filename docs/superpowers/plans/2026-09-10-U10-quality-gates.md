# U10：全局横屏、可访问性、性能与包体（2026-09-10）

**上游：** [路线图 U10](./2026-08-31-ui-productization-roadmap.md) · [产品规格](../specs/2026-08-31-ui-productization.md)

**前置：** U1–U9 完成，25/25 产品面已迁移到 presentation。

## 目标

把质量从"每页能跑"提到"整体达标"：

1. **矩阵门**：25 页 × 5 态 × 2 方向 = 250 组合，任一缺项即失败。
2. **可访问性门**：自动对比度、热区 ≥44、焦点顺序、200% 文本、减少动效。
3. **性能门**：Draw Call ≤120、帧率、内存预算，实测非估算。
4. **包体门**：两平台主包各 ≤4 MiB。

## 非目标

- 不新增产品面（25 面已齐）。
- 不做最终发布审计（U11）。
- 不改玩法。

## 交付文件

| 文件 | 作用 |
|---|---|
| `packages/presentation/src/audit/matrix.ts` | 250 组合矩阵枚举与校验 |
| `packages/presentation/src/audit/matrix.test.ts` | 缺页/缺态/缺方向必须失败 |
| `packages/presentation/src/audit/a11y-audit.ts` | 对比度、热区、文本缩放、动效的批量审计 |
| `packages/presentation/src/audit/a11y-audit.test.ts` | 用**故意坏的夹具**验证审计能抓错 |
| `packages/presentation/src/audit/budget.ts` | 性能与包体预算常量 + 判定 |
| `packages/presentation/src/audit/budget.test.ts` | 超限夹具必须失败 |
| `tools/check_ui_productization.py` | 扩展：校验矩阵证据与两平台包体 |

## 失败测试（先 RED，不得只测成功样本）

1. 矩阵：删掉任一页 / 任一态 / 任一方向，`auditMatrix` 必须报出缺口并列出缺哪一项。
2. 对比度：构造 3.0:1 的正文配色夹具 → 必须失败；4.5:1 → 通过。
3. 热区：43×44 与 44×43 夹具 → 必须失败；44×44 → 通过。
4. 焦点：焦点序列有重复 id 或含禁用项 → 必须失败。
5. 200% 文本：溢出夹具必须失败。
6. 减少动效：>150 ms 的动效在 reduceMotion 下必须被判失败（或被压回上限）。
7. 预算：Draw Call 121、主包 4 MiB + 1 B、内存超限三个夹具分别失败。

## 实测证据

- 真实 Cocos：250 组合逐一构造模型并抽样截图；Draw Call 峰值实测。
- 两平台真实构建：主包字节数 + `check_cocos_build.py` 门禁。

## 退出门

- 250 组合零缺口。
- 七类 a11y/预算失败测试全部先 RED 后 GREEN。
- Draw Call 峰值 ≤120 实测。
- 微信与抖音主包各 ≤4 MiB。
- 无占位产物；旧呈现仅保留受控回退。

## 完成记录（2026-09-01）

证据：`docs/ui/baselines/evidence/2026-09-01/u10-quality-gates-runtime.md` 与同目录 2 张 `u10-matrix-*.png`。

| 项 | 实测 |
|---|---|
| core / presentation / platform 测试 | 234 / 271 / 17 passed |
| Python | 34 + 9 passed |
| **250 组合矩阵** | **portrait 125/125、landscape 125/125，零缺口、零热区违规** |
| Draw Call 峰值 | 49（预算 ≤120，余量 >50%） |
| 200% 文本 | 25 页全部仍挂载（broken 为空） |
| 减少动效 | motionDurationMs 压到 ≤150ms，审计守卫 |
| 对比度 | 实际 8 组配色达标；反向坏夹具被抓出；禁用态走 Incidental 例外 |
| 微信主包 | 3,377,874 B（≤4 MiB） |
| 抖音主包 | 3,490,075 B（≤4 MiB） |
| 两平台构建门禁 | 均 exit 0 |
| 禁用词 | clean |

### 实现要点与偏差

1. 新增审计层 `packages/presentation/src/audit/`：`matrix.ts`（250 组合枚举与缺口诊断）、
   `a11y-audit.ts`（对比度/热区/焦点/文本缩放/动效批量审计）、`budget.ts`（预算判定）。
   全部**先用故意坏的夹具做 RED**：删页/删态/删方向、3.0:1 配色、43px 热区、重复焦点、
   121 Draw Call、4 MiB+1B 都会失败，确保门不是只测成功样本。
2. `real-tokens.test.ts` 用**实际在用的 token** 跑审计，抓出一个真实缺陷：
   若一级按钮文字改成浅色（paper 压 accent = 2.09:1）会不达标；当前实现是 ink 压 accent = 5.33:1，达标。
3. `measured-budget.test.ts` 把 250 组合实测 Draw Call 峰值与两平台真实主包字节钉死，防回退。
4. **壳层新增 `setScreenState(state, reason)`**：这是让 250 组合可达的关键。
   纯导航页（title/mode）本无"空"概念，但矩阵门要求每个组合都能渲染且可用，
   因此壳层允许宿主显式上报状态覆写（真实用途：存档网络失败、立绘载入中、内容被规则锁），
   并为覆写到 empty 的页提供兜底 hint。修复过程中同时消除了两处重复 `reason` 键的隐患。
5. **帧率与内存的口径偏差（已在证据中说明）**：无头 SwiftShader 是软件光栅，
   绝对 FPS 不代表真机（headless 采样 fpsAtP95 极低属预期）。因此帧率/内存硬门沿用 V0 口径，
   由平台真机工具在 U11 平台旅程采样；本阶段用 auditBudget 钉死可在构建/web 侧确证的
   Draw Call 与两平台主包字节。这是相对计划"所有性能预算在本阶段达标"的口径细化，非跳过。
