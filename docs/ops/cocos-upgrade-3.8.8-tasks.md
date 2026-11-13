# 3.8.8 升级：Windows 上的后续工作（交接给 Windows 侧 agent）

写于 2026-11-14。前置阅读：`docs/ops/cocos-upgrade-3.8.8-probe.md`（已实测的数据与根因）、
`AGENTS.md`、`docs/legal/clean-room.md`、`docs/superpowers/specs/2026-08-17-full-feature-parity.md`。

## 0. 一句话任务

**在 Windows 上把 3.8.8 的引擎模块裁剪修好，让它重新满足主包 ≤4MiB，然后再决定要不要升。**

在此之前不要动主工作副本，也不要把 3.8.8 的产物合并进主线。

## 1. 这台 Windows 上现在有什么

| 项 | 路径 / 状态 |
|---|---|
| 主工作副本 | `D:\projects\jingling_rogue`（`main`，与 origin 同步） |
| **探针克隆（已用 3.8.8 升过级）** | `D:\projects\jingling_rogue-388` |
| Cocos Creator 3.8.8 | `C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe` |
| Cocos Dashboard | `C:\Program Files (x86)\CocosDashboard\CocosDashboard.exe` |
| 微信开发者工具 | `C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat` |
| 抖音开发者工具 | **未安装** |
| funplay MCP 扩展 | `D:\projects\jingling_rogue\extensions\funplay-cocos-mcp`（115 文件，gitignore 内） |
| Cocos 账号 | **未登录**（构建不需要，GUI/OTA 需要） |
| 探针产物 | `D:\projects\jingling_rogue-388\build-rel\wechatgame`（3.8.8 debug=false 已打包） |
| 探针日志 | `D:\projects\cc388-rel.log`、`D:\projects\jingling_rogue-388\temp\logs\project.log` |

已经配好、不用重复做：pnpm 9.15.0（corepack）、node 24.14、uv、`.env`、git user/email、
`core.autocrlf=false`、`~/.npmrc` 里指向死代理的行已注释、AC 下不睡眠不合盖。

## 2. 环境坑（先看，省一小时）

### 2.1 SSH 会杀掉子进程树 —— 必须用 WMI 脱离会话

`Start-Process` 起的编辑器在 SSH 断开时会一起死。正确做法是写 `.bat` 再 WMI 拉起：

```powershell
Set-Content D:\projects\cc388-build.bat -Encoding ascii -Value @"
@echo off
"C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe" --project D:\projects\jingling_rogue-388 --build "platform=wechatgame;debug=false;buildPath=D:\projects\jingling_rogue-388\build-rel" > D:\projects\cc388-rel.log 2>&1
echo EXITCODE=%ERRORLEVEL% >> D:\projects\cc388-rel.log
"@

Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = "cmd.exe /c D:\projects\cc388-build.bat" }
```

然后把 `>` 重定向写进 `.bat`，**不要**塞进 `CommandLine`（会报 "filename syntax is incorrect"）。

### 2.2 构建不需要登录，预览需要 RDP

- 构建走得通，日志里只有 `OTA_LOGIN_REQUIRED`（OTA 检查失败，不影响产物）
- SSH 会话里 GPU 进程直接崩：`gpu_process_host.cc: GPU process exited unexpectedly: exit_code=34`
  → **预览/看画面必须走 RDP（3389，已开）**，别在 SSH 里指望 7456

### 2.3 构建参数的小脾气

- 耗时：首次含导入约 115s，之后约 79s
- `debug=true/false` 以字符串传入会有一条 warning，会用默认值跑通，不用管
- `buildPath` 用绝对路径
- CLI 退出码不可靠（3.8.2 时代成功也返回 36），**以日志 `build Task (...) Finished` 和产物为准**

### 2.4 PowerShell 语法

Windows 这份 PowerShell 是 5.1：`&&` 不可用，用 `;`。中文输出乱码是代码页问题，加
`chcp 65001 | Out-Null`。`tools/check_vendor_drift.py` 已改 `shutil.which("pnpm")`，`pnpm test` 能跑。

