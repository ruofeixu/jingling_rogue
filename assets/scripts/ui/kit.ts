import { Button, Color, Graphics, Label, Node, UITransform } from "cc";
import { GOLD, INK, MUTED, PANEL, SLIP, addText, paintItemIcon, paintPortrait, paintRect, paintWindow } from "./paint";
import { affinityInk, cardCaptionSlots, codexThumbCaption, formatArtSlip, type Affinity, type ItemIconId } from "../vendor/jinglingCore";

export function makeLabel(
  parent: Node,
  name: string,
  text: string,
  y: number,
  fontSize: number,
  opts?: { wrap?: boolean; height?: number; x?: number; width?: number },
): Label {
  return addText(parent, name, text, opts?.x ?? 0, y, opts?.width ?? 680, fontSize, INK, {
    wrap: opts?.wrap,
    height: opts?.height,
  });
}

export function makeSlipButton(
  parent: Node,
  text: string,
  x: number,
  y: number,
  onClick: () => void,
  host: object,
  width = 200,
  height = 64,
  icon?: ItemIconId,
  accent = false,
): Node {
  const node = paintWindow(parent, `slip-${text}`, x, y, width, height, 16, accent ? GOLD : SLIP);
  if (icon) {
    paintItemIcon(node, "icon", icon, -width / 2 + 26, 0, 32);
    addText(node, "label", text, 16, 0, width - 58, 24, INK);
  } else {
    addText(node, "label", text, 0, 0, width - 16, 26, INK);
  }
  bindClick(coverHit(node, width, height), onClick, host, node);
  return node;
}

export function makeTextButton(
  parent: Node,
  text: string,
  x: number,
  y: number,
  onClick: () => void,
  host: object,
): Node {
  return makeSlipButton(parent, text, x, y, onClick, host);
}

export function makeArtSlip(
  parent: Node,
  opts: {
    name: string;
    affinity: Affinity;
    left: number;
    max: number;
    x: number;
    y: number;
    width: number;
    height: number;
    hint?: string;
  },
  onClick: () => void,
  host: object,
): Node {
  const copy = formatArtSlip(opts.name, opts.affinity, opts.left, opts.max);
  const node = paintWindow(parent, `art-${opts.name}`, opts.x, opts.y, opts.width, opts.height, 16);
  const stripe = new Node("stripe");
  stripe.layer = parent.layer;
  node.addChild(stripe);
  stripe.setPosition(-opts.width / 2 + 10, 0);
  const transform = stripe.addComponent(UITransform);
  transform.setContentSize(10, opts.height - 16);
  const g = stripe.addComponent(Graphics);
  const ink = affinityInk(opts.affinity);
  g.fillColor = new Color(ink.r, ink.g, ink.b, 255);
  g.roundRect(-5, -(opts.height - 16) / 2, 10, opts.height - 16, 6);
  g.fill();
  addText(node, "title", copy.title, 8, 16, opts.width - 28, 22, INK);
  addText(node, "meta", opts.hint ? `${copy.meta}  ${opts.hint}` : copy.meta, 8, -14, opts.width - 28, 16, MUTED);
  bindClick(coverHit(node, opts.width, opts.height), onClick, host, node);
  return node;
}

export function makeSpiritCard(
  parent: Node,
  opts: {
    id: string;
    name: string;
    affinity: Affinity;
    x: number;
    y: number;
    width?: number;
    height?: number;
  },
  onClick: () => void,
  host: object,
): Node {
  const width = opts.width ?? 210;
  const height = opts.height ?? 300;
  const node = paintWindow(parent, `card-${opts.name}`, opts.x, opts.y, width, height, 16);
  const captions = cardCaptionSlots(height);
  paintPortrait(node, opts.name, opts.affinity, 0, 36, Math.min(140, width - 40), Math.min(180, height - 120), false, opts.id);
  addText(node, "title", opts.name, 0, captions.title.y, width - 24, 20, INK, { height: captions.title.h });
  addText(node, "hint", "点选开局", 0, captions.hint.y, width - 30, 14, MUTED, { height: captions.hint.h });
  bindClick(coverHit(node, width, height), onClick, host, node);
  return node;
}

export function makeBoonCard(
  parent: Node,
  opts: {
    name: string;
    kind?: string;
    icon?: ItemIconId;
    hint?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  },
  onClick: () => void,
  host: object,
): Node {
  const width = opts.width ?? 220;
  const height = opts.height ?? 250;
  const node = paintWindow(parent, `boon-${opts.name}`, opts.x, opts.y, width, height, 16);
  paintItemIcon(node, "gem", opts.icon ?? "charm", 0, height / 2 - 56, 56);
  addText(node, "kind", opts.kind ?? "", 0, height / 2 - 88, 80, 16, INK);
  addText(node, "title", opts.name, 0, 8, width - 20, 24, INK);
  addText(node, "hint", opts.hint ?? "点选带走", 0, -height / 2 + 56, width - 24, 18, MUTED, {
    wrap: true,
    height: 72,
  });
  bindClick(coverHit(node, width, height), onClick, host, node);
  return node;
}

export function makeCodexThumb(
  parent: Node,
  opts: {
    id: string;
    name: string;
    affinity: Affinity;
    x: number;
    y: number;
    width: number;
    height: number;
  },
  onClick: () => void,
  host: object,
): Node {
  const node = paintWindow(parent, `codex-${opts.name}`, opts.x, opts.y, opts.width, opts.height, 16);
  paintPortrait(
    node,
    opts.name,
    opts.affinity,
    0,
    -6,
    opts.width - 16,
    opts.height - 28,
    false,
    opts.id,
  );
  const caption = codexThumbCaption(opts.height);
  paintRect(node, "caption", 0, caption.y, opts.width - 16, caption.h, PANEL, 8);
  addText(node, "title", opts.name, 0, caption.y, opts.width - 16, 18, INK, { height: caption.h });
  bindClick(coverHit(node, opts.width, opts.height), onClick, host, node);
  return node;
}

export function makeHelpButton(
  parent: Node,
  x: number,
  y: number,
  onClick: () => void,
  host: object,
): Node {
  const node = paintWindow(parent, "help", x, y, 56, 56, 28);
  addText(node, "q", "?", 0, 0, 40, 30, INK);
  bindClick(coverHit(node, 56, 56), onClick, host, node);
  return node;
}

function coverHit(parent: Node, width: number, height: number): Node {
  const hit = new Node("hit");
  hit.layer = parent.layer;
  parent.addChild(hit);
  hit.addComponent(UITransform).setContentSize(width, height);
  return hit;
}

function bindClick(node: Node, onClick: () => void, host: object, visual = node): void {
  const button = node.addComponent(Button);
  button.target = visual;
  button.transition = Button.Transition.SCALE;
  button.zoomScale = 0.96;
  node.on(Button.EventType.CLICK, onClick, host);
}
