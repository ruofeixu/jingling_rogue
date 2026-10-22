# UI 贴图素材清单与规格（卡通厚涂可爱风）

> 用途：拿这份清单去**生成 / 外包 / 采购**一套风格一致的 UI 贴图。
> 拿到素材后由我接进 Cocos（9-slice 面板/按钮、图标图集、精灵立绘）。
> HTML 设计稿（`docs/ui/design-mockups/*.html`）只用来定**布局与信息结构**，质感以本清单的贴图为准。

## 0. 统一风格基调（所有素材共用）

- **风格**：卡通厚涂、可爱、圆润，参考洛克王国世界的 UI 质感。
- **描边**：粗、深色（暖棕或深蓝），带一点内高光；不要细而匀的线。
- **光影**：每个控件有"顶部高光 → 主体 → 底部暗部"的体积感，像有厚度的软糖。
- **配色**（与 Cocos token 对齐，见 `packages/core/src/ui/theme.ts`）：
  - 天空底 `#eaf4fd`、面板奶白 `#fffdf6`、主文字暖棕 `#4a3b2f`
  - 蓝描边 `#6fbdf0` / 深 `#3f8ed0`、主行动橙 `#ff9a4d` / 深 `#f0761a`
  - 血条绿 `#6ed07a`、敌方红 `#ff8f8f`、金 `#ffd24d`、次按钮浅橙 `#fff0d6`
- **输出**：PNG，透明底，@2x 与 @3x 两套（微信/抖音小游戏主流 DPR 2~3）。
- **命名**：`ui_<类别>_<名称>@2x.png`，例：`ui_btn_primary@2x.png`。

## 1. 九宫格（9-slice）容器类

这类要可拉伸，必须标注**四边安全边距**（切片不被拉伸的边框宽度）。

| 素材 | 用途 | 基准尺寸@2x | 9-slice 边距 | 备注 |
|---|---|---|---|---|
| `ui_panel_cream` | 通用面板/卡片底 | 600×400 | 上下左右各 40 | 奶白底、蓝厚描边、顶高光、底暗部 |
| `ui_panel_board` | 告示板/标题菜单板 | 620×420 | 各 48 | 木牌质感、暖橙描边 |
| `ui_btn_primary` | 主行动按钮 | 420×120 | 左右 60 / 上下 40 | 橙渐变、白字区、底部厚投影边 |
| `ui_btn_normal` | 次要按钮 | 420×120 | 左右 60 / 上下 40 | 浅橙底、棕描边 |
| `ui_btn_disabled` | 禁用按钮 | 420×120 | 同上 | 置灰、降饱和 |
| `ui_chip` | 状态胶囊（波数/金钱） | 240×72 | 左右 36 | 圆角药丸、白底蓝边 |
| `ui_nameplate` | 战斗名牌框 | 380×150 | 各 36 | 白底蓝厚边、内嵌 HP 条槽位 |
| `ui_topbar` | 战斗顶部状态条 | 700×90 | 左右 60 | 长药丸、分段分隔 |
| `ui_log_bubble` | 战况气泡条 | 700×96 | 左右 48 | 白底、左侧留对话尖角可选 |
| `ui_ribbon_win` | 胜局金色飘带 | 360×110 | 左右 80 | 金渐变、飘带端剪影 |
| `ui_ribbon_lose` | 败局灰蓝飘带 | 360×110 | 左右 80 | 冷灰蓝 |

## 2. 血条 / 进度条（分件）

| 素材 | 尺寸@2x | 备注 |
|---|---|---|
| `ui_hpbar_track` | 320×40（9-slice 左右 20） | 空槽，深描边、内阴影 |
| `ui_hpbar_fill_green` | 320×32（左右 16） | 我方，绿渐变 + 顶高光 |
| `ui_hpbar_fill_red` | 320×32 | 敌方，红渐变 |
| `ui_hpbar_fill_low` | 320×32 | 残血警示色（可选，橙红） |

## 3. 图标集（建议单张图集 atlas + 切图表）

