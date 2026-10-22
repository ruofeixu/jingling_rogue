import { Color, Graphics, Label, Node, UIOpacity, UITransform, Vec3, tween } from "cc";
import { AFFINITY_CN, CATCH_FX, HIT_FX, THEME, catchFxDuration, affinityInk, nameplateSlots, type Affinity, type ItemIconId, type PortraitStyle } from "../vendor/jinglingCore";
import { attachPortraitSprite, hasPortrait } from "./portrait";

function rgb(channels: readonly number[], alpha = 255): Color {
  return new Color(channels[0], channels[1], channels[2], alpha);
}

export const PAPER = rgb(THEME.paper);
export const FIELD = rgb(THEME.field);
export const PANEL = rgb(THEME.panel);
export const PANEL_EDGE = rgb(THEME.edge);
export const INK = rgb(THEME.ink);
export const GOLD = rgb(THEME.accent);
export const SLIP = new Color(255, 236, 214, 255);
export const MUTED = new Color(80, 70, 62, 255);
export const HP_BACK = new Color(208, 192, 180, 255);
export const HP_FILL = new Color(88, 196, 92, 255);
export const HP_LOW = new Color(220, 72, 64, 255);
export const HP_MID = new Color(220, 148, 28, 255);

export function paintRect(
  parent: Node,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Color,
  radius = 10,
): Node {
  const node = new Node(name);
  node.layer = parent.layer;
  parent.addChild(node);
  node.setPosition(x, y);
  const transform = node.addComponent(UITransform);
  transform.setContentSize(w, h);
  const g = node.addComponent(Graphics);
  g.fillColor = color;
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.fill();
  return node;
}

export function paintWindow(
  parent: Node,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 16,
  fill: Color = PANEL,
): Node {
  const corner = Math.max(16, radius);
  const node = paintRect(parent, name, x, y, w, h, fill, corner);
  const g = node.getComponent(Graphics);
  if (g) {
    g.lineWidth = 4;
    g.strokeColor = PANEL_EDGE;
    g.roundRect(-w / 2, -h / 2, w, h, corner);
    g.stroke();
    g.lineWidth = 2;
    g.strokeColor = new Color(255, 255, 255, 90);
    g.roundRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, Math.max(12, corner - 4));
    g.stroke();
  }
  return node;
}

export function paintBackdrop(parent: Node, kind: "portrait" | "landscape" = "portrait"): Node {
  const wide = kind === "landscape";
  const w = wide ? 1600 : 900;
  const h = wide ? 900 : 1500;
  const root = paintRect(parent, "paper", 0, 0, w, h, PAPER, 0);
  const g = root.getComponent(Graphics);
  if (g) {
    g.fillColor = PAPER;
    g.rect(-w / 2, wide ? 40 : 120, w, wide ? 380 : 640);
    g.fill();
    g.fillColor = FIELD;
    g.rect(-w / 2, wide ? -320 : -420, w, wide ? 380 : 560);
    g.fill();
    g.fillColor = rgb(THEME.field, 180);
    g.ellipse(wide ? 160 : 90, wide ? 40 : 96, wide ? 280 : 220, 42);
    g.fill();
    g.ellipse(wide ? -180 : -96, wide ? -80 : -118, wide ? 300 : 240, 48);
    g.fill();
    g.fillColor = rgb(THEME.accent);
    g.roundRect(wide ? -520 : -330, wide ? 8 : 40, 36, wide ? 140 : 220, 16);
    g.fill();
    g.circle(wide ? -502 : -312, wide ? 140 : 250, wide ? 40 : 54);
    g.fill();
  }
  return root;
}

