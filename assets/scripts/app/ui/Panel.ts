import { Color, Graphics, Node, Sprite, UITransform } from "cc";
import { COLOR, SPACE, type Rgb } from "../../vendor/jinglingPresentation";
import { UiSkin } from "./UiSkin.ts";

function color(token: Rgb, alpha = 255): Color {
  return new Color(token[0], token[1], token[2], alpha);
}

/** 面板底色不透明度：255 × 0.85。 */
const PANEL_ALPHA = 217;

export interface PanelOptions {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** 9-slice 皮肤名（见 UiSkin/asset-manifest）。缺省或素材缺失时回退 Graphics 画法。 */
  readonly skin?: string;
  /** 回退画法的底色不透明度（0-255）；缺省用 PANEL_ALPHA。列表底板调低，让行按钮比底板更清楚。 */
  readonly alpha?: number;
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

  // 回退：水墨程序化画法 —— 85% 不透明宣纸底（背景墨色淡淡透出），四角一点淡墨角花，没有均匀灰描边。
  const g = node.addComponent(Graphics);
  g.rect(-opts.width / 2, -opts.height / 2, opts.width, opts.height);
  g.fillColor = color(COLOR.panel, opts.alpha ?? PANEL_ALPHA);
  g.fill();
  drawCornerMarks(g, opts.width, opts.height);
  return node;
}

/** 四角的「L」形墨线，横比竖略粗，像装裱的角花。 */
function drawCornerMarks(g: Graphics, width: number, height: number): void {
  const hw = width / 2;
  const hh = height / 2;
  const arm = Math.min(SPACE.lg, width / 4, height / 4);
  g.strokeColor = color(COLOR.ink, 150);
  g.lineWidth = SPACE.xs / 2;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const cx = sx * hw;
      const cy = sy * hh;
      g.moveTo(cx - sx * arm, cy);
      g.lineTo(cx, cy);
      g.lineTo(cx, cy - sy * arm);
    }
  }
  g.stroke();
}
