import { Color, Graphics, Node, Sprite, UITransform } from "cc";
import { COLOR, RADIUS, SPACE, type Rgb } from "../../vendor/jinglingPresentation";
import { UiSkin } from "./UiSkin.ts";

function color(token: Rgb, alpha = 255): Color {
  return new Color(token[0], token[1], token[2], alpha);
}

function shade(token: Rgb, f: number): Color {
  return new Color(Math.round(token[0] * f), Math.round(token[1] * f), Math.round(token[2] * f), 255);
}

function tint(token: Rgb, f: number): Color {
  const mix = (c: number) => Math.round(c + (255 - c) * f);
  return new Color(mix(token[0]), mix(token[1]), mix(token[2]), 255);
}

export interface PanelOptions {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** 9-slice 皮肤名（见 UiSkin/asset-manifest）。缺省或素材缺失时回退 Graphics 画法。 */
  readonly skin?: string;
}

/**
 * 最小面板。有 UI 贴图皮肤时用 9-slice Sprite；否则回退到 token 驱动的 Graphics 画法，
 * 与素材接入前的效果保持一致。底色、圆角、描边全部来自 token。
 */
export function makePanel(parent: Node, opts: PanelOptions): Node {
  const node = new Node(`panel-${opts.name}`);
  node.layer = parent.layer;
  parent.addChild(node);
  const transform = node.addComponent(UITransform);
  transform.setContentSize(opts.width, opts.height);
  node.setPosition(opts.x, opts.y, 0);

  const skinName = opts.skin ?? "panel_cream";
  const frame = UiSkin.shared().getFrame(skinName);
  if (frame) {
    const sprite = node.addComponent(Sprite);
    sprite.spriteFrame = frame;
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    UiSkin.shared().applySlice(sprite, skinName);
    return node;
  }

  // 回退：程序化厚涂质感 —— 底部立体厚边 + 奶白主体 + 顶部高光条 + 厚描边。
  const hw = opts.width / 2;
  const hh = opts.height / 2;
  const ledge = SPACE.xs + 2;

  const shadow = node.addComponent(Graphics);
  shadow.roundRect(-hw, -hh - ledge, opts.width, opts.height, RADIUS.panel);
  shadow.fillColor = shade(COLOR.edge, 0.7);
  shadow.fill();

  const g = node.addComponent(Graphics);
  g.roundRect(-hw, -hh, opts.width, opts.height, RADIUS.panel);
  g.fillColor = color(COLOR.panel);
  g.fill();
  g.strokeColor = color(COLOR.edge);
  g.lineWidth = SPACE.xs;
  g.stroke();

  const hi = node.addComponent(Graphics);
  const hiH = Math.min(opts.height * 0.3, SPACE.xl);
  hi.roundRect(-hw + ledge, hh - hiH - ledge, opts.width - ledge * 2, hiH, RADIUS.panel);
  hi.fillColor = tint(COLOR.panel, 0.6);
  hi.fill();
  return node;
}
