# Cocos Creator 3.8.8：升级记录与现状

2026-11-14 从 3.8.2 升到 **3.8.8**，已合入 `main`。本文是这个决定的唯一存档：
为什么升、改了什么、踩过哪些坑、验收做到哪一步。旧的 probe / decision / tasks 三份已合并进这里。

## 1. 现状（先看这段）

- 全仓锁 **3.8.8**：`package.json` 与 `game/package.json` 的 `creator.version`。
- **不要用 3.8.2 打开本仓库。** `settings/v2/packages/engine.json` 是 1.0.12 的
  `modules.configs.defaultConfig` schema，老编辑器读不懂，会把模块裁剪写坏
  （实测能把主包从 3.2MB 推到 5.6MB、击穿 4MiB 预算），并把 `.meta` 降级写回。
  Dashboard 打开工程时确认引擎版本是 3.8.8。
- Mac 上已删除 3.8.2（4.2GB）及其 `library/ temp/`、`.u0-build*`、`.u0-sim`、`.playtest` 缓存。
- `docs/ui/baselines/2026-08-31*`、`docs/superpowers/plans/*` 里的 3.8.2 是当时的验收记录，
  属于历史事实，不要据此选引擎版本。

### 数字

| 项 | 3.8.2 | 3.8.8 全模块（修前） | 3.8.8 裁剪后（现状） |
|---|---|---|---|
| 微信主包 | 3,387,679 | 5,853,482 | **3,206,430** |
| 抖音主包 | — | — | **3,192,240** |
| `cocos-js` | 1,745,300 | 3,716,180 | **1,521,544** |
| 门禁 `main ≤ 4,194,304` | 过 | **超** | 过 |

分包：`portraits` 13,137,948 + `ui-art` 5,832,523，均在单包 20MiB / 合计 40MiB 上限内。
基线文件 `docs/ui/baselines/3.8.8-build.json`（微信 + 抖音双平台）。

2026-11-22 用当前代码重建过一次（B3 的命令接线、设置页、图鉴、卵机、墨洗都合进去了）：
主包比 11-14 那次各涨约 6KB（微信 +5,924、抖音 +5,925），全部来自新增界面文案与分支，
引擎 `cocos-js` 没变；离 4MiB 还有约 980KB 余量。

## 2. 为什么升

内测阶段本来锁 3.8.2 也能跑，真正的推力只有三条：

1. **新版微信开发者工具的兼容**：3.8.7 修了 `readFile:fail` 并更新了微信模板的 `libVersion`；
   老模板在新 IDE 上会报错。
2. **2D 渲染排序 + 批处理修复**（3.8.7）：本项目 UI 是运行时用 `Graphics`/`Label` 拼出来的，
   弹层与洗墨转场靠兄弟顺序，每次切页大批显隐。
3. **包体**：3.8.6 对微信 2D 工程做了大量 code-size 优化，3.8.8 的引擎比 3.8.2 还小 13%。

选 3.8.8 而不是中间版本，是因为 3.8.8 是 3.8 线**最后一版**（2025-12 之后近一年没有 3.8.9/3.9.x），
累积了 3.8.3–3.8.7 全部修复，而它自己新增的只有 HarmonyOS / Android 那些我们用不上的东西。

对我们没价值的：Spine、Box2D、Builtin 3D 管线、WebGPU、淘宝/支付宝/咪咕/Google Play。

## 3. 升级改了什么

`4695f20`（升级前）→ 现在，共 **100 个文件**，其中 76 个是纯版本号：

| 类别 | 文件数 | 内容 |
|---|---|---|
| `assets/**/*.meta` | 76 | 只有 `ver`：`1.0.26` → `1.0.27`（image importer bump） |
| `settings/v2/packages/` | 3 | `builder` 1.3.9、`engine` 1.0.12 新 schema、`cocos-service` 3.0.9 |
| `profiles/v2/packages/` | 9 | builder 1.3.9 / engine 1.0.12 / scene 1.0.3，外加 5 个新平台 profile |
| `package.json` ×2 | 2 | `creator.version` 和 `version` 都是 3.8.8 |
| `build-templates/bytedance-mini-game/game.ejs` | 1 | 补 `project:` SystemJS handler |
| 其余 | 9 | 文档、基线、字体子集、两处注释 |

