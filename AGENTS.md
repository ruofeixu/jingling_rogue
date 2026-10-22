# Agent 须知

1. 先读 `docs/legal/clean-room.md`、`docs/ip/spirit-bible.md`、`docs/superpowers/specs/2026-08-17-full-feature-parity.md`（第 16 节是**系统**清单，已勾完）
2. 新工作按 `docs/superpowers/plans/2026-08-21-cartoon-roadmap.md` 的 A0→A2，一次只做一个阶段；开工前先写该阶段细计划。卡通验收真源：`docs/superpowers/specs/2026-08-21-cartoon-design.md`。已完成的手感 S 轮：`docs/superpowers/specs/2026-08-21-feel-design.md`；R 轮：`docs/superpowers/specs/2026-08-20-optimize-design.md`；Q 门：`docs/superpowers/specs/2026-08-20-quality-bar.md`；难度数字：`docs/superpowers/specs/2026-08-19-playability-bar.md`
3. 改代码后跑 `pnpm test`、`pnpm check:forbidden`；改了 core 再 `pnpm sync:core`
4. 禁止 Phaser、禁止上游源码、禁止官方名；核心不得 `import "cc"`
