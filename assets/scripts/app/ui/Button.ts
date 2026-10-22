import { Color, Graphics, Label, Node, Sprite, UITransform } from "cc";
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

/** 压暗：向黑插值（f<1 越小越暗）。用于立体厚边与描边。 */
function shade(token: Rgb, f: number): Color {
  return new Color(Math.round(token[0] * f), Math.round(token[1] * f), Math.round(token[2] * f), 255);
}

/** 提亮：向白插值（f 为向白比例）。用于顶部高光条。 */
function tint(token: Rgb, f: number): Color {
  const mix = (c: number) => Math.round(c + (255 - c) * f);
  return new Color(mix(token[0]), mix(token[1]), mix(token[2]), 255);
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
  } else {
    // 回退：程序化厚涂质感 —— 底部深色立体厚边 + 主体 + 顶部高光条 + 厚描边。
    const half = { w: opts.width / 2, h: opts.height / 2 };
    const bodyTok = opts.primary ? COLOR.accent : COLOR.slip;
    const edgeTok = opts.primary ? COLOR.accent : COLOR.edge;
    const ledge = SPACE.xs + 2;

    // 1) 底部立体厚边（主体色压暗，向下偏移，制造按下去的厚度）
    const shadow = node.addComponent(Graphics);
    shadow.roundRect(-half.w, -half.h - ledge, opts.width, opts.height, RADIUS.control);
    shadow.fillColor = shade(bodyTok, 0.72);
    shadow.fill();

    // 2) 主体
    const g = node.addComponent(Graphics);
    g.roundRect(-half.w, -half.h, opts.width, opts.height, RADIUS.control);
    g.fillColor = color(bodyTok);
    g.fill();
    g.strokeColor = shade(edgeTok, 0.8);
    g.lineWidth = SPACE.xs;
    g.stroke();

    // 3) 顶部高光条（主体色提亮，覆盖上半，圆角）
    const hi = node.addComponent(Graphics);
    const hiH = opts.height * 0.42;
    hi.roundRect(-half.w + ledge, half.h - hiH - ledge, opts.width - ledge * 2, hiH, RADIUS.control);
    hi.fillColor = tint(bodyTok, 0.55);
    hi.fill();
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
      iconNode.addComponent(UITransform).setContentSize(iconSize, iconSize);
      const iconSprite = iconNode.addComponent(Sprite);
      iconSprite.spriteFrame = iconFrame;
      iconSprite.sizeMode = Sprite.SizeMode.CUSTOM;
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
  label.color = opts.action.enabled ? color(COLOR.ink) : color(COLOR.muted);
  label.horizontalAlign = Label.HorizontalAlign.CENTER;
  label.verticalAlign = Label.VerticalAlign.CENTER;

  if (onTap && opts.action.enabled) {
    node.on(Node.EventType.TOUCH_END, onTap, node);
  }
  return node;
}
