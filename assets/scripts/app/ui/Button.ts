import { Color, Graphics, Label, Node, Sprite, Tween, UITransform, Vec3, tween } from "cc";
import {
  COLOR,
  MIN_HIT_SIZE,
  RADIUS,
  SPACE,
  TYPE,
  assertHitArea,
  type Rgb,
  type ScreenAction,
} from "../../vendor/jinglingPresentation";
import { UiSkin } from "./UiSkin.ts";

function color(token: Rgb, alpha = 255): Color {
  return new Color(token[0], token[1], token[2], alpha);
}

/** 压暗：向黑插值（f<1 越小越暗）。用于描边。 */
function shade(token: Rgb, f: number): Color {
  return new Color(Math.round(token[0] * f), Math.round(token[1] * f), Math.round(token[2] * f), 255);
}

/** 按下 60ms 缩到 0.94，松开或取消 90ms 回到 1。都低于减少动效的 150ms 上限。 */
const PRESS_SCALE = 0.94;
const PRESS_IN_SEC = 0.06;
const PRESS_OUT_SEC = 0.09;

function scaleTo(node: Node, scale: number, seconds: number): void {
  Tween.stopAllByTarget(node);
  tween(node)
    .to(seconds, { scale: new Vec3(scale, scale, 1) })
    .start();
}

export interface ButtonOptions {
  readonly action: ScreenAction;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** 一级行动用 accent 底，其余用 slip 底；同屏只应有一个 primary。 */
  readonly primary?: boolean;
  readonly textScale?: number;
  /** 可选图标名（图集内），缺省或素材缺失时不画图标。 */
  readonly icon?: string;
}

/**
 * 最小按钮。有 UI 贴图皮肤时用 9-slice Sprite（primary/normal/disabled 三态）+ 可选图标；
 * 否则回退到 token 驱动的 Graphics 画法，与素材接入前一致。
 * 热区低于 44×44 直接抛错；禁用必须带 disabledReason。
 */
export function makeButton(parent: Node, opts: ButtonOptions, onTap?: () => void): Node {
  assertHitArea({ width: opts.width, height: opts.height }, opts.action.id);
  if (!opts.action.enabled && !opts.action.disabledReason) {
    throw new Error(`button ${opts.action.id} is disabled without a disabledReason`);
  }

  const node = new Node(`button-${opts.action.id}`);
  node.layer = parent.layer;
  parent.addChild(node);
  const transform = node.addComponent(UITransform);
  transform.setContentSize(Math.max(opts.width, MIN_HIT_SIZE), Math.max(opts.height, MIN_HIT_SIZE));
  node.setPosition(opts.x, opts.y, 0);

  const skinName = !opts.action.enabled ? "btn_disabled" : opts.primary ? "btn_primary" : "btn_normal";
  const frame = UiSkin.shared().getFrame(skinName);
  if (frame) {
    const sprite = node.addComponent(Sprite);
    sprite.spriteFrame = frame;
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    UiSkin.shared().applySlice(sprite, skinName);
    // 赋 spriteFrame 会把节点重设成贴图原尺寸，CUSTOM 之后再把按钮尺寸设回来。
    transform.setContentSize(Math.max(opts.width, MIN_HIT_SIZE), Math.max(opts.height, MIN_HIT_SIZE));
  } else {
    // 回退：水墨程序化画法 —— 平涂主体 + 细描边（朱砂按钮边同色，像一方印）。笔触由贴图提供（I2b）。
    const half = { w: opts.width / 2, h: opts.height / 2 };
    // 禁用的一级按钮退到 slip 底：淡墨字压朱砂看不清。
    const vermilion = opts.primary && opts.action.enabled;
    const bodyTok = vermilion ? COLOR.accent : COLOR.slip;
    const edgeTok = vermilion ? COLOR.accent : COLOR.edge;
    const g = node.addComponent(Graphics);
    g.roundRect(-half.w, -half.h, opts.width, opts.height, RADIUS.control);
    g.fillColor = color(bodyTok);
    g.fill();
    g.strokeColor = shade(edgeTok, 0.85);
    g.lineWidth = SPACE.xs / 2;
    g.stroke();
  }

  // 可选图标（有素材才画）
  let labelX = 0;
  if (opts.icon) {
    const iconFrame = UiSkin.shared().getFrame(opts.icon);
    if (iconFrame) {
      const iconNode = new Node("icon");
      iconNode.layer = parent.layer;
      node.addChild(iconNode);
      const iconSize = Math.min(opts.height - SPACE.sm, TYPE.title * 1.2);
      const iconTransform = iconNode.addComponent(UITransform);
      const iconSprite = iconNode.addComponent(Sprite);
      iconSprite.spriteFrame = iconFrame;
      iconSprite.sizeMode = Sprite.SizeMode.CUSTOM;
      // 先赋图再定尺寸：否则 256×256 的图标原尺寸会盖掉这里的尺寸。
      iconTransform.setContentSize(iconSize, iconSize);
      iconNode.setPosition(-opts.width / 2 + iconSize / 2 + SPACE.md, 0, 0);
      labelX = iconSize / 2;
    }
  }

  const labelNode = new Node("label");
  labelNode.layer = parent.layer;
  node.addChild(labelNode);
  labelNode.addComponent(UITransform);
  labelNode.setPosition(labelX, 0, 0);
  const label = labelNode.addComponent(Label);
  label.string = opts.action.enabled
    ? opts.action.label
    : `${opts.action.label}（${opts.action.disabledReason}）`;
  label.fontSize = TYPE.body * (opts.textScale ?? 1);
  label.lineHeight = label.fontSize * TYPE.lineHeightRatio;
  // 朱砂底配宣纸色字（墨字压朱砂只有 2.29:1），其余墨字；禁用淡墨。
  label.color = !opts.action.enabled ? color(COLOR.muted) : opts.primary ? color(COLOR.paper) : color(COLOR.ink);
  label.horizontalAlign = Label.HorizontalAlign.CENTER;
  label.verticalAlign = Label.VerticalAlign.CENTER;

  if (onTap && opts.action.enabled) {
    node.on(Node.EventType.TOUCH_START, () => scaleTo(node, PRESS_SCALE, PRESS_IN_SEC), node);
    node.on(Node.EventType.TOUCH_CANCEL, () => scaleTo(node, 1, PRESS_OUT_SEC), node);
    node.on(
      Node.EventType.TOUCH_END,
      () => {
        scaleTo(node, 1, PRESS_OUT_SEC);
        onTap();
      },
      node,
    );
  }
  return node;
}
