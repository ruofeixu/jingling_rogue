# U0 全界面产品化基线 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改玩法和现有 Cocos 页面实现的前提下，建立全页面产品化真源、clean-room 参考矩阵、三张原创关键帧，以及可复现的真实 Cocos 构建与性能基线。

**Architecture:** U0 只新增规格、ADR、机器可读页面矩阵、SVG 关键帧和 Python 验收工具。`packages/core` 的现有 `LOBBY_SCREENS`、`RUN_SCREENS`、`TOUR` 仍是当前页面事实来源；工具从源码抽取这些集合，与 `docs/ui/screen-matrix.json` 交叉验证。真实构建检查只读取 Cocos 最终输出，不把 `packages/platform` 的占位 preview pack 当作真实产物。

**Tech Stack:** Python 3.11+ / pytest / JSON / SVG / Cocos Creator 3.8.2 / Jujutsu

---

## Global Constraints

- 先读 `docs/legal/clean-room.md`、`docs/legal/forbidden-terms.md`、`docs/ip/spirit-bible.md`
- 禁止 Phaser、上游源码、官方名、竞品素材与具体布局复制
- 仓库内视觉方向只写“明亮童话志怪”；参考来源只保留 URL、观察维度与抽象规律
- 不改 `packages/core/src/run/policies.ts`，不改玩法，不进入 U1
- 不修改现有 `Boot.ts` / `paint.ts` / `scene.ts` 的产品行为
- 不安装外部 skill；不提交或推送；只用 `jj` 检查变更
- Shell 命令必须用 `rtk` 前缀

## File Map

- Create: `docs/superpowers/specs/2026-08-31-ui-productization.md` — 产品化验收真源
- Create: `docs/superpowers/plans/2026-08-31-ui-productization-roadmap.md` — U0–U11 阶段路线
- Create: `docs/adr/0001-ui-presentation-shell.md` — 保留 Cocos/core、引入 presentation/AppShell 的决策记录
- Create: `docs/ui/screen-matrix.json` — 页面、状态、主任务、Demo 与阶段归属的机器可读矩阵
- Create: `docs/ui/reference-matrix.md` — 公开参考来源与 clean-room 抽象规则
- Create: `docs/ui/keyframes/title.svg` — 原创标题大厅关键帧
- Create: `docs/ui/keyframes/starter.svg` — 原创初始选择关键帧
- Create: `docs/ui/keyframes/battle.svg` — 原创战斗主界面关键帧
- Create: `docs/ui/baselines/2026-08-31.md` — 当前静态截图、真实 Cocos 构建与性能记录
- Create: `tools/check_ui_productization.py` — 页面矩阵与关键帧验收
- Create: `tools/check_cocos_build.py` — 真实微信/抖音构建产物检查与 JSON 基线输出
- Create: `tools/tests/test_check_ui_productization.py` — 页面/TOUR/关键帧失败测试
- Create: `tools/tests/test_check_cocos_build.py` — 最终构建、包体、占位包拒绝测试
- Modify: `package.json` — 增加 `check:ui-productization`、`check:cocos-build` 命令

### Task 1: 页面矩阵 RED → GREEN

- [ ] **Step 1: 写页面覆盖失败测试**

在 `tools/tests/test_check_ui_productization.py` 中：

