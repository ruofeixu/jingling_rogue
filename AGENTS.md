# Agent 须知

1. 先读 `docs/legal/clean-room.md`、`docs/ip/spirit-bible.md`、`docs/superpowers/specs/2026-08-17-full-feature-parity.md`（第 16 节是**系统**清单，已勾完）
2. 新工作按 `docs/superpowers/plans/2026-10-01-internal-beta-roadmap.md` 的 B0→B6，一次只做一个阶段；开工前先写该阶段细计划。B2 已定为 AppShell 入口（`LEGACY_BOOT = false`）。已完成的卡通验收真源：`docs/superpowers/specs/2026-08-21-cartoon-design.md`。手感 S 轮：`docs/superpowers/specs/2026-08-21-feel-design.md`；R 轮：`docs/superpowers/specs/2026-08-20-optimize-design.md`；Q 门：`docs/superpowers/specs/2026-08-20-quality-bar.md`；难度数字：`docs/superpowers/specs/2026-08-19-playability-bar.md`
3. 改代码后跑 `pnpm test`、`pnpm check:forbidden`；改了 core 再 `pnpm sync:core`，改了 presentation 再 `pnpm sync:presentation`。`pnpm test` 含类型检查和 vendor 漂移检查
4. 禁止 Phaser、禁止上游源码、禁止官方名；核心不得 `import "cc"`
