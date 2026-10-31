# 素材生成规格表（gpt-image-1 等图像模型）

> **2026-10-30：风格改为水墨（水彩加墨线）。** 下面第 1、2 节已换成水墨版前缀；第 3 节起的形象描述仍可用，但颜色以水墨规格为准。
> 参考样张：`.artifacts/ink-i1/portrait_zao_li_ink.png`。验收真源：`docs/superpowers/specs/2026-10-29-ink-design.md`。
> **出图方式：定妆照 + `images.edit`**，见水墨规格第 5 节"角色一致性"。

> 照此逐个生成。**先做「首发三初始」试产**，风格对了再批量。
> 形象来自 `spirit-visual-brief.md`（确认后为准）；风格与禁止项来自 `docs/ip/spirit-bible.md`。

## 0. 通用参数

- **接入（Azure OpenAI）**：脚本 `tools/gen_art.py` 用以下环境变量：
  - `AZURE_OPENAI_ENDPOINT`（如 `https://你的资源名.openai.azure.com`）
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_IMAGE_DEPLOYMENT`（你的 gpt-image-1 **部署名**，不是模型 id）
  - `AZURE_OPENAI_API_VERSION`（可选，默认 `preview`）
  - 未设 AZURE_* 时回退用 `OPENAI_API_KEY` 直连。
- **透明底**：`background="transparent"` + `output_format="png"`（Azure/直连都支持；返回 b64）。
- **尺寸**：立绘用 `1024x1024` 生成，后处理再等比缩到 512（见接入脚本）。
  Azure gpt-image-1 尺寸仅支持 `1024x1024 / 1024x1536 / 1536x1024`。
- **一张一物**：一次只生成一个对象，不要拼图。
- **不要文字**：prompt 已含 "no text no logo"。
- **参考图**：2026-10-30 验证，项目 Azure 部署支持 `images.edit` 传参考图并输出透明底。旧版"只稳定支持 generate"的说法已过时。风格和形象一致性靠"定妆照 + edit"，不再只靠固定 STYLE 前缀。`tools/gen_art.py` 目前只调 `generate`，I3 开工时加 edit 模式。


## 1. 统一 STYLE 前缀（每条 prompt 都以它开头）

```
Chinese ink-wash painting creature portrait (watercolor with ink lines): loose expressive
black brush outlines with thick-thin calligraphic line weight, soft ink-wash gradients
for volume, slight ink bleed at edges, light watercolor tints with one or two main
colors per creature, the rest in black and grey ink; cute chibi full body, round and
easy to read at small size, three-quarter view, centered, empty space under the feet,
RGBA transparent background, no paper texture baked in, no circular/oval pad under
the character, no text, no seal stamp, no signature, no border.
```

## 2. 统一 NEGATIVE（clean-room 强制，放进 negative 或 prompt 末尾）

```
Do NOT imitate or recolor any existing commercial monster-collecting franchise mascot,
no official dragon/rat/turtle/frog silhouettes, no Japanese pet-monster style, no photo
realism, no glossy candy cel-shading, no thick black cartoon outlines, no neon colors,
no dark stone-rubbing mood. Original design only.
```

## 3. 首发三初始（先试产这三张）

| id | 文件名 | 形象 prompt（接在 STYLE 前缀后） |
|---|---|---|
| `zao_li` | `portrait_zao_li` | a round chubby orange-red raccoon-cat spirit, a small flame tuft as bangs on its forehead, tail tip is a little dancing flame, soft ash marks on both cheeks, warm orange and amber palette |
| `jing_zhu` | `portrait_jing_zhu` | a cute water-droplet spider spirit, round semi-translucent body like a water bead, eight short round-tipped legs, a ring of well-water ripple pattern on its back, teal and lake-green palette |
| `tao_geng` | `portrait_tao_geng` | a little wooden puppet made of peach-twig branches, head is half a peach, limbs are tender green twigs, two fresh leaves sprouting on top, peach-pink and tender-green palette |

## 4. 前期敌（验证用）

| id | 文件名 | 形象 prompt |
|---|---|---|
| `deng_e` | `portrait_deng_e` | a fluffy pale-yellow little moth, wings glow warm like paper lanterns, curly antennae, yellow and warm-orange palette |
| `she_mu` | `portrait_she_mu` | a coiled little purple-grey snake, half-closed gentle eyes (not scary), tail tied in a soft knot, muted violet palette |

## 5. 图标集（统一风格；一次一图，透明底，正面微俯）

STYLE 前缀改为图标版：
```
Chunky cartoon game UI icon, single centered object, thick rounded outline, glossy
top highlight and soft bottom shadow (puffy 3D jelly look), warm candy palette to
match a sky-blue UI, RGBA transparent background, no text.
```
逐个生成：`icon_art`(a magic talisman spark 术)、`icon_party`(two cute creature heads 队伍)、
`icon_bag`(a little pouch 囊)、`icon_flee`(running paw prints 走)、`icon_potion`(a dew vial 灵露)、
`icon_seal`(a stamp seal 镇物)、`icon_scroll`(a tattered scroll 残卷)、
`icon_codex`(a book 契录)、`icon_eggs`(an egg 卵)、`icon_achievements`(a trophy)、
`icon_stats`(a bar chart)、`icon_settings`(a gear)、`icon_slots`(a save disk)。

## 6. 场景装饰（可选，验证后再做）

`bg_field`(草地含远山地平线)、`deco_cloud`(蓬松白云)、`deco_grass`(草丛剪影)、
`fx_hit`/`fx_heal`/`fx_catch`(打击/治疗/收服光效)。

## 7. 不建议用模型生成的（保留程序化）

**9-slice 按钮 / 面板 / 名牌 / 血条槽**：需要规整可拉伸边框，模型出的四角不对称、拉伸变形。
这类保留 Cocos 程序化画法（骨架已回退支持），后续我把程序化质感再调好。
如果一定要贴图花纹，只生成"平铺纹理片"贴在容器内层，边框仍程序化。

## 8. 生成后交给我

- 放进 `.artifacts/ui-art/incoming/`（脚本会处理，目录在 Cocos `assets/` 外且已忽略），或直接放 `assets/portraits/spirits/<id>/` 与 `assets/ui-art/`。
- 若走 API，我可写批量生成脚本（读本表逐条调用）+ 自动接入脚本（去背景校验 / 缩放 / 命名 / 图集切图表）。
- 接入后逐页重拍并**逐张肉眼验收**。

---

## 试产流程（建议）

1. 你确认 `spirit-visual-brief.md` 的三只形象。
2. 先只生成 `portrait_zao_li` 一张 → 满意后作为**风格锚**（Azure 不传参考图，靠固定 STYLE 前缀 + 同款 prompt 保持一致）。
3. 再出 `jing_zhu`、`tao_geng`（同一 STYLE 前缀）→ 看三只是否风格一致；不一致就微调形象描述重跑。
4. 三只过关 → 接进 Cocos 的 starter/battle 页看真实效果 → 再批量出图标与其余精怪。