```python
from pathlib import Path

from check_ui_productization import audit_productization


def test_repo_matrix_covers_core_screens_tour_and_keyframes() -> None:
    root = Path(__file__).resolve().parents[2]
    report = audit_productization(root)
    assert report.missing_screens == []
    assert report.missing_tour_stops == []
    assert report.missing_keyframes == []
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `rtk uv run --project tools --extra dev pytest tools/tests/test_check_ui_productization.py -q`

Expected: FAIL，原因是 `check_ui_productization` 尚不存在。

- [ ] **Step 3: 实现最小审计工具和页面矩阵**

`check_ui_productization.py` 必须：

1. 从 `packages/core/src/ui/screens.ts` 抽取 `LOBBY_SCREENS`、`RUN_SCREENS`
2. 从 `packages/core/src/ui/tour.ts` 抽取 `name` 与 `screen`
3. 读取 `docs/ui/screen-matrix.json`
4. 报告缺少的 screen、tour stop 和 `title/starter/battle` 三张 SVG
5. CLI 成功输出 `ui productization coverage: ...`，缺项时退出 1

矩阵至少包含当前全部 screen；`party` 虽无 TOUR stop 仍必须保留，因为它在 `RUN_SCREENS` 中。

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `rtk uv run --project tools --extra dev pytest tools/tests/test_check_ui_productization.py -q`

Expected: PASS。

### Task 2: 真实构建检查 RED → GREEN

- [ ] **Step 1: 写构建检查失败测试**

在 `tools/tests/test_check_cocos_build.py` 中覆盖：

- 缺少 `game.js` 或 `game.json` 时拒绝
- 主包超过 4 MiB 时拒绝
- 文件包含 `console.log("[jingling] bundle-` 的占位分包时拒绝
- 合法微信/抖音夹具可输出 main/subpackage/remote 字节数

- [ ] **Step 2: 运行测试确认 RED**

Run: `rtk uv run --project tools --extra dev pytest tools/tests/test_check_cocos_build.py -q`

Expected: FAIL，原因是 `check_cocos_build` 尚不存在。

- [ ] **Step 3: 实现最终产物检查工具**

`check_cocos_build.py` 提供：

```python
@dataclass(frozen=True)
class BuildBaseline:
    platform: str
    root: Path
    main_bytes: int
    subpackage_bytes: dict[str, int]
    remote_bytes: int
    file_count: int
```

主包统计排除 `subpackages/` 与 `remote/`；`inspect_build(root, platform)` 返回结构化结果；CLI 接受 `--wechat`、`--bytedance`、`--json-out`，任一产物无效即退出 1。

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `rtk uv run --project tools --extra dev pytest tools/tests/test_check_cocos_build.py -q`

Expected: PASS。

### Task 3: 规格、ADR、参考矩阵和原创关键帧

- [ ] **Step 1: 编写产品化规格和路线图**

规格必须钉死：页面全集、加载/空/错误/锁定状态、三张关键帧门、竖屏主目标、真实 Cocos 截图真源、主包 ≤4 MiB、U0→U11 顺序与每阶段 Demo。

- [ ] **Step 2: 编写 ADR**

记录三个备选：继续 Boot 命令式绘制、换引擎、保留 Cocos/core 并引入 presentation/AppShell。选择第三项，并说明迁移、回退、资源和测试边界。

- [ ] **Step 3: 编写 clean-room 参考矩阵**

仅记录官方站、公开视频、4Gamer 图库/文章 URL；按世界层次、角色中心、色彩、面板、HUD、图标、动效分析；每行都有“可抽象”与“禁止复制”。

- [ ] **Step 4: 创建三张原创 SVG 关键帧**

三张均为 750×1334，包含：

- 标题：远景天光、中景城邑/山野、前景草叶，角色陪伴区，主行动突出，次级入口弱化
- 初始：三只原创精怪卡、选中详情、费用与灵性信息、单一主 CTA
- 战斗：中景立绘、敌我名牌、右侧竖列术签、上方队伍/囊/镇物、底部战况文本

禁止嵌入外部图片、竞品文字、商标和识别性布局。

- [ ] **Step 5: 运行 U0 文档审计**

Run: `rtk uv run --project tools python tools/check_ui_productization.py`

Expected: 输出覆盖 screen、tour stop、keyframe 数量且退出 0。

### Task 4: 真实 Cocos 基线与产物记录

- [ ] **Step 1: 定位 Creator 3.8.2 CLI**

检查 `/Applications` 和已运行进程，只调用已安装版本，不安装软件。

- [ ] **Step 2: 构建微信和抖音真实产物**

输出到独立基线目录（如 `.u0-build/wechatgame`、`.u0-build/bytedance-mini-game`），不得覆盖用户现有 build。

- [ ] **Step 3: 运行真实构建检查并生成 JSON**

Run:

```bash
rtk uv run --project tools python tools/check_cocos_build.py \
  --wechat .u0-build/wechatgame \
  --bytedance .u0-build/bytedance-mini-game \
  --json-out .u0-build/baseline.json
```

Expected: 两平台通过、主包 ≤4 MiB、无占位分包。

- [ ] **Step 4: 捕获真实 Cocos 截图与性能证据**

记录 Creator 预览 URL/截图路径、首屏节点数、Draw Call、帧率和内存。若 Creator CLI、开发者工具或预览端口不可用，必须在 `docs/ui/baselines/2026-08-31.md` 记录实际命令、错误输出、缺少的环境和下一次复现步骤；不得拿 `.shots` 冒充。

- [ ] **Step 5: 人工审查三张关键帧**

检查 750×1334、信息层级、角色中心、原创性、浅底可读性、术签方向与无竞品素材；将结论写入基线文档。

### Task 5: 全量验证与独立复核

- [ ] **Step 1: 添加 package scripts**

```json
"check:ui-productization": "uv run --project tools python tools/check_ui_productization.py",
"check:cocos-build": "uv run --project tools python tools/check_cocos_build.py"
```

`check:cocos-build` 不带路径时应打印用法并退出 2，不自动接受占位包。

- [ ] **Step 2: 运行全量验证**

```bash
rtk pnpm test
rtk pnpm check:forbidden
rtk pnpm check:pack
rtk pnpm test:py
rtk pnpm validate:game
rtk pnpm check:ui-productization
```

U0 不修改 core 时无需 `sync:core`；如实现中意外修改 core，必须执行 `rtk pnpm sync:core` 并说明原因。

- [ ] **Step 3: 独立复核**

审查者逐项核对 U0 规格：页面覆盖、参考矩阵 clean-room、三张原创关键帧、真实构建检查不接受 preview pack、基线未把 `.shots` 当真实 Cocos。

- [ ] **Step 4: 检查 Jujutsu 变更**

Run: `rtk jj status`、`rtk jj diff --stat`

Expected: 只出现本计划列出的 U0 文件和 `package.json`；不触碰玩法、`Boot.ts`、旧立绘或 archive 大图。

## U0 完成定义

1. 页面矩阵覆盖 `LOBBY_SCREENS`、`RUN_SCREENS` 和全部 TOUR stop
2. 三张 750×1334 原创 SVG 关键帧存在并通过人工审查
3. 参考矩阵只有公开 URL、抽象规律和禁止复制项
4. 真实构建工具能拒绝缺失产物、超限主包和占位分包
5. 真实 Cocos 构建/截图/性能有证据；环境不可用时有明确阻塞证据，不用 `.shots` 替代
6. 全量自动验证通过，独立复核无 Critical/Important 问题