**没变的**：`assets/boot.scene`、`assets/ui-art/effects/*.effect`、`build-templates/wechatgame/`。
小工程红利：95 个 meta、1 个 scene、0 个 prefab、0 个材质。

## 4. 核心坑：引擎模块裁剪被静默关掉

这是整个升级里唯一真正的坑，也是主包一度涨到 5.58MB 的原因。

原 `engine.json` 只勾了 12 个模块，但 3.8.8 构建时 **40+ 个 `cc-fu/*` 全被加载**：产物里
出现了 `TiledMap` / `VideoPlayer` / `Terrain` / `ammo` / `dragonBones` / `spine` / `physics-*`。
对应日志里唯一的失败：

```
error: Cannot read properties of undefined (reading 'graphcis')
  TypeError: ... at Object.migrateProject (...engine/dist/migrations/1.0.10.ccc:1:381)
error: [Package] Profile migrateProject: engine(1.0.10) failed!
```

`graphcis` 是 Cocos 自己代码里的拼写错误。这条迁移本该把老的 `includeModules` 数组转成
1.0.12 的 `modules.configs.defaultConfig` schema；抛错后配置没转成功，构建回落到「全模块」默认值。
而 `__version__` 仍被推进到 `1.0.12` —— **版本号正常、配置实际是坏的**，只能靠量包体发现。

### 解法

手工写成 1.0.12 的 `configs.defaultConfig` schema（参考 `empty-2d` 模板与
cocos-test-projects v3.8.8 的 1.0.12 字段），`includeModules` 保持原 12 项，
并补上 3.8.8 拆出去的 `graphics` 与 `3d` 依赖的 `meshopt`；`__version__` 维持 `1.0.12`，
避免再跑那条坏掉的迁移。

现在的启用项：

```
base gfx-webgl gfx-webgl2 3d primitive 2d ui tween animation
intersection-2d audio graphics meshopt render-pipeline legacy-pipeline
```

### 怎么验证裁剪真的生效

**不要**用 `Select-String -Pattern Terrain` 这类不区分大小写的匹配（会误报）。
对 `build-rel/wechatgame/cocos-js/cc.js` 做精确符号计数，正确的结果与 3.8.2 一致：

```
Terrain 0   TiledMap 0   VideoPlayer 0   AmmoPhysics 0   SkeletonData 0   dragonBones 1
```

辅以字节数：`cocos-js` 应在 1.5MB 量级（全模块时是 3.7MB）。
最权威的还是跑门禁：

```powershell
uv run --project tools python tools/check_cocos_build.py --wechat build-rel\wechatgame --bytedance build-rel\bytedance-mini-game --json-out docs\ui\baselines\3.8.8-build.json
```

建产物用 `build-configs/*.json`（`--build "configPath=..."`），不要手拼参数：
`buildPath`、`appid`、`orientation` 都在配置里，构建结果才可重现。以前 appid 只能构建后
手改产物 `project.config.json`，每次重建都得重改一遍（`--build "...;appid=..."` 这种顶层
参数**不生效**，它对 `packages.wechatgame.appid` 无能为力）。

## 5. 抖音模板的 `project:` handler

3.8.8 的官方抖音模板用 SystemJS 的 `project:` 协议加载 `src/chunks/*.js`，我们 3.8.2 时代的
`build-templates/bytedance-mini-game/game.ejs` 没有这个 handler，模拟器会报
`Unable to instantiate project://src/chunks/bundle.js from undefined`。已补上，并给
`plugin:` 加了 `require` 兜底。微信模板本来就有 `project:`，不用改。

## 6. 在 Windows 上远程跑 Cocos（踩过的坑）

**SSH 会话结束会杀掉整个进程树**，`Start-Process` 起的编辑器会跟着死。必须用 WMI 起脱离会话的进程：

```powershell
# 命令写进 .bat（引号和 > 重定向直接塞 CommandLine 会报 filename syntax 错误）
Set-Content D:\projects\cc-build.bat -Encoding ascii -Value @"
@echo off
"C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe" --project D:\projects\jingling_rogue --build "configPath=D:\projects\jingling_rogue\build-configs\wechatgame.json" > D:\projects\cc-build.log 2>&1
echo EXITCODE=%ERRORLEVEL% >> D:\projects\cc-build.log
"@

Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = "cmd.exe /c D:\projects\cc-build.bat" }
```

