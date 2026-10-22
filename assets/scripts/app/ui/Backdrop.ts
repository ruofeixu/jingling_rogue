import { Color, Graphics, Node, Sprite, UITransform } from "cc";
import { COLOR, type Rgb } from "../../vendor/jinglingPresentation";
import { UiSkin } from "./UiSkin.ts";

function color(token: Rgb, alpha = 255): Color {
  return new Color(token[0], token[1], token[2], alpha);
}

export interface BackdropOptions {
  readonly width: number;
  readonly height: number;
  /** 背景贴图名（如 bg_lobby / bg_battle / bg_indoor）。缺省或素材缺失时回退纯色。 */
  readonly skin?: string;
}

/**
 * 铺满不透明背景。作为每页宿主的第一个子节点，确保 presentation 页是一个
 * 自足的独立画面，完全遮住背后的任何东西。
 * 有背景贴图时用 Sprite 铺满（cover）；否则回退到 token 的 paper 纯色。
 */
export function makeBackdrop(parent: Node, opts: BackdropOptions): Node {
  const node = new Node("backdrop");
  node.layer = parent.layer;
  parent.addChild(node);
  const w = opts.width;
  const h = opts.height;
  const transform = node.addComponent(UITransform);
  transform.setContentSize(w, h);
  node.setPosition(0, 0, 0);

  const frame = opts.skin ? UiSkin.shared().getFrame(opts.skin) : null;
  if (frame) {
    const sprite = node.addComponent(Sprite);
    sprite.spriteFrame = frame;
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    sprite.type = Sprite.Type.SIMPLE;
    // 铺满 cover：按较大边等比放大到覆盖整屏
    const imgW = frame.rect.width || frame.originalSize.width || w;
    const imgH = frame.rect.height || frame.originalSize.height || h;
    const scale = Math.max(w / imgW, h / imgH);
    transform.setContentSize(imgW * scale, imgH * scale);
  } else {
    // 回退：纯色，尺寸放大 2 倍避免横竖切换露边
    transform.setContentSize(w * 2, h * 2);
    const g = node.addComponent(Graphics);
    g.rect(-w, -h, w * 2, h * 2);
    g.fillColor = color(COLOR.paper);
    g.fill();
  }
  node.setSiblingIndex(0);
  return node;
}