export function addText(
  parent: Node,
  name: string,
  text: string,
  x: number,
  y: number,
  w: number,
  fontSize: number,
  color: Color,
  opts?: { wrap?: boolean; height?: number; align?: "left" | "center" },
): Label {
  const wrap = opts?.wrap ?? false;
  const height = opts?.height ?? (wrap ? 104 : fontSize + 14);
  const node = new Node(name);
  node.layer = parent.layer;
  parent.addChild(node);
  node.setPosition(x, y);
  const transform = node.addComponent(UITransform);
  transform.setContentSize(w, height);
  const label = node.addComponent(Label);
  label.string = text;
  label.fontSize = fontSize;
  label.lineHeight = fontSize + 10;
  label.color = color;
  label.overflow = wrap ? Label.Overflow.CLAMP : Label.Overflow.SHRINK;
  label.enableWrapText = wrap;
  label.useSystemFont = true;
  label.horizontalAlign = opts?.align === "left" ? Label.HorizontalAlign.LEFT : Label.HorizontalAlign.CENTER;
  label.verticalAlign = Label.VerticalAlign.CENTER;
  return label;
}

export function paintPortrait(
  parent: Node,
  name: string,
  affinity: Affinity,
  x: number,
  y: number,
  width: number,
  height: number,
  showName = false,
  spiritId?: string,
  style: PortraitStyle = "play",
): Node {
  const ink = affinityInk(affinity);
  const fill = new Color(ink.r, ink.g, ink.b, 255);
  const root = new Node(`portrait-${name}`);
  root.layer = parent.layer;
  parent.addChild(root);
  root.setPosition(x, y);
  const transform = root.addComponent(UITransform);
  transform.setContentSize(width, height);
  const g = root.addComponent(Graphics);
  const drawBody = () => {
    g.fillColor = fill;
    g.strokeColor = PANEL_EDGE;
    g.lineWidth = 4;
    g.roundRect(-width * 0.18, -height * 0.28, width * 0.36, height * 0.48, 16);
    g.fill();
    g.roundRect(-width * 0.18, -height * 0.28, width * 0.36, height * 0.48, 16);
    g.stroke();
    g.circle(0, height * 0.16, width * 0.15);
    g.fill();
    g.circle(0, height * 0.16, width * 0.15);
    g.stroke();
    g.fillColor = new Color(255, 255, 255, 90);
    g.circle(-width * 0.05, height * 0.2, width * 0.07);
    g.fill();
  };
  if (hasPortrait(spiritId)) {
    attachPortraitSprite(root, spiritId, width, height, drawBody, style);
  } else {
    drawBody();
  }
  if (showName) {
    addText(root, "name", name, 0, -height / 2 + 18, width - 8, 20, INK);
  }
  return root;
}

export function paintHpBar(
  parent: Node,
  x: number,
  y: number,
  hp: number,
  maxHp: number,
  width = 220,
): Node {
  const h = 14;
  const root = paintRect(parent, "hp", x, y, width, h, HP_BACK, 8);
  const ratio = maxHp <= 0 ? 0 : Math.max(0, Math.min(1, hp / maxHp));
  const fillW = Math.max(4, (width - 6) * ratio);
  const fill = new Node("fill");
  fill.layer = parent.layer;
  root.addChild(fill);
  fill.setPosition((fillW - (width - 6)) / 2, 0);
  const transform = fill.addComponent(UITransform);
  transform.setContentSize(fillW, h - 6);
  const g = fill.addComponent(Graphics);
  g.fillColor = ratio > 0.5 ? HP_FILL : ratio > 0.2 ? HP_MID : HP_LOW;
  g.roundRect(-fillW / 2, -(h - 6) / 2, fillW, h - 6, 6);
  g.fill();
  return root;
}