## 3. 已经确认的事实（不要重新验证）

- 升级改动量：**82 改 + 4 新增 = 86 文件**。其中 76 个是 `.meta` 的 `ver` `1.0.26`→`1.0.27`，
  真正有内容变化的只有 3 处：`settings/v2/packages/engine.json` 多出 `legacy-pipeline`、
  4 个新平台 `profiles/*.json`、`package.json` 的 `creator.version`。
- `assets/boot.scene`、`assets/ui-art/effects/*.effect`、`build-templates/` **全部没变**。
- 升前 vs 升后主包：**3,387,679 → 5,853,482 字节**（微信，debug=false，已跑 `pack_subpackages.py`）。
- 根因：引擎配置迁移 `engine(1.0.10)` 抛 `TypeError: Cannot read properties of undefined (reading 'graphcis')`
  （`graphcis` 是 Cocos 自己的拼写错误），`includeModules` 没迁到 3.8.8 新 schema，
  构建回落成「全模块」，`cocos-js` 从 1.75MB 涨到 3.72MB。
- `pnpm test`（core 284 / presentation 758 / platform 17）、`check:forbidden`、`check:pack`（665,399 字节）、
  `pnpm shot`（48 张）、`pnpm pack:minigame` 在 Windows 上**全部通过**。
- `pnpm shot` 是纯 Node 无头渲染（`@napi-rs/canvas`），**与引擎版本无关**，不需要为升级重跑对比。

## 4. 任务清单

按顺序做，T1 是阻塞项，T1 不通过后面都没有意义。

### T1（阻塞）恢复引擎模块裁剪

目标：让 `cocos-js` 回到 ~1.7MB 量级，主包 ≤ 4MiB。

`settings/v2/packages/engine.json` 当前只勾了 12 个模块：

```
base, gfx-webgl, gfx-webgl2, 3d, primitive, 2d, ui, tween, animation, intersection-2d, audio, legacy-pipeline
```

但 3.8.8 构建日志里 40+ 个 `cc-fu/*` 全被加载。三条路，从便宜到贵：

1. **RDP 里用 GUI 重勾**：RDP 连 3389 → 用 3.8.8 打开 `D:\projects\jingling_rogue-388`
   → 项目设置 → 功能裁剪 → 只勾上面那 12 项 → 保存 → 看 `settings/v2/packages/engine.json`
   被写成什么新 schema。
2. **抄一个干净工程的 schema**：新建空白 3.8.8 工程，把它 `settings/v2/packages/engine.json` 拿来对比。
3. **读 migration 逻辑**：`resources\app.asar` 是 899MB 且 migration 是 `.ccc` 字节码，
   纯文本搜 `graphcis` 搜不到（已试过），走这条路性价比低。

验收（必须实测，不能只看版本号）：

```powershell
# 构建 → 打包分包 → 门禁
# 然后检查产物里不该有这些模块
Select-String -Path D:\projects\jingling_rogue-388\build-rel\wechatgame\cocos-js\*.js -Pattern "Terrain|TiledMap|VideoPlayer|dragonBones"
# cocos-js 总大小应回到 ~1.7MB
Get-ChildItem D:\projects\jingling_rogue-388\build-rel\wechatgame\cocos-js -File | Measure-Object Length -Sum
```

通过标准：`uv run --project tools python tools/check_cocos_build.py --wechat build-rel\wechatgame`
打印出 `wechatgame: main=... bytes` 且 **main ≤ 4,194,304**。

### T2 双平台构建 + 预算门禁

抖音开发者工具没装，先确认能否用微信单平台把 T1 验完；抖音侧要么装工具，要么只做到
「产物结构与字节数达标」这一步（`check_cocos_build.py --bytedance` 不需要工具）。

```powershell
# 每个平台：构建 → 打包分包 → 门禁
uv run --project tools python tools/pack_subpackages.py build-rel\wechatgame
uv run --project tools python tools/check_cocos_build.py --wechat build-rel\wechatgame --json-out docs\ui\baselines\3.8.8-build.json
```

