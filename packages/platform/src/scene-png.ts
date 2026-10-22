import { existsSync } from "node:fs";
import { GlobalFonts, createCanvas, type Canvas, type SKRSContext2D } from "@napi-rs/canvas";
import {
  THEME,
  affinityInk,
  iconFill,
  type BarCmd,
  type DrawCmd,
  type DrawTone,
  type IconCmd,
  type ItemIconId,
  type PortraitCmd,
  type ScreenKind,
  type ScreenLayout,
  type TextCmd,
  type WindowCmd,
} from "@jingling/core";

const CJK_FONTS = [
  "/System/Library/Fonts/PingFang.ttc",
  "/System/Library/Fonts/Hiragino Sans GB.ttc",
  "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
  "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
];

let family = "sans-serif";
let fontReady = false;

function ensureFont(): void {
  if (fontReady) {
    return;
  }
  fontReady = true;
  for (const path of CJK_FONTS) {
    if (existsSync(path) && GlobalFonts.registerFromPath(path, "SceneUI")) {
      family = "SceneUI";
      return;
    }
  }
}

function css(rgb: readonly number[], alpha = 255): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha / 255})`;
}

function tone(id: DrawTone): readonly number[] {
  return THEME[id];
}

/** Draw commands use layout space: centre origin, y up. Canvas is top-left, y down. */
function projector(ui: ScreenLayout) {
  const cx = ui.view.width / 2;
  const cy = ui.view.height / 2;
  return {
    x: (x: number) => cx + x,
    y: (y: number) => cy - y,
  };
}

function roundRectPath(
  ctx: SKRSContext2D,
  left: number,
  top: number,
  w: number,
  h: number,
  radius: number,
): void {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(left + r, top);
  ctx.arcTo(left + w, top, left + w, top + h, r);
  ctx.arcTo(left + w, top + h, left, top + h, r);
  ctx.arcTo(left, top + h, left, top, r);
  ctx.arcTo(left, top, left + w, top, r);
  ctx.closePath();
}

function ellipse(ctx: SKRSContext2D, x: number, y: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.closePath();
}

function drawBackdrop(ctx: SKRSContext2D, ui: ScreenLayout, kind: ScreenKind): void {
  const to = projector(ui);
  const wide = kind === "landscape";
  const horizon = to.y(ui.horizonY);
  ctx.fillStyle = css(THEME.paper);
  ctx.fillRect(0, 0, ui.view.width, ui.view.height);
  ctx.fillStyle = css(THEME.field);
  ctx.fillRect(0, horizon, ui.view.width, ui.view.height - horizon);
  ctx.fillStyle = css(THEME.fieldDeep);
  for (const mound of wide
    ? [
        { x: 300, rx: 340, ry: 54 },
        { x: -360, rx: 300, ry: 44 },
      ]
    : [
        { x: 150, rx: 260, ry: 52 },
        { x: -190, rx: 230, ry: 40 },
      ]) {
    ellipse(ctx, to.x(mound.x), horizon, mound.rx, mound.ry);
    ctx.fill();
  }
  ctx.fillStyle = css(THEME.field);
  ctx.fillRect(0, horizon + 2, ui.view.width, ui.view.height - horizon);
}

function drawWindow(ctx: SKRSContext2D, ui: ScreenLayout, cmd: WindowCmd): void {
  const to = projector(ui);
  const left = to.x(cmd.x - cmd.w / 2);
  const top = to.y(cmd.y + cmd.h / 2);
  const corner = Math.max(16, cmd.radius);
  ctx.fillStyle = css(tone(cmd.tone));
  roundRectPath(ctx, left, top, cmd.w, cmd.h, corner);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = css(THEME.edge);
  roundRectPath(ctx, left, top, cmd.w, cmd.h, corner);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.353)";
  roundRectPath(ctx, left + 5, top + 5, cmd.w - 10, cmd.h - 10, Math.max(12, corner - 4));
  ctx.stroke();
}

function wrapLines(ctx: SKRSContext2D, text: string, width: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const glyph of [...para]) {
      const next = line + glyph;
      if (line && ctx.measureText(next).width > width) {
        out.push(line);
        line = glyph;
      } else {
        line = next;
      }
    }
    out.push(line);
  }
  return out;
}

function drawText(ctx: SKRSContext2D, ui: ScreenLayout, cmd: TextCmd): void {
  const to = projector(ui);
  ctx.fillStyle = css(tone(cmd.tone));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = to.x(cmd.x);
  const cy = to.y(cmd.y);
  if (!cmd.wrap) {
    let size = cmd.size;
    ctx.font = `${size}px "${family}"`;
    while (size > 10 && ctx.measureText(cmd.text).width > cmd.w) {
      size -= 1;
      ctx.font = `${size}px "${family}"`;
    }
    ctx.fillText(cmd.text, cx, cy);
    return;
  }
  ctx.font = `${cmd.size}px "${family}"`;
  const lineH = cmd.size + 10;
  const lines = wrapLines(ctx, cmd.text, cmd.w).slice(0, Math.max(1, Math.floor(cmd.h / lineH)));
  const top = cy - (lines.length * lineH) / 2 + lineH / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, cx, top + index * lineH);
  });
}

function drawIcon(ctx: SKRSContext2D, ui: ScreenLayout, cmd: IconCmd): void {
  const to = projector(ui);
  const cx = to.x(cmd.x);
  const cy = to.y(cmd.y);
  const r = cmd.size / 2;
  ctx.fillStyle = css(THEME.paper);
  ellipse(ctx, cx, cy, r, r);
  ctx.fill();
  ctx.fillStyle = css(iconFill(cmd.icon));
  paintGlyph(ctx, cmd.icon, cx, cy, r);
}

function paintGlyph(
  ctx: SKRSContext2D,
  kind: ItemIconId,
  cx: number,
  cy: number,
  r: number,
): void {
  if (kind === "potion") {
    roundRectPath(ctx, cx - r * 0.28, cy - r * 0.3, r * 0.56, r * 0.72, 6);
    ctx.fill();
    roundRectPath(ctx, cx - r * 0.16, cy - r * 0.46, r * 0.32, r * 0.28, 4);
    ctx.fill();
    return;
  }
  if (kind.startsWith("seal-")) {
    roundRectPath(ctx, cx - r * 0.42, cy - r * 0.42, r * 0.84, r * 0.84, 10);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = css(THEME.edge);
    roundRectPath(ctx, cx - r * 0.28, cy - r * 0.28, r * 0.56, r * 0.56, 6);
    ctx.stroke();
    return;
  }
  if (kind === "gold") {
    ellipse(ctx, cx, cy, r * 0.62, r * 0.62);
    ctx.fill();
    return;
  }
  if (kind === "egg") {
    ellipse(ctx, cx, cy, r * 0.42, r * 0.58);
    ctx.fill();
    return;
  }
  if (kind === "candy") {
    ellipse(ctx, cx - r * 0.18, cy, r * 0.28, r * 0.28);
    ctx.fill();
    ellipse(ctx, cx + r * 0.2, cy - r * 0.08, r * 0.22, r * 0.22);
    ctx.fill();
    return;
  }
  if (kind === "atk") {
    polygon(ctx, [
      [cx, cy - r * 0.62],
      [cx + r * 0.5, cy + r * 0.5],
      [cx - r * 0.5, cy + r * 0.5],
    ]);
    return;
  }
  if (kind === "map") {
    polygon(ctx, [
      [cx, cy - r * 0.6],
      [cx + r * 0.6, cy],
      [cx, cy + r * 0.6],
      [cx - r * 0.6, cy],
    ]);
    return;
  }
  if (kind === "spd") {
    polygon(ctx, [
      [cx - r * 0.5, cy - r * 0.55],
      [cx + r * 0.55, cy],
      [cx - r * 0.5, cy + r * 0.55],
      [cx - r * 0.16, cy],
    ]);
    return;
  }
  if (kind === "def") {
    polygon(ctx, [
      [cx - r * 0.5, cy - r * 0.55],
      [cx + r * 0.5, cy - r * 0.55],
      [cx + r * 0.5, cy + r * 0.1],
      [cx, cy + r * 0.62],
      [cx - r * 0.5, cy + r * 0.1],
    ]);
    return;
  }
  if (kind === "hp") {
    const arm = r * 0.2;
    const reach = r * 0.6;
    polygon(ctx, [
      [cx - arm, cy - reach],
      [cx + arm, cy - reach],
      [cx + arm, cy - arm],
      [cx + reach, cy - arm],
      [cx + reach, cy + arm],
      [cx + arm, cy + arm],
      [cx + arm, cy + reach],
      [cx - arm, cy + reach],
      [cx - arm, cy + arm],
      [cx - reach, cy + arm],
      [cx - reach, cy - arm],
      [cx - arm, cy - arm],
    ]);
    return;
  }
  if (kind === "exp") {
    const points: [number, number][] = [];
    for (let i = 0; i < 10; i += 1) {
      const reach = i % 2 === 0 ? r * 0.66 : r * 0.28;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      points.push([cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach]);
    }
    polygon(ctx, points);
    return;
  }
  if (kind === "catch") {
    ctx.lineWidth = r * 0.28;
    ctx.strokeStyle = ctx.fillStyle;
    ellipse(ctx, cx, cy, r * 0.46, r * 0.46);
    ctx.stroke();
    return;
  }
  if (kind === "lure") {
    ellipse(ctx, cx, cy + r * 0.14, r * 0.42, r * 0.42);
    ctx.fill();
    polygon(ctx, [
      [cx, cy - r * 0.66],
      [cx + r * 0.34, cy + r * 0.14],
      [cx - r * 0.34, cy + r * 0.14],
    ]);
    return;
  }
  ellipse(ctx, cx, cy, r * 0.55, r * 0.55);
  ctx.fill();
}

function polygon(ctx: SKRSContext2D, points: [number, number][]): void {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  ctx.fill();
}

function drawPortrait(ctx: SKRSContext2D, ui: ScreenLayout, cmd: PortraitCmd): void {
  const to = projector(ui);
  const cx = to.x(cmd.x);
  const cy = to.y(cmd.y);
  const ink = affinityInk(cmd.affinity);
  ctx.fillStyle = `rgb(${ink.r}, ${ink.g}, ${ink.b})`;
  ctx.strokeStyle = css(THEME.edge);
  ctx.lineWidth = 4;
  roundRectPath(ctx, cx - cmd.w * 0.18, cy - cmd.h * 0.2, cmd.w * 0.36, cmd.h * 0.48, 16);
  ctx.fill();
  ctx.stroke();
  ellipse(ctx, cx, cy - cmd.h * 0.16, cmd.w * 0.15, cmd.w * 0.15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.353)";
  ellipse(ctx, cx - cmd.w * 0.05, cy - cmd.h * 0.2, cmd.w * 0.07, cmd.w * 0.07);
  ctx.fill();
}

function drawBar(ctx: SKRSContext2D, ui: ScreenLayout, cmd: BarCmd): void {
  const to = projector(ui);
  const left = to.x(cmd.x - cmd.w / 2);
  const top = to.y(cmd.y + cmd.h / 2);
  ctx.fillStyle = css(THEME.hpBack);
  roundRectPath(ctx, left, top, cmd.w, cmd.h, cmd.h / 2);
  ctx.fill();
  if (cmd.ratio <= 0) {
    return;
  }
  const inner = cmd.h - 6;
  const fillW = Math.max(inner, (cmd.w - 6) * Math.min(1, cmd.ratio));
  ctx.fillStyle = css(cmd.ratio > 0.5 ? THEME.hpHigh : cmd.ratio > 0.2 ? THEME.hpMid : THEME.hpLow);
  roundRectPath(ctx, left + 3, top + 3, fillW, inner, inner / 2);
  ctx.fill();
}

export function paintScene(cmds: DrawCmd[], ui: ScreenLayout): Canvas {
  ensureFont();
  const canvas = createCanvas(ui.view.width, ui.view.height);
  const ctx = canvas.getContext("2d");
  for (const cmd of cmds) {
    if (cmd.kind === "backdrop") {
      drawBackdrop(ctx, ui, cmd.variant);
    } else if (cmd.kind === "window") {
      drawWindow(ctx, ui, cmd);
    } else if (cmd.kind === "text") {
      drawText(ctx, ui, cmd);
    } else if (cmd.kind === "icon") {
      drawIcon(ctx, ui, cmd);
    } else if (cmd.kind === "portrait") {
      drawPortrait(ctx, ui, cmd);
    } else {
      drawBar(ctx, ui, cmd);
    }
  }
  return canvas;
}

export function renderScenePng(cmds: DrawCmd[], ui: ScreenLayout): Buffer {
  return paintScene(cmds, ui).toBuffer("image/png");
}