export function paintNameplate(
  parent: Node,
  opts: {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    affinity: Affinity;
    x: number;
    y: number;
    width: number;
    height: number;
  },
): Node {
  const root = paintWindow(parent, `plate-${opts.name}`, opts.x, opts.y, opts.width, opts.height, 16);
  const slots = nameplateSlots(opts.width, opts.height);
  addText(root, "aff", AFFINITY_CN[opts.affinity], slots.aff.x, slots.aff.y, slots.aff.w, 18, INK, {
    height: slots.aff.h,
  });
  addText(root, "nm", opts.name, slots.name.x, slots.name.y, slots.name.w, 20, INK, {
    align: "left",
    height: slots.name.h,
  });
  addText(root, "lv", `Lv${opts.level}`, slots.lv.x, slots.lv.y, slots.lv.w, 18, INK, { height: slots.lv.h });
  paintHpBar(root, slots.bar.x, slots.bar.y, opts.hp, opts.maxHp, slots.bar.w);
  addText(root, "hp", `${opts.hp}/${opts.maxHp}`, slots.hp.x, slots.hp.y, slots.hp.w, 16, INK, {
    height: slots.hp.h,
  });
  return root;
}

export function paintPartyTray(
  parent: Node,
  party: { hp: number }[],
  activeIndex: number,
  x: number,
  y: number,
): Node {
  const root = new Node("party-tray");
  root.layer = parent.layer;
  parent.addChild(root);
  root.setPosition(x, y);
  const g = root.addComponent(Graphics);
  const count = Math.max(party.length, 6);
  for (let index = 0; index < count; index++) {
    const member = party[index];
    const cx = (index - (count - 1) / 2) * 26;
    g.fillColor = !member
      ? PAPER
      : member.hp <= 0
        ? new Color(236, 180, 176, 255)
        : index === activeIndex
          ? GOLD
          : MUTED;
    g.circle(cx, 0, 9);
    g.fill();
    g.lineWidth = 3;
    g.strokeColor = PANEL_EDGE;
    g.circle(cx, 0, 9);
    g.stroke();
  }
  return root;
}

export function paintSplash(parent: Node, y = 430): Node {
  const root = new Node("splash");
  root.layer = parent.layer;
  parent.addChild(root);
  root.setPosition(0, y);
  addText(root, "title", "契灵志怪", 0, 36, 680, 58, INK);
  addText(root, "sub", "精怪肉鸽", 0, -28, 400, 28, INK);
  return root;
}

export function paintFloatNum(parent: Node, text: string, x: number, y: number, heal = false): Node {
  const color = heal ? HP_FILL : HP_LOW;
  const label = addText(parent, "float", text, x, y, 120, 30, color);
  const node = label.node;
  tween(node)
    .to(0.55, { position: new Vec3(x, y + 64, 0) })
    .call(() => {
      if (node.isValid) {
        node.destroy();
      }
    })
    .start();
  return node;
}

export function flashNode(node: Node): void {
  let opacity = node.getComponent(UIOpacity);
  if (!opacity) {
    opacity = node.addComponent(UIOpacity);
  }
  tween(opacity)
    .to(HIT_FX.flashDim, { opacity: 70 })
    .to(HIT_FX.flashEnd - HIT_FX.flashDim, { opacity: 255 })
    .start();
}

export function lungeNode(node: Node, towardFoe: boolean): void {
  const dx = towardFoe ? 40 : -40;
  const dy = towardFoe ? 28 : -28;
  const { x, y } = node.position;
  tween(node)
    .to(HIT_FX.lungeOut, { position: new Vec3(x + dx, y + dy, 0) })
    .to(HIT_FX.lungeBack, { position: new Vec3(x, y, 0) })
    .start();
}

export function shakeNode(node: Node): void {
  const { x, y } = node.position;
  tween(node)
    .to(0.05, { position: new Vec3(x + 12, y, 0) })
    .to(0.05, { position: new Vec3(x - 14, y, 0) })
    .to(0.05, { position: new Vec3(x + 9, y, 0) })
    .to(0.05, { position: new Vec3(x, y, 0) })
    .start();
}