### T3 两个水墨 effect 在 3.8.8 下编译与观感

`assets/ui-art/effects/ink-wash.effect`（洗墨转场）、`ink-splash.effect`（受击溅墨）。
两者都靠自定义 `inkParams` / `inkColor` uniform，`InkWash.ts` / `InkSplash.ts` 里用
`setProperty` 传值。3.8.4 起默认管线换成 Builtin 可定制管线，**这是最可能翻车的地方**。

注意 3.8.7 的 breaking change：`bloom` 加了 `intensity` 参数，3.8.4~3.8.6 升上来的要把 2.3 改回 1.0
（我们没用 bloom，仅备查）。

验收：RDP 里跑预览，走一遍「标题 → 模式 → 大厅 → 战斗受击 → 结算」，洗墨要洗得干净、不得留残墨或黑屏。

### T4 Sprite + UIOpacity 透明度专项

3.8.8 修复列表里有一条「修复精灵透明度无法修改」——说明 3.8.6/3.8.7 附近有过 Sprite 透明度回归。
本项目 `assets/scripts/ui/paint.ts`、`portrait.ts` 大量用 `Sprite` + `UIOpacity` 叠加做淡入淡出。

验收：立绘页、战斗受击、弹层淡入淡出，透明度必须真的生效（不是全不透明也不是全透明）。

### T5 开发者工具导入

微信：`cli.bat` 可以直接命令行导入 `build-rel\wechatgame`，看模拟器里标题页与「新的旅途」是否正常。
抖音：需要先装抖音开发者工具（**需要人来装**，或者确认可以跳过）。

### T6 收尾决策

无论 T1 过不过，都要写结论：

- 过了 → 把升级做成独立提交（更新 `package.json` 两处 `creator.version`、提交 86 个文件的改动），
  同步更新 `docs/ops/remote-dev-windows.md` 与 `docs/platform/minigame-pack.md` 里的版本号，
  两台机器一起换 3.8.8
- 没过 → 把 T1 卡在哪写清楚，主线继续锁 3.8.2，`docs/ops/cocos-upgrade-3.8.8-probe.md` 里补一节

## 5. 硬约束

- **不要在 `D:\projects\jingling_rogue` 上直接升级**。升级实验只在 `-388` 克隆里做。
- 不要提交 `library/`、`temp/`、`build/`、`build-rel/`、`profiles/`、`.shots/`、`tools/.venv`。
- 不要跨平台拷 `node_modules/`（已各自安装）。
- 改 `packages/core` 后跑 `pnpm sync:core`，改 `packages/presentation` 后跑 `pnpm sync:presentation`；
  改完跑 `pnpm test`、`pnpm check:forbidden`。
- 禁止 Phaser、禁止上游源码、禁止官方名，核心不得 `import "cc"`（见 `docs/legal/clean-room.md`）。
- 需要人来的两件事：**Cocos 账号登录**（GUI 面板/OTA）、**抖音开发者工具安装**。其余 agent 可自处理。

## 6. 参考：3.8.8 里对这个项目有价值的改动

升级不是纯负担，攒下来的收益（T1 解决后才会兑现）：

- 3.8.7：新版微信开发者工具兼容（`readFile:fail`）、微信模板 `libVersion` 更新
- 3.8.7：**2D 渲染排序**（Sorting Layer + Order）、修「UI 组件显隐中断批处理」、chunk 预分配
- 3.8.3：抖音 WASM + 预加载脚本、Brotli 压缩（构建面板勾选，体积约缩 2/3）
- 3.8.5/3.8.6：包体优化（内联枚举、模块裁剪细化、微信 2D 工程 −160KB）

对我们没价值、可以完全忽略：3.8.8 的全部主项（HarmonyOS Next、Android 16KB 页）、
Spine、Box2D、Builtin 3D 管线、WebGPU、淘宝/支付宝/咪咕/Google Play。
