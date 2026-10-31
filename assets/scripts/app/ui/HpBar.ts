import { Color, Graphics, Node, UITransform } from "cc";
import { COLOR, HP_COLOR, RADIUS, SPACE, type Rgb } from "../../vendor/jinglingPresentation";

export type HpBarTone = "ally" | "foe" | "low";

export interface HpBarOptions {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly ratio: number;
  readonly tone: HpBarTone;
}

export interface HpBarHandle {
  readonly node: Node;
  setRatio(ratio: number, tone: HpBarTone): void;
}

function color(token: Rgb, alpha = 255): Color {
  return new Color(token[0], token[1], token[2], alpha);
}

function tint(token: Rgb, towardWhite: number): Color {
  const mix = (channel: number) => Math.round(channel + (255 - channel) * towardWhite);
  return new Color(mix(token[0]), mix(token[1]), mix(token[2]), 255);
}

/**
 * 血条。槽是固定的，填充宽度 = 比例 × (槽宽 - 4)，左对齐。
 * setRatio 只改填充，供缓降动画逐帧调用。
 */
export function makeHpBar(parent: Node, opts: HpBarOptions): HpBarHandle {
  const node = new Node("hp-bar");
  node.layer = parent.layer;
  parent.addChild(node);
  node.addComponent(UITransform).setContentSize(opts.width, opts.height);
  node.setPosition(opts.x, opts.y, 0);

  const track = node.addComponent(Graphics);
  const halfW = opts.width / 2;
  const halfH = opts.height / 2;
  const radius = Math.min(RADIUS.control, halfH);
  track.roundRect(-halfW, -halfH, opts.width, opts.height, radius);
  track.fillColor = color(HP_COLOR.track);
  track.fill();
  track.strokeColor = color(COLOR.edge);
  track.lineWidth = SPACE.xs / 2;
  track.stroke();

  const fillNode = new Node("fill");
  fillNode.layer = parent.layer;
  node.addChild(fillNode);
  fillNode.addComponent(UITransform);
  const fill = fillNode.addComponent(Graphics);
  const highlight = fillNode.addComponent(Graphics);

  // Graphics 每次 clear + 重绘都会重建网格，且不参与合批。
  // 按整像素宽度和色调去重，宽度没变就不重画。
  let paintedW = -1;
  let paintedTone: HpBarTone | null = null;

  const paint = (ratio: number, tone: HpBarTone) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    const inset = SPACE.xs / 2;
    const innerW = Math.max(0, Math.round((opts.width - SPACE.xs) * clamped));
    const innerH = opts.height - SPACE.xs;
    if (innerW === paintedW && tone === paintedTone) {
      return;
    }
    paintedW = innerW;
    paintedTone = tone;
    fill.clear();
    highlight.clear();
    if (innerW <= 0 || innerH <= 0) {
      return;
    }
    const x = -halfW + inset;
    const y = -innerH / 2;
    const fillRadius = Math.min(radius, innerH / 2, innerW / 2);
    fill.roundRect(x, y, innerW, innerH, fillRadius);
    fill.fillColor = color(HP_COLOR[tone]);
    fill.fill();
    const hiH = innerH * 0.35;
    highlight.roundRect(x, y + innerH - hiH, innerW, hiH, fillRadius);
    highlight.fillColor = tint(HP_COLOR[tone], 0.45);
    highlight.fill();
  };

  paint(opts.ratio, opts.tone);
  return {
    node,
    setRatio(ratio, tone) {
      paint(ratio, tone);
    },
  };
}