const ICON_FILL: Record<ItemIconId, Color> = {
  potion: new Color(88, 168, 92, 255),
  candy: new Color(220, 96, 112, 255),
  gold: GOLD,
  egg: new Color(232, 212, 164, 255),
  charm: new Color(168, 132, 212, 255),
  atk: new Color(196, 72, 48, 255),
  def: new Color(140, 108, 72, 255),
  spd: new Color(196, 164, 48, 255),
  hp: new Color(88, 196, 92, 255),
  exp: new Color(96, 148, 196, 255),
  catch: new Color(196, 96, 64, 255),
  map: new Color(72, 140, 108, 255),
  lure: new Color(168, 112, 176, 255),
  "seal-fan": new Color(168, 140, 96, 255),
  "seal-shang": new Color(176, 120, 64, 255),
  "seal-te": new Color(196, 72, 56, 255),
  "seal-qi": new Color(88, 156, 128, 255),
  "seal-jie": new Color(148, 116, 196, 255),
};

export function paintItemIcon(
  parent: Node,
  name: string,
  kind: ItemIconId,
  x: number,
  y: number,
  size = 36,
): Node {
  const node = new Node(name);
  node.layer = parent.layer;
  parent.addChild(node);
  node.setPosition(x, y);
  node.addComponent(UITransform).setContentSize(size, size);
  const g = node.addComponent(Graphics);
  const fill = ICON_FILL[kind];
  const r = size / 2;
  g.fillColor = PAPER;
  g.circle(0, 0, r);
  g.fill();
  g.fillColor = fill;
  if (kind === "potion") {
    g.roundRect(-r * 0.28, -r * 0.42, r * 0.56, r * 0.72, 6);
    g.fill();
    g.roundRect(-r * 0.16, r * 0.18, r * 0.32, r * 0.28, 4);
    g.fill();
  } else if (kind.startsWith("seal-")) {
    g.roundRect(-r * 0.42, -r * 0.42, r * 0.84, r * 0.84, 10);
    g.fill();
    g.strokeColor = PANEL_EDGE;
    g.lineWidth = 3;
    g.roundRect(-r * 0.28, -r * 0.28, r * 0.56, r * 0.56, 6);
    g.stroke();
  } else if (kind === "gold") {
    g.circle(0, 0, r * 0.62);
    g.fill();
  } else if (kind === "egg") {
    g.ellipse(0, 0, r * 0.42, r * 0.58);
    g.fill();
  } else if (kind === "candy") {
    g.circle(-r * 0.18, 0, r * 0.28);
    g.fill();
    g.circle(r * 0.2, r * 0.08, r * 0.22);
    g.fill();
  } else {
    g.circle(0, 0, r * 0.55);
    g.fill();
    g.fillColor = PANEL_EDGE;
    g.circle(0, 0, r * 0.18);
    g.fill();
  }
  return node;
}

export function playCatchFx(
  parent: Node,
  foe: Node,
  from: { x: number; y: number },
  to: { x: number; y: number },
  caught: boolean,
  icon: ItemIconId,
  onDone: () => void,
): void {
  const token = paintItemIcon(parent, "catch-token", icon, from.x, from.y, 52);
  tween(token)
    .to(CATCH_FX.throwEnd, { position: new Vec3(to.x, to.y, 0) })
    .call(() => shakeNode(foe))
    .delay(CATCH_FX.wobbleEnd - CATCH_FX.throwEnd)
    .call(() => {
      if (caught) {
        tween(foe).to(0.26, { scale: new Vec3(0.08, 0.08, 1) }).start();
        tween(token).to(0.26, { scale: new Vec3(1.25, 1.25, 1) }).start();
      } else {
        flashNode(foe);
        tween(token).to(0.2, { scale: new Vec3(0, 0, 1) }).start();
      }
    })
    .delay(catchFxDuration() - CATCH_FX.wobbleEnd)
    .call(() => {
      if (token.isValid) {
        token.destroy();
      }
      onDone();
    })
    .start();
}

