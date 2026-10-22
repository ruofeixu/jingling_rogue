# UI 贴图接入说明（assets/ui-art）

Cocos 侧已搭好"接贴图骨架"。把美术素材按下面约定放好，**无需改代码**即可生效；
没有素材时 Panel/Button 自动回退到内置 Graphics 画法（与素材接入前效果一致）。

## 目录与打包

- 素材放在本目录 `assets/ui-art/` 下，并在 Cocos 编辑器里把本目录设为 **Asset Bundle**，
  bundle 名 = `ui-art`（与 `UiSkin.ts` 的 `UI_ART_BUNDLE` 一致）。
- 运行时 `UiSkin` 会尝试 `assetManager.loadBundle("ui-art")`；bundle 不存在就安静回退。

## 命名（与 docs/ui/design-mockups/asset-manifest.md 对齐）

每张图一个 SpriteFrame，名字即 `UiSkin.getFrame(name)` 的 name：

**9-slice 容器**（边距已在 `UiSkin.ts` 的 `SLICE_TABLE` 登记，可按需调）：
`panel_cream` `panel_board` `btn_primary` `btn_normal` `btn_disabled`
`chip` `nameplate` `topbar` `log_bubble` `ribbon_win` `ribbon_lose`
`hpbar_track` `hpbar_fill_green` `hpbar_fill_red`

**图标**（按名取，缺失则该按钮不画图标）：
命令 `icon_art` `icon_party` `icon_bag` `icon_flee`；
入口 `icon_codex` `icon_eggs` `icon_achievements` `icon_stats` `icon_settings` `icon_slots` …

## 生效规则（已实现）

- `makePanel({ skin })`：有对应 SpriteFrame → 用 `Sprite`(SLICED, 9-slice)；否则 Graphics 回退。
  面板默认 skin = `panel_cream`。
- `makeButton({ primary, icon })`：按 enabled/primary 取 `btn_disabled|btn_primary|btn_normal`；
  有图 → 9-slice Sprite，否则 Graphics 回退。`icon` 有对应图才画。
- 首次用到贴图时 `UiSkin` 异步加载 bundle，加载成功后派发 `ui-skin-ready` 事件，
  `AppShell` 收到后重刷当前页，让贴图即时生效（无素材则不派发、保持回退）。

## 9-slice 边距

若素材的可拉伸边框与 `SLICE_TABLE` 默认值不同，改 `assets/scripts/app/ui/UiSkin.ts`
里对应项的 `{left,right,top,bottom}`（单位：素材像素）。

## 验证

- 无素材回退：已实测 `hasUiArtBundle=false` 时按钮 `Graphics` 组件在、无 `Sprite`，
  画面与接入前一致（`docs/superpowers/plans` U16 记录）。
- 契约测试：`packages/presentation/src/u16-skin-skeleton.test.ts`
  锁住"有贴图用 Sprite、无贴图回退 Graphics、不写死颜色、AppShell 不直接依赖 UiSkin 类"。
- 接入素材后请逐页重拍并**逐张肉眼验收**（见规格 6.1.1）。
