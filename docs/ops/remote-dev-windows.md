# 远程开发：Windows 主节点（desktop-9p7mff1）

2026-11-14 定下的分工。目的是「人不在电脑前，用手机指挥开发」。

## 两台机器

| 机器 | Tailscale 名 | 角色 |
|---|---|---|
| Windows 11（i7-1165G7 / RTX 2060 / D 盘 1.1TB） | `desktop-9p7mff1` | **主工作副本 + Cocos 编辑器 + 双平台构建 + 真机预览** |
| Ubuntu（MacBook Pro 2015） | `xuruofei-macbookpro` | 可选副节点，只跑纯 CPU 任务（`pnpm test` / `pnpm shot`） |

选 Windows 当主节点是因为 Cocos Creator 3.8.2、微信开发者工具、抖音开发者工具**都只有 Windows/macOS 版**，Ubuntu 上开不了 7456 预览、也出不了真机预览包。代码只在一台改，靠 GitHub 同步（`git@github.com:ruofeixu/jingling_rogue.git`），两边都编译产物必然漂移。

## Windows 上的现状（已配好）

- 仓库：`D:\projects\jingling_rogue`（C 盘留给系统，`library/temp/build` 很吃盘）
- `pnpm` 9.15.0（corepack）、node 24.14、uv 0.10、git 2.41、claude CLI、Docker、Chrome
- `.env` 已从 Mac 拷过来（Azure key，永不入库）
- SSH：`ssh nuc@desktop-9p7mff1`（公钥在 `C:\ProgramData\ssh\administrators_authorized_keys`，该机 sshd 只认这个路径）
- 电源：AC 下不睡眠、不关盘；合盖不动作（`powercfg /change standby-timeout-ac 0`）
- npm：`~/.npmrc` 里的 `proxy=127.0.0.1:10809` 已注释掉（那个代理平时不开，pnpm 会直接 ECONNREFUSED），备份在 `~/.npmrc.bak-20261114`

## 基线（2026-11-14，两台一致）

```
pnpm test           core 284 / presentation 758 / platform 17 全绿，vendor 无漂移
pnpm check:forbidden  forbidden-term scan: clean
pnpm shot            48 张图到 .shots/
pnpm pack:minigame   build/wechatgame、build/bytedance-mini-game
```

## 跨平台三个坑（已修）

1. `tools/check_vendor_drift.py` 里直接 `subprocess.run(["pnpm", ...])`，Windows 上 pnpm 是 `.cmd` 别名 → `FileNotFoundError`。改成 `shutil.which("pnpm")`。
2. 仓库没有 `.gitattributes`，Windows 的 `core.autocrlf=true` 把检出的 `assets/scripts/vendor/*.ts` 变成 CRLF，而校验是逐字节比对 → 假漂移。已加 `* text=auto eol=lf`，Windows 侧同时 `git config core.autocrlf false`。
3. `packages/platform/src/scene-png.ts` 的中文字体候选只有 macOS/Linux 路径，Windows 上退到 `sans-serif` 画不出汉字（截图和 `scene-png` 测试都受影响）。已加 `msyh.ttc` / `simhei.ttf` / `simsun.ttc`。

## 手机指挥的三条链路

1. **改代码 / 跑测试**：手机 SSH 进 Windows 开 `claude`（已装）；仓库是 public，`git clone` 不需要凭据，push 才需要（`gh auth login` 或 PAT）
2. **看画面**：`pnpm shot` → `.shots/*.png`，可直接 scp 回来看
3. **玩真的**：iPad/iPhone 用 Microsoft Remote Desktop 连 3389 开 Cocos 预览；或 `tailscale serve 7456` 后用手机浏览器直接玩

## 还没做的（需要人来操作）

- [ ] Cocos Dashboard + **Creator 3.8.2**（要 Cocos 账号登录）+ `extensions/funplay-cocos-mcp`
- [ ] 微信开发者工具、抖音开发者工具
- [ ] `gh auth login` 或 PAT（Windows 上才能 push）
- [ ] 关掉 SSH 密码登录（`PasswordAuthentication no`），只留公钥
- [ ] 确认 RTX 2060 驱动下的编辑器/预览帧率，再决定 B5/B6 的观感验收是否在这台跑