抖音把 `wechatgame.json` 换成 `bytedance-mini-game.json`。建完还要两步才算可上传：

```powershell
pnpm pack:subpackages build-rel\wechatgame            # assets/portraits、ui-art 转真分包
pnpm pack:subpackages build-rel\bytedance-mini-game
pnpm check:cocos-build --wechat build-rel\wechatgame --bytedance build-rel\bytedance-mini-game
```

其他实测结论：

- 构建：首次含资源导入 ~115s，之后 ~79s，内存峰值 ~240MB
- **不需要登录 Cocos 账号也能构建**，日志里只有 `OTA_LOGIN_REQUIRED`（OTA 检查失败，不影响产物）
- **SSH 会话里 GPU 进程起不来**（`exit_code=34`）。构建走 CPU 没关系，**预览/看画面必须 RDP（3389）**
- CLI 退出码不可靠（3.8.2 时代成功也返回 36），以日志里的 `build Task (...) Finished` 和产物为准
- PowerShell 5.1 不认 `&&`；中文输出乱码加 `chcp 65001`
- 想截交互会话的屏 / 在桌面会话里做事：用 `Register-ScheduledTask -Principal (New-ScheduledTaskPrincipal -UserId "$env:COMPUTERNAME\nuc" -LogonType Interactive)`
  再 `Start-ScheduledTask`，任务会跑在用户会话里（SSH 是 session 0，抓不到桌面）

## 7. 开发者工具

### 微信

- 小游戏 AppID 用接口测试号 **`wxef87c1a7a5e18bbf`**（`xuruofei289516`），已写进
  `build-configs/wechatgame.json` 的 `packages.wechatgame.appid`，构建产物直接带对；
  以前产物默认是 Creator 模板里的 `wx6ac3f5090a6b99c5`，开发者工具报
  `code 10 不存在此 AppID`，只能手动改产物。仍然**没有正式号**，换成正式号时改这一处即可
- CLI 服务端口需在 IDE「设置 → 安全设置」里打开；**登录票据会过期**，过期后报
  `code 10 需要重新登录`，重新扫码即可（`cli login -f image -o out.png` 可出图给对方扫）
- 流程：`cli open --project <build>` → `cli auto --project <build> --auto-port 9420`
- `miniprogram-automator` 对小游戏无效（`screenshot` / `evaluate` 全部超时），别在这上面耗时间

### 抖音

已装并登录；用 Test AppID 导入 Microgame。模拟器跑通过标题 → 选模式 → 选契灵 → 战斗。

## 8. 验收状态

已确认：

- 微信模拟器（iPhone 12）**完整渲染标题页**：书法标题「契灵志怪」、水墨背景与彩绘立绘、
  朱砂「新的旅途」按钮、八个入口、底部提示文案，无黑屏无残墨
- 抖音模拟器跑通标题 → 选模式 → 选契灵 → **战斗**（敌方 HP 36→25，能打）
- 两个平台产物 `game.json` 都正确声明 `subpackages: portraits + ui-art`
- `pnpm test`（core 284 / presentation 758 / platform 17）、`pnpm test:py`（56 + 9）、
  `pnpm check:forbidden`、`pnpm check:pack`（665,399）、`pnpm validate:game` 全绿

没做 / 没验证：

- 微信模拟器里**点进「新的旅途」之后的分支**（自动点击被 Windows 的
  `SetForegroundWindow` 限制挡住，点击落到了别的窗口）；这条分支靠抖音侧覆盖
- 真机扫码预览
- 受击溅墨动画太短没截到帧
- 战斗名牌 `Lv 5 [object Object]` 已确认为正常表现，不是引擎回归

⚠️ **观感验收要看真实构建，不能拿 `pnpm shot` 当依据**：`shot` 是无头 canvas 只画布局与占位，
真实构建里才有立绘和水墨背景。

## 9. 遗留

- 关掉 SSH 密码登录（`PasswordAuthentication no`），现在还是内网自用 + 密码可登
- RTX 2060 下编辑器/预览的帧率还没实测，B5/B6 观感验收是否都在这台跑还没定
- 引擎缓存目录 `Creator/3.8.8/.../engine/bin/.cache` 曾因 ProgramData 权限报 EPERM，
  现已核对 `nuc` 为 FullControl 且实测可写
