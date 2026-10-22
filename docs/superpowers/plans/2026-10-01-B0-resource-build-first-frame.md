# B0：资源、构建与首帧真实性（2026-10-01）

**上游：** [内测准备路线图](./2026-10-01-internal-beta-roadmap.md)

## 目标

消除当前最直接的内测阻断：生成中间图污染正式 bundle、禁用词门失败、ui-art 未进入分包流程、标题首帧背景负缓存、验证脚本异常仍假绿。

## 非目标

- 不在 B0 重写 title/starter 视觉（B1/B2）。
- 不把 AppShell 挂进 `boot.scene`（B2）。
- 不做真机测试（本地模拟稳定后统一做）。

## 任务与 RED

1. **中间产物隔离**
   - RED：资源审计断言 Asset Bundle 目录中不得有 `incoming/`、`.generated/` 等生成暂存目录。
   - 将 Azure 生成输出迁到仓库根 `.artifacts/ui-art/incoming/`（gitignore），更新 `gen_art.py`、`ingest_art.py`、文档。
   - 删除/移出 `assets/ui-art/incoming`，Cocos 构建不得包含 `incoming/*`。

2. **禁用词恢复**
   - RED 已有：`check:forbidden` 命中 `tools/gen_art.py` 中第三方品牌词。
   - 改为通用 clean-room 表述，不在源码/prompt 出现禁用商标或产品体系词。

3. **UiSkin 首帧加载**
   - RED：契约测试断言 bundle 未就绪时不得 `frames.set(name, null)` 永久负缓存。
   - 修为：bundle 未就绪仅返回 null，不写缓存；bundle 就绪派事件后重刷并开始具体帧加载。
   - 缺失帧可负缓存；已存在帧加载完成后重刷一次。

4. **ui-art 分包与打包工具**
   - RED：build config / 打包测试要求 portraits + ui-art 都进入分包；重复打包不得覆盖已有 `game.json.subpackages`。
   - `pack_subpackages.py` 默认/脚本调用支持两个 bundle，并合并声明而非覆盖。
   - 构建检查增加：分包目录必须有 `game.js`；`src/settings.json` 的 assets.subpackages 与 game.json 一致；每分包和总分包预算有显式门。

5. **验证脚本硬失败**
   - RED：运行时结果缺 page/shell、CDP exception、背景/图标断言失败时脚本必须非零退出。
   - 修 `uiart-verify.mjs`：等待引擎就绪；断言 title/battle screenId、背景 Sprite、battle iconCount=4、截图尺寸；错误时 throw。

## 退出门

- `pnpm test`、Python 全量、`check:forbidden`、`check:pack` 全绿。
- 新鲜 web 构建：ui-art bundle 中无 `incoming`，title 首次路由最终 backdrop Sprite=true，battle iconCount=4；脚本断言失败会非零退出。
- 新鲜微信构建：portraits 与 ui-art 均被打成合法分包，主包 ≤4MiB；分包/总包预算由检查器实际验证。
- 证据记录实际命令、字节数、截图尺寸和仍未解决的 B1/B2 问题。
