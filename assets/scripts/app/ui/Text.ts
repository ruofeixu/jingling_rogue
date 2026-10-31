import { Color, Label, Node, UITransform } from "cc";
import { COLOR, TYPE, type Rgb } from "../../vendor/jinglingPresentation";
import { UiSkin } from "./UiSkin.ts";

const TONES = {
  ink: COLOR.ink,
  muted: COLOR.muted,
  accent: COLOR.accent,
} as const;

export type Tone = keyof typeof TONES;

function color(token: Rgb): Color {
  return new Color(token[0], token[1], token[2], 255);
}

export interface LabelOptions {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly fontSize: number;
  readonly tone?: Tone;
  readonly wrap?: boolean;
  /** 页面大标题：用书法标题字（只含标题用字的子集）。正文不要设。 */
  readonly heading?: boolean;
}

/** U2 文本组件：字号/行高/颜色只来自 token，调用方不传颜色字面量。 */
export function addLabel(parent: Node, opts: LabelOptions): Node {
  const node = new Node("label");
  node.layer = parent.layer;
  parent.addChild(node);
  const transform = node.addComponent(UITransform);
  transform.setContentSize(opts.width, opts.fontSize * TYPE.lineHeightRatio);
  node.setPosition(opts.x, opts.y, 0);

  const label = node.addComponent(Label);
  label.string = opts.text;
  label.fontSize = opts.fontSize;
  label.lineHeight = opts.fontSize * TYPE.lineHeightRatio;
  label.color = color(TONES[opts.tone ?? "ink"]);
  label.horizontalAlign = Label.HorizontalAlign.CENTER;
  label.verticalAlign = Label.VerticalAlign.CENTER;
  label.overflow = opts.wrap ? Label.Overflow.RESIZE_HEIGHT : Label.Overflow.NONE;
  const font = opts.heading ? UiSkin.shared().getTitleFont() : null;
  if (font) {
    label.useSystemFont = false;
    label.font = font;
  } else {
    // 没有书法字（未加载、加载失败或不是标题）时用系统字体，不留空白。
    label.useSystemFont = true;
  }
  return node;
}
