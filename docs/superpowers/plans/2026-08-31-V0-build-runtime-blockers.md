# V0 双平台构建与运行阻塞修复（2026-08-31）

U0 基线（`docs/ui/baselines/2026-08-31.md`）用真实 Creator 3.8.2 构建和真实平台开发者工具暴露了 5 个阻塞。V0 只修这些阻塞，不做 U1，不改玩法规则、不改现有立绘美术、不动 UI 产品化设计。

真源：`docs/ui/baselines/2026-08-31.md` 第 4、5 节的实测数据与错误文本。

## 阻塞清单与验收

| 编号 | 阻塞 | 现状证据 | V0 验收 |
|---|---|---|---|
| V0-1 | 微信项目配置被工具拒绝 | `project.config.json: libVersion field needs to be string, string`；来源是 `build-templates/wechatgame/project.config.json` 的 `"libVersion": "game"` | 模板改为官方允许值；`validate:game` 与 `check:cocos-build` 都能拒绝非法值 |
| V0-2 | 分包声明与产物不一致 | 两平台 `game.json` 声明 `bundle-battle`、`bundle-realm-wilds`、`bundle-realm-woods`，Creator 一个都没产出；工具在运行前报 `should be an existing directory` | 构建产物中声明与目录一一对应；`check:cocos-build` 能拒绝“声明了但不存在”的分包 |
| V0-3 | 立绘入主包、主包超限 | 微信主包 21,382,164 B；抖音 22,540,953 B；`assets/resources/config.json` 仍映射 `remote/spirits/...` | 主包 ≤ 4 MiB，立绘不在主包；运行时仍能正确显示立绘 |
| V0-4 | 抖音白屏 + 运行时异常 | 模拟器白屏；`unknown spirit: [object Set]` 出现 2 次；`getSpirit` 在 `packages/core/src/tables/load-tables.ts:28` 抛出 | 定位真实调用栈并修复类型误用；模拟器能渲染出画面 |
| V0-5 | 双平台证据不完整 | 三个页面都没有可用截图；无 Draw Call/FPS/内存 | 重新构建后复采标题/初始选择/战斗截图与可得性能数据，更新基线 |

## 执行顺序与理由

V0-1 → V0-2 → V0-3 → V0-4 → V0-5。

前三项是构建侧，改完才能得到能被两个工具接受的产物。V0-4 需要真实调用栈：微信工具的 `wechatide` 提供 `get_simulator_console` 与 `automation_evaluate`，但只有在 V0-1/V0-2 打通后运行时才会建立，所以把它排在构建修复之后而不是先猜代码。V0-5 依赖前四项。

## 方法约束

- 每项先写失败测试或失败校验（RED），再改实现（GREEN）。
- `packages/core` 改动后必须 `pnpm sync:core`。
- 不修改 `.u0-build/` 历史证据；新构建输出到新目录并重新计算 SHA-256。
- 不为了让门禁变绿而放宽门禁本身；放宽任何阈值都必须单独说明理由。
- 全量验证：`pnpm test`、`pnpm test:py`、`pnpm check:forbidden`、`pnpm check:pack`、`pnpm validate:game`、`pnpm check:ui-productization`。

## 已知风险

- V0-3 会改变资源加载路径，可能影响 `assets/scripts/ui/portrait.ts` 与 `packages/core/src/assets/manifest.ts` 的契约；必须先用测试固定新契约。
- Asset Bundle 的分包配置写在 `.meta` 的 `userData` 里，属于 Creator 工程配置，不是玩法代码；改动需在计划内明确列出。
- V0-4 若根因在存档迁移，需要同时保证旧存档不被破坏。
