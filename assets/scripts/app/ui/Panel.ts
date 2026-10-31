import { Color, Graphics, Node, Sprite, UITransform } from "cc";
import { COLOR, RADIUS, SPACE, type Rgb } from "../../vendor/jinglingPresentation";
import { UiSkin } from "./UiSkin.ts";

function color(token: Rgb, alpha = 255): Color {
  return new Color(token[0], token[1], token[2], alpha);
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
    // 赋 spriteFrame 会把节点重设成贴图原尺寸，CUSTOM 之后再设回面板尺寸。
    transform.setContentSize(opts.width, opts.height);
    return node;
  }

  // 回退：水墨程序化画法 —— 宣纸面板平涂 + 一条淡墨细边。笔触与纸纹由 9-slice 贴图提供（I2b）。
  const hw = opts.width / 2;
  const hh = opts.height / 2;

  const g = node.addComponent(Graphics);
  g.roundRect(-hw, -hh, opts.width, opts.height, RADIUS.panel);
  g.fillColor = color(COLOR.panel);
  g.fill();
  g.strokeColor = color(COLOR.edge);
  g.lineWidth = SPACE.xs / 2;
  g.stroke();
  return node;
}
