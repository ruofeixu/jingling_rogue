# 3.8.8 升级决策（2026-11-14）

**可以升。** 阻塞项 T1 已过：主包回到 4MiB 以内。实验只在 `D:\projects\jingling_rogue-388`，没有改 `jingling_rogue`。

## 数字

| 平台 | 主包 | 门禁 4,194,304 |
|---|---|---|
| 微信 `build-rel/wechatgame` | 3,200,506 | 过 |
| 抖音 `build-rel/bytedance-mini-game` | 3,186,315 | 过 |

`cocos-js` 1.52MB（修前 3.72MB，3.8.2 对照 1.75MB）。基线 `docs/ui/baselines/3.8.8-build.json`。

## 仓库改动要点

- `settings/v2/packages/engine.json`：写成 1.0.12 的 `configs.defaultConfig` schema，恢复模块裁剪。
- `build-templates/bytedance-mini-game/game.ejs`：补 3.8.8 的 `project:` SystemJS handler。
- `package.json` 的 `creator.version` 已是 `3.8.8`。

## 人还要看的

- 微信开发者工具：设置 → 安全设置 → 打开服务端口，才能 CLI 导入。
- 战斗名牌出现过 `Lv 5 [object Object]`，不一定是引擎回归，合并前值得再看一眼。
- 引擎缓存目录 `Creator/3.8.8/.../bin/.cache` 在 ProgramData 下是 Users RX，第二次启动会 EPERM；本机已把 `dev/` 换成当前用户可写副本。

## 待人工处理（2026-11-14 Mac 侧复核后仍然开着）

1. **微信开发者工具需要一个可用的小游戏 AppID。**
   `pnpm` 侧构建没问题，但 `cli open --project build-rel/wechatgame` 报
   `code 10 不存在此 AppID`：模板里的 `appid` 是空串，临时试过 `touristappid` 和
   官方 demo `wx6ac3f5090a6b99c5`，都被服务端拒。需要在 IDE 里给项目换一个本账号下的小游戏 AppID
   （或走 IDE 的「测试号」流程），之后 CLI 才能打开模拟器。
   注意：改完 AppID 会改变 `project.config.json` 字节数，主包基线要重新 `--json-out` 记一次。
2. **战斗名牌 `Lv 5 [object Object]`** 是否引擎回归，合并定案前还没确认。
3. **引擎缓存目录 `Creator/3.8.8/.../bin/.cache` 在 ProgramData 下只有 Users RX**，
   第二次启动会 EPERM；本机是把 `dev/` 换成当前用户可写副本绕过的，未修根因。
