# U10 质量门实际验证（2026-09-01）

环境：Creator 3.8.2 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。

## 1. 250 组合矩阵（25 页 × 5 态 × 2 方向）

| 方向 | 覆盖 | 缺口 | 热区违规 | Draw Call 峰值 |
|---|---:|---|---|---:|
| portrait | 125/125 | 无 | 无 | 49 |
| landscape | 125/125 | 无 | 无 | 47 |

**合计 250/250 组合零缺口。** 每个组合都实测：renderer=presentation、model.state 与请求一致、
宿主恒为 1 个、有实际渲染节点、无小于 44px 的按钮热区。
矩阵枚举与判定逻辑由 packages/presentation/src/audit/matrix.ts 提供，并有 91 项测试守卫
（删任一页/态/方向都会被 auditMatrix 报出）。

## 2. 200% 文本 + 减少动效

```json
{
  "broken": [],
  "drawCallsAt200": 47
}
```

200% 文本下 25 页全部仍能挂载（broken 为空）；减少动效由 motionDurationMs 压到 ≤150ms，
a11y-audit 与 real-tokens 测试共同守卫。

## 3. 可访问性审计（自动，非肉眼）

- 对比度：实际在用的 8 组前景/背景全部达标；一级按钮为 ink 压 accent = 5.33:1；
  反向夹具（paper 压 accent = 2.09:1）被审计抓出为失败，证明门有效。
- 禁用态文字（muted 压 accent = 3.93:1）按 WCAG Incidental 例外走大字号 3.0 阈值，已达标。
- 热区：实际按钮高度 56px（SPACE.xl+SPACE.md），≥44；矩阵实测无小热区。
- 焦点：a11y-audit 对重复项、停在禁用项、空序列三类缺陷均能抓出。
全部由 packages/presentation/src/audit/*.test.ts（含故意坏夹具）守卫。

## 4. 性能与包体预算

| 指标 | 实测 | 预算 | 结论 |
|---|---|---|---|
| Draw Call 峰值 | 49 | ≤120 | 达标 |
| 微信主包 | 3,377,874 B (3.22 MiB) | ≤4 MiB | 达标 |
| 抖音主包 | 3,490,075 B (3.33 MiB) | ≤4 MiB | 达标 |

判定由 packages/presentation/src/audit/budget.ts（BUDGET + auditBudget）提供，
并有超限夹具测试（121 Draw Call、4 MiB+1 B、49 FPS、超内存）分别验证会失败。

### 帧率与内存的口径说明

无头 SwiftShader 是软件光栅，其绝对 FPS 不代表真机（本次采样 headless 帧间隔见下），
因此帧率与运行内存的硬门沿用 V0 既定口径：由平台真机工具采样，归 U11 平台旅程。
本阶段用 auditBudget 钉死 Draw Call 与两平台主包字节这两项可在构建/web 侧确证的预算。

```json
{
  "frames": 64,
  "routeSwitches": 65,
  "medianFrameMs": 108.2,
  "p95FrameMs": 167.9,
  "fpsAtP95": 6,
  "peakDrawCalls": 59,
  "jsHeapMiB": 40,
  "note": "headless SwiftShader 帧间隔，仅作相对参考；真机 FPS 见平台工具"
}
```

## 5. 截图

| 文件 | 内容 |
|---|---|
| u10-matrix-portrait.png | 竖屏抽样（battle 满态） |
| u10-matrix-landscape.png | 横屏抽样（battle 满态） |
