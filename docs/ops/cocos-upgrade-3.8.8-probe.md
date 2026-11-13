# 3.8.2 → 3.8.8 升级实测（2026-11-14）

在 Windows（`desktop-9p7mff1`）上用 **Cocos Creator 3.8.8** 打开一份干净的 3.8.2 克隆
（`D:\projects\jingling_rogue-388`，HEAD `4695f20`），跑真实构建，量出升级代价与风险。
主工作副本 `D:\projects\jingling_rogue` **没有被碰过**。

## 结论

**暂时不要升。** 升级会击穿主包预算：3.23MB → **5.58MB**（限 4MiB），
原因是 3.8.8 完全忽略本项目的引擎模块裁剪配置，把 40+ 个引擎模块全打进了 `cocos-js`。

## 一、仓库侧改动量（实测，不是估算）

| 类别 | 文件数 | 实际变化 |
|---|---|---|
| `assets/**/*.meta` | **76** | 只有 `ver`：`1.0.26` → `1.0.27`（image importer bump），内容不变 |
| `settings/v2/packages/` | 2 | `builder` `1.3.7`→`1.3.9`；`engine` `1.0.8`→`1.0.12`，**并新增 `legacy-pipeline` 模块** |
| `profiles/v2/packages/` | 7 | 3 个已跟踪文件版本 bump + **4 个新增**：`wechatgame` / `bytedance-mini-game` / `web-mobile` / `web-desktop` |
| `package.json` | 1 | `creator.version` `3.8.2` → `3.8.8` |
| `assets/boot.scene` | 0 | **没变** |
| `assets/**/*.effect` | 0 | **没变**（两个水墨 effect 原样） |
| `build-templates/` | 0 | **没变**（自定义模板未被覆盖，`libVersion: latest` 仍有效） |

合计 **82 改 + 4 新增 = 86 个文件**，但需要人判断的只有 `engine.json` 的 `legacy-pipeline` 一行，
其余全是版本号 bump。小工程的红利：95 个 meta、1 个 scene、0 个 prefab、0 个材质。

## 二、构建产物对比（微信小游戏，`debug=false`）

两边都用 `tools/pack_subpackages.py` 打包后再量，口径一致。

| 项 | 3.8.2（Mac） | 3.8.8（Windows） | 变化 |
|---|---|---|---|
| `cocos-js`（引擎） | 1,745,300 | **3,716,180** | **+113%** |
| `assets`（主包资源） | 1,441,058 | 1,928,643 | +34% |
| `web-adapter.js` | 90,024 | 102,097 | +13% |
| `engine-adapter.js` | 20,167 | 23,825 | +18% |
| `src` | 41,186 | 29,606 | −28% |
| **主包合计** | **3,387,679** | **5,853,482** | **+73%，超 4MiB** |
| 分包 `portraits` | — | 13,137,924 | 在上限内 |
| 分包 `ui-art` | — | 5,827,505 | 在上限内 |

## 三、根因：模块裁剪失效

`settings/v2/packages/engine.json` 只勾了 12 个模块，但 3.8.8 的构建日志显示
**40+ 个 `cc-fu/*` 模块全部被加载**：

```
spine  terrain  tiled-map  video  webview  xr  dragon-bones
physics-ammo  physics-cannon  physics-physx  physics-2d-*
gfx-webgpu  light-probe  particle  particle-2d  skeletal-animation
```

产物里实测：3.8.2 的 `cc.js` **不含** `ammo`/`TiledMap`/`VideoPlayer`/`Terrain`/`dragonBones`；
3.8.8 的**全都含**。

对应日志里唯一的迁移失败：

```
11-14-2026 02:41:52 - error: Cannot read properties of undefined (reading 'graphcis')
  TypeError: Cannot read properties of undefined (reading 'graphcis')
    at Object.migrateProject (...engine/dist/migrations/1.0.10.ccc:1:381)
11-14-2026 02:41:52 - error: [Package] Profile migrateProject: engine(1.0.10) failed!
```

即 Cocos 自己的 engine 配置迁移 1.0.10 抛错（`graphcis` 是官方代码里的拼写错误），
`includeModules` 没能迁到 3.8.8 的新 schema，构建时回落到「全模块」默认值。
`__version__` 仍被推进到 `1.0.12`，所以**版本号正常、配置实际是坏的**——这类静默降级只能靠量包体发现。

## 四、远程跑 Cocos 的正确姿势（重要）

**SSH 会话结束时 Windows 会杀掉进程树**，`Start-Process` 起的编辑器会跟着死。
必须用 WMI 起一个真正脱离会话的进程：

```powershell
# 先把命令写成 .bat（引号和 > 重定向在 CommandLine 里很容易出错）
Set-Content D:\projects\cc388-build.bat -Encoding ascii -Value @"
@echo off
"C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe" --project D:\projects\jingling_rogue-388 --build "platform=wechatgame;debug=false;buildPath=D:\projects\jingling_rogue-388\build-rel" > D:\projects\cc388-rel.log 2>&1
echo EXITCODE=%ERRORLEVEL% >> D:\projects\cc388-rel.log
"@

# 脱离 SSH 会话启动
Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = "cmd.exe /c D:\projects\cc388-build.bat" }
```

其他实测结论：

- 构建二次耗时 **79s**（首次含资源导入 115s），146 个进程内 worker，内存峰值 ~240MB
- **不需要登录 Cocos 账号**也能构建；日志里只有 `OTA_LOGIN_REQUIRED` 的 OTA 检查失败，不影响产物
- **GPU 进程在 SSH 会话里起不来**（`gpu_process_host.cc: GPU process exited unexpectedly: exit_code=34`）。
  构建走 CPU 不受影响，但**预览/渲染必须走 RDP（3389）**
- 构建参数从字符串传会有一条 `debug ("true") ... typeof debug should be boolean` 的警告，
  但会用默认值跑通；`buildPath` 用绝对路径

## 五、这台机器还缺什么

| 项 | 状态 |
|---|---|
| Cocos Creator 3.8.8 | ✅ `C:\ProgramData\cocos\editors\Creator\3.8.8` |
| Cocos Dashboard | ✅ `C:\Program Files (x86)\CocosDashboard` |
| 微信开发者工具 | ✅ 有 `cli.bat`（可命令行导入/预览） |
| **抖音开发者工具** | ❌ **没装** —— 抖音侧构建产物目前无法导入验证 |
| `funplay-cocos-mcp` 扩展 | ✅ 已从 Mac 复制到 `D:\projects\jingling_rogue\extensions\`（115 个文件，gitignore 内） |
| Cocos 账号登录 | ⚠️ 未登录（构建不需要，GUI 面板/OTA 需要） |
| GPU / 预览 | ⚠️ SSH 会话无 GPU，预览要走 RDP |

## 六、要升的话，先解决这一件事

在 **RDP 桌面会话**里用 3.8.8 打开一份克隆，进「项目设置 → 功能裁剪」重新勾选模块
（或新建一个空白 3.8.8 工程，抄它的 `settings/v2/packages/engine.json` 新 schema），
让 `cocos-js` 回到 1.7MB 量级、主包回到 4MiB 以内，再谈其余验收。

在此之前，内测主线继续锁 **3.8.2**。
