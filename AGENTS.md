# Agent 须知

1. 先读 `docs/legal/clean-room.md`、`docs/ip/spirit-bible.md`、`docs/superpowers/specs/2026-08-17-full-feature-parity.md`（第 16 节是**系统**清单，已勾完）
2. 新工作按 `docs/superpowers/plans/2026-10-01-internal-beta-roadmap.md` 的 B0→B6，一次只做一个阶段；开工前先写该阶段细计划。B2 已定为 AppShell 入口（`LEGACY_BOOT = false`）。水墨风和 PvP 按 `docs/superpowers/plans/2026-10-29-pvp-ink-roadmap.md`：内测版用水墨风，I1 在 B3 之前做，I2/I3 并入 B5；PvP（P1–P7）在 B6 之后。观感验收真源：`docs/superpowers/specs/2026-10-29-ink-design.md`（卡通规格已被取代）。手感 S 轮：`docs/superpowers/specs/2026-08-21-feel-design.md`；R 轮：`docs/superpowers/specs/2026-08-20-optimize-design.md`；Q 门：`docs/superpowers/specs/2026-08-20-quality-bar.md`；难度数字：`docs/superpowers/specs/2026-08-19-playability-bar.md`
3. 改代码后跑 `pnpm test`、`pnpm check:forbidden`；改了 core 再 `pnpm sync:core`，改了 presentation 再 `pnpm sync:presentation`。`pnpm test` 含类型检查和 vendor 漂移检查
4. 引擎版本全仓锁 **Cocos Creator 3.8.8**（`package.json` / `game/package.json` 的 `creator.version`）。**不要用 3.8.2 打开本仓库**：`engine.json` 是 1.0.12 新 schema，老编辑器会把模块裁剪写坏（曾把主包从 3.2MB 推到 5.6MB、超过 4MiB 预算）。详见 `docs/ops/cocos-3.8.8.md`
5. 禁止 Phaser、禁止上游源码、禁止官方名；核心不得 `import "cc"`
