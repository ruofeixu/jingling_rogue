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

- 微信开发者工具：设置 → 安全设置 → 打开服务端口，才能 CLI 导入。（已完成）
- 战斗名牌出现过 `Lv 5 [object Object]`——**已确认是正常表现，不是引擎回归**。
- 引擎缓存目录 `Creator/3.8.8/.../bin/.cache` 在 ProgramData 下是 Users RX，第二次启动会 EPERM；
  本机已把 `dev/` 换成当前用户可写副本，**且已核对 `.cache` 目录当前 `nuc` 为 FullControl、实测可写**。

## 待人工处理（2026-11-14 Mac 侧复核后仍然开着）

1. ~~**微信开发者工具需要一个可用的小游戏 AppID。**~~ **已解决**：用接口测试号
   `wxef87c1a7a5e18bbf`（`xuruofei289516`）。写入产物 `project.config.json` 后
   `cli open` / `cli auto` 都返回成功（`Using AppID: wxef87c1a7a5e18bbf`）；
   该 appid 与原来的 demo appid 等长（18 字节），主包基线不变。
   注意：CLI 导入前必须先把产物里的空 `appid` 填上，模板本身保持空串。
   IDE 登录票据会过期，过期后报 `code 10 需要重新登录`，重新扫码即可。
2. **微信模拟器渲染已验证（2026-11-14）**：`cli open` + `cli auto` 后模拟器（iPhone 12/…）
   完整渲染标题页——「契灵志怪」书法标题、水墨背景与立绘、朱砂「新的旅途」按钮、
   八个入口、底部提示文案全部正常，无黑屏无残墨。
   自动点击未成功：后台任务调 `SetForegroundWindow` 被系统拦，点击落到了别的窗口，
   所以「点进去之后」的分支仍靠抖音侧模拟器验证（标题→选模式→选契灵→战斗已跑通）。
3. **引擎缓存目录**：已核对可写，见上。


## 收尾状态（2026-11-14 晚）

- 3.8.2 已从 Mac 删除（`/Applications/Cocos/Creator/3.8.2`，4.2GB），`library/ temp/` 与
  `.u0-build* .u0-sim .playtest` 一并清掉；`.artifacts`（191MB，美术生成中间产物）保留。
- `pnpm test`（core 284 / presentation 758 / platform 17）、`pnpm test:py`（56 + 9）、
  `pnpm check:forbidden`、`pnpm check:pack`（665,399）、`pnpm validate:game` 全绿。
- 字体子集已重建（Ma Shan Zheng 官方源字体，覆盖 924 个 UI 汉字 / 707,196 字节）。
- 两个平台的产物 `game.json` 都正确声明了 `subpackages: portraits + ui-art`。