统一 **96×96@2x**、透明底、同一描边风格、同一视角（正面微俯）。

**功能入口**：新的旅途(▶)、契录(书)、卵房(蛋)、成就(奖杯)、统计(图表)、设置(齿轮)、存档(软盘)、名词(问号书)。
**战斗命令**：术(星/符)、队伍(双人)、囊(背包)、走(脚印)。
**道具**：灵露(药瓶)、金印/凡印/上印/特印/玄印(印章 5 色)、残卷(卷轴)、小药、还魂、净体。
**属性/元素**（若需要）：金木水火土等属性小徽章。

> 图标是"贴图统一风格"的关键——现在 HTML 里用的 emoji（✨🎒🏆）就是廉价感主因，务必换成同风格手绘图标。

## 4. 精灵立绘（最重要，也最影响质感）

| 用途 | 尺寸@2x | 备注 |
|---|---|---|
| 战斗立绘（大） | ≤ 400×400 | 透明底、正面/四分之三视角、脚下留投影空间 |
| 大厅吉祥物 | ≤ 400×400 | 一只代表性精怪做门面 |
| 图鉴/卡面缩略 | 200×260 | 卡片内展示 |
| 初始选择卡立绘 | 300×360 | starter 三选一卡片用 |

- 至少先出**初始三只**（灶狸 / 井蛛 / 桃梗）+ **前期常见敌**（灯蛾等）用于验证战斗/starter/结算页。
- 全量精怪清单见 `docs/ip/spirit-bible.md`（原创 IP，勿用任何官方角色）。

## 5. 背景 / 场景装饰

| 素材 | 用途 | 尺寸@2x |
|---|---|---|
| `bg_sky` | 通用天空底（大厅/结算） | 750×1334，可平铺渐变 |
| `bg_field` | 战场草地（含远山地平线） | 750×900 |
| `deco_cloud_*` | 飘云 ×3 | 各 ≤ 200×100 |
| `deco_grass_*` | 草丛剪影 ×3 | 各 ≤ 160×80 |
| `fx_hit` / `fx_heal` / `fx_catch` | 打击/治疗/收服光效（序列帧或单图） | 256×256 |

## 6. 生成 / 外包时的 Prompt 参考（AI 绘图可直接用）

**UI 控件类**（按钮/面板/图标）：
> chunky cartoon game UI kit, thick rounded outlines, soft candy colors, glossy top
> highlight and bottom shadow giving a puffy 3D jelly look, cream and sky-blue and
> warm-orange palette, cute mobile game style similar to Roco Kingdom, PNG with
> transparent background, clean vector-like but painterly, no text.

**精灵立绘类**：
> cute original monster creature, chunky thick outline cartoon painterly shading,
> big shiny eyes, soft rounded body, warm palette, full body front view, transparent
> background, mascot game art, NOT copying any existing franchise character.

> 注意：精怪必须是**原创设计**（clean-room 要求），prompt 里明确"NOT copying any existing franchise"。

## 7. 交付格式给我时

- 目录放 `assets/ui-art/`（面板/按钮/图标）与 `assets/portraits/spirits/<id>/`（立绘）。
- 9-slice 素材附一行切片边距（或直接按上表）。
- 图标若是 atlas，附 `{name: [x,y,w,h]}` 切图表（json）。
- 我拿到后：接 Cocos 的 Sprite/Sprite9Slice、图集加载、立绘 bundle，并逐页重拍验收
  （届时若读图恢复我自己验，否则仍请你帮看）。

---

## 当前状态与下一步

- HTML 设计稿（布局参考）：`title.html` / `battle2.html`(已修覆盖 bug) / `outcome-shop.html`。
- **主线**：你按本清单拿到统一风格贴图 → 我接进 Cocos。
- 在拿到贴图前，Cocos 侧我可以先把**接贴图的骨架**搭好（Sprite9Slice 面板/按钮组件、图集加载、立绘位），
  这样素材一到就能直接套上，不用等。要不要我先搭这个骨架？
