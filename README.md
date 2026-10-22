# 精怪肉鸽（Jingling Rogue）

微信 / 抖音小游戏。玩法结构对标肉鸽回合制收集，代码与 IP 全部原创。

## 必读

- [docs/legal/clean-room.md](docs/legal/clean-room.md)
- [docs/legal/forbidden-terms.md](docs/legal/forbidden-terms.md)
- [docs/ip/spirit-bible.md](docs/ip/spirit-bible.md)
- [全功能对标规格](docs/superpowers/specs/2026-08-17-full-feature-parity.md)
- [F1–F12 实施路线图](docs/superpowers/plans/2026-08-17-full-parity-roadmap.md)

Cocos Creator 3.8.2 打开的是**仓库根目录**（不是 `game/`）。预览：`http://localhost:7456/`。改 `packages/core` 后执行 `pnpm sync:core`。

## 开发

```bash
pnpm install
pnpm test
uv run --project tools --extra dev pytest
uv run --project server --extra dev pytest
uv run --project tools python tools/check_forbidden.py
node game/scripts/validate-templates.mjs
```

核心战斗在 `packages/core`，不依赖 Cocos。客户端在 `game/`。存档服务在 `server/`。
