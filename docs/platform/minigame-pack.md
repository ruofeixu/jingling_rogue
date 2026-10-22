# 微信 / 抖音包

竖屏 750×1334。立绘不进主包，走 CDN。主包预算 4MB。商店上架不在本阶段。

## 预览包（开发者工具）

```bash
pnpm pack:minigame
```

写出 `build/wechatgame` 与 `build/bytedance-mini-game`（竖屏、三分包、`game.js` 入口画大厅「契灵志怪 / 新的旅途」，无立绘 PNG）。

1. 微信开发者工具：导入 `build/wechatgame`（小游戏 / `compileType: game`）。
2. 抖音开发者工具：导入 `build/bytedance-mini-game`。

开发者工具里应能看到大厅标题与「新的旅途」。完整引擎包仍用 Cocos Creator 3.8.2「构建发布」，模板在 `build-templates/`。

## 完整构建

1. Cocos Creator 3.8.2 打开仓库根目录（不是只开 `game/`）。
2. 构建发布：微信小游戏、抖音小游戏，参考 `game/templates/wx/game.json` 与 `game/templates/bytedance/game.json` 的分包名。
3. 真机在对应开发者工具里预览。

## 合法域名

把 `game/templates/legal-domains.json` 填进后台：

- request：存档 API、CDN（`https://save.example.com`、`https://cdn.example.com`）
- downloadFile：CDN 立绘

开发占位如上。正式环境替换为自有域名后再提审。

云存档客户端 origin 必须与 request 域名一致：`SAVE_ORIGIN`。

## 主包

```bash
pnpm check:pack
```

立绘 PNG 只放远程清单 `game/remote/`，运行时 `remoteManifest(baseUrl)`。
