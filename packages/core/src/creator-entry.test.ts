import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as entry from "./creator-entry.ts";

function listTs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...listTs(path));
    } else if (name.endsWith(".ts") && !name.endsWith(".d.ts")) {
      out.push(path);
    }
  }
  return out;
}

function importedCoreNames(text: string): string[] {
  const names: string[] = [];
  const blocks = text.matchAll(/import\s+(type\s+)?\{([^}]+)\}\s+from\s+["'][^"']*vendor\/jinglingCore["']/g);
  for (const match of blocks) {
    if (match[1]) {
      continue;
    }
    for (const part of match[2].split(",")) {
      const trimmed = part.trim();
      if (!trimmed || trimmed.startsWith("type ")) {
        continue;
      }
      names.push(trimmed.split(/\s+as\s+/)[0].trim());
    }
  }
  return names;
}

describe("creator-entry bridge", () => {
  it("exports every jinglingCore name the Cocos scripts import", () => {
    const scripts = join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts");
    const exported = new Set(Object.keys(entry));
    const missing: string[] = [];
    for (const file of listTs(scripts)) {
      for (const name of importedCoreNames(readFileSync(file, "utf8"))) {
        if (!exported.has(name)) {
          missing.push(`${file.split("/assets/scripts/")[1] ?? file}:${name}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("does not redeclare jinglingCore imports", () => {
    const scripts = join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts");
    const dupes: string[] = [];
    for (const file of listTs(scripts)) {
      const names = importedCoreNames(readFileSync(file, "utf8"));
      const seen = new Set<string>();
      for (const name of names) {
        if (seen.has(name)) {
          dupes.push(`${file.split("/assets/scripts/")[1] ?? file}:${name}`);
        }
        seen.add(name);
      }
    }
    expect(dupes).toEqual([]);
  });

  it("keeps preview canvas exact-fit and origin-zero", () => {
    const boot = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/Boot.ts"),
      "utf8",
    );
    expect(boot).toContain("ResolutionPolicy.EXACT_FIT");
    expect(boot).toContain("setPosition(0, 0, 0)");
    expect(boot).toContain("setContentSize(width, height)");
    expect(boot.includes("SHOW_ALL")).toBe(false);
  });

  it("drives battle hit tweens from HIT_FX", () => {
    const scripts = join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts");
    const paint = readFileSync(join(scripts, "ui/paint.ts"), "utf8");
    const boot = readFileSync(join(scripts, "Boot.ts"), "utf8");
    expect(paint).toContain("HIT_FX.flashDim");
    expect(paint).toContain("HIT_FX.lungeOut");
    expect(paint).toContain("HIT_FX.lungeBack");
    expect(paint).toContain("function flashNode");
    expect(paint).toContain("function lungeNode");
    expect(paint.toLowerCase().includes("phaser")).toBe(false);
    expect(boot).toContain("flashNode(");
    expect(boot).toContain("lungeNode(");
    expect(boot).toContain('paintWindow(canvas, "top-bar"');
    expect(boot).toContain('hud.topBar.height, 16)');
    expect(boot).toContain('makeLabel(canvas, "Wave", title, hud.topBar.y, 26');
    expect(boot).not.toContain('hud.topBar.y, 24');
    expect(boot).toContain('hud.message.height, 16)');
    expect(boot).toContain('makeLabel(canvas, "Log", log, hud.log.y, 24');
    expect(boot).toContain("height: hud.log.height");
    expect(boot).not.toContain('hud.log.y, 22');
    expect(boot).not.toContain('hud.topBar.height, 8)');
    expect(boot).not.toContain('hud.message.height, 12)');
  });

  it("fits portraits without ellipse pads", () => {
    const scripts = join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts");
    const paint = readFileSync(join(scripts, "ui/paint.ts"), "utf8");
    const portrait = readFileSync(join(scripts, "ui/portrait.ts"), "utf8");
    const start = paint.indexOf("export function paintPortrait");
    const end = paint.indexOf("export function paintHpBar");
    const body = paint.slice(start, end);
    expect(body).toContain("attachPortraitSprite");
    expect(body).not.toContain("ellipse");
    expect(body).toContain("g.strokeColor = PANEL_EDGE");
    expect(body).toContain("g.lineWidth = 4");
    expect(body).not.toContain("g.lineWidth = 3");
    expect(body).toContain("g.stroke()");
    expect(body).toContain("new Color(255, 255, 255, 90)");
    expect(body).toContain("width * 0.07");
    expect(body).not.toContain("width * 0.05, height * 0.2, width * 0.05");
    expect(body).not.toContain("255, 255, 255, 40");
    expect(body).toContain("height * 0.48, 16)");
    expect(body).not.toContain("height * 0.48, 14)");
    expect(body).toContain('addText(root, "name", name, 0, -height / 2 + 18, width - 8, 20, INK');
    expect(body).not.toContain("width - 8, 18, INK");
    expect(portrait).toContain("portraitFit");
    expect(portrait).toContain("assetManager.loadBundle(PORTRAIT_BUNDLE");
    expect(portrait).not.toContain("resources.load(");
  });

  it("exports the portrait subpackage name to the Cocos scripts", () => {
    expect(entry.PORTRAIT_BUNDLE).toBe("portraits");
  });

  it("skins windows from THEME without the old dark paper", () => {
    const scripts = join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts");
    const paint = readFileSync(join(scripts, "ui/paint.ts"), "utf8");
    const lobby = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../packages/platform/src/lobby-boot.js"),
      "utf8",
    );
    expect(paint).toContain("THEME.paper");
    expect(paint).toContain("Math.max(16, radius)");
    expect(paint).toContain("label.lineHeight = fontSize + 10");
    expect(paint).not.toContain("label.lineHeight = fontSize + 8");
    expect(paint).toContain("fontSize + 14");
    expect(paint).not.toContain("fontSize + 12");
    expect(paint).not.toContain("fontSize + 10)");
    expect(paint).toContain("wrap ? 104");
    expect(paint).not.toContain("wrap ? 96");
    expect(paint).not.toContain("wrap ? 80");
    expect(paint).toContain("wide ? 140 : 220, 16)");
    expect(paint).not.toContain("wide ? 140 : 220, 8)");
    expect(paint).toContain("g.ellipse(wide ? 160 : 90");
    expect(paint).not.toContain("18, 22, 36");
    expect(paint).toContain("new Color(255, 236, 214, 255)");
    expect(paint).toContain("new Color(80, 70, 62, 255)");
    expect(paint).not.toContain("new Color(90, 80, 70, 255)");
    expect(paint).not.toContain("new Color(120, 108, 96, 255)");
    expect(paint).toContain("new Color(208, 192, 180, 255)");
    expect(paint).not.toContain("new Color(232, 220, 210, 255)");
    expect(paint).toContain("new Color(220, 148, 28, 255)");
    expect(paint).not.toContain("new Color(228, 188, 48, 255)");
    expect(paint).toContain("HP_BACK, 8)");
    expect(paint).not.toContain("HP_BACK, 6)");
    expect(paint).toContain("h - 6, 6)");
    expect(paint).not.toContain("h - 6, 4)");
    expect(paint).toContain("w - 10, h - 10");
    expect(paint).toContain("new Color(255, 255, 255, 90)");
    expect(lobby).not.toContain("#1a1410");
    expect(lobby).toContain("rgb(232,244,252)");
    expect(lobby).toContain("rgb(61,50,40)");
    expect(lobby).toContain("fillText(START");
    expect(lobby).toContain('ctx.font = "bold 38px sans-serif"');
    expect(lobby).not.toContain('ctx.font = "bold 36px sans-serif"');
    expect(lobby).toContain('ctx.font = "26px sans-serif"');
    expect(lobby).not.toContain('ctx.font = "24px sans-serif"');
    expect(lobby).toContain('ctx.font = "30px sans-serif"');
    expect(lobby).not.toContain('ctx.font = "28px sans-serif"');
    expect(lobby).not.toContain("rgb(255,253,248)");
  });

  it("paints item icon discs on paper, not near-black", () => {
    const paint = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/paint.ts"),
      "utf8",
    );
    const start = paint.indexOf("export function paintItemIcon");
    const end = paint.indexOf("export function playCatchFx");
    const body = paint.slice(start, end);
    expect(body).toContain("g.fillColor = PAPER");
    expect(body).not.toContain("12, 12, 18");
    expect(body).toContain("r * 0.84, r * 0.84, 10)");
    expect(body).not.toContain("r * 0.84, r * 0.84, 8)");
    expect(body).toContain("r * 0.56, r * 0.56, 6)");
    expect(body).toContain("g.lineWidth = 3");
    expect(body).not.toContain("g.lineWidth = 2");
    expect(body).not.toContain("r * 0.56, r * 0.56, 4)");
    expect(body).toContain("r * 0.32, r * 0.28, 4)");
    expect(body).not.toContain("r * 0.32, r * 0.28, 3)");
    expect(paint).toContain('"seal-jie": new Color(148, 116, 196, 255)');
    expect(paint).not.toContain("64, 52, 88");
  });

  it("paints party tray empty and fainted dots in light cartoon fills", () => {
    const paint = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/paint.ts"),
      "utf8",
    );
    const start = paint.indexOf("export function paintPartyTray");
    const end = paint.indexOf("export function paintSplash");
    const body = paint.slice(start, end);
    expect(body).toContain("? PAPER");
    expect(body).toContain("new Color(236, 180, 176, 255)");
    expect(body).toContain("? GOLD");
    expect(body).toContain(": MUTED");
    expect(body).toContain("* 26");
    expect(body).toContain("g.circle(cx, 0, 9)");
    expect(body).not.toContain("g.circle(cx, 0, 8)");
    expect(body).toContain("g.lineWidth = 3");
    expect(body).not.toContain("g.lineWidth = 2");
    expect(body).not.toContain(": INK");
    expect(body).not.toContain("40, 44, 56");
    expect(body).not.toContain("60, 48, 48");
  });

  it("paints splash title in dark ink", () => {
    const paint = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/paint.ts"),
      "utf8",
    );
    const start = paint.indexOf("export function paintSplash");
    const end = paint.indexOf("export function paintFloatNum");
    const body = paint.slice(start, end);
    expect(body).toContain('addText(root, "title", "契灵志怪", 0, 36, 680, 58, INK');
    expect(body).not.toContain('680, 56, INK');
    expect(body).toContain('addText(root, "sub", "精怪肉鸽", 0, -28, 400, 28, INK');
    expect(body).not.toContain('400, 26, INK');
    expect(body).not.toMatch(/addText\(root, "title"[\s\S]{0,80}GOLD/);
    expect(paint).toContain('addText(parent, "float", text, x, y, 120, 30, color');
    expect(paint).not.toContain('120, 28, color');
  });

  it("paints battle nameplate names in dark ink", () => {
    const paint = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/paint.ts"),
      "utf8",
    );
    const start = paint.indexOf("export function paintNameplate");
    const end = paint.indexOf("export function paintPartyTray");
    const body = paint.slice(start, end);
    expect(body).toContain('addText(root, "nm", opts.name, slots.name.x, slots.name.y, slots.name.w, 20, INK');
    expect(body).not.toContain("slots.name.w, 18, INK");
    expect(body).toContain("height: slots.name.h");
    expect(body).toContain('addText(root, "aff", AFFINITY_CN[opts.affinity], slots.aff.x, slots.aff.y, slots.aff.w, 18, INK');
    expect(body).not.toContain("slots.aff.w, 16, INK");
    expect(body).toContain("height: slots.aff.h");
    expect(body).toContain('addText(root, "lv", `Lv${opts.level}`, slots.lv.x, slots.lv.y, slots.lv.w, 18, INK');
    expect(body).not.toContain("slots.lv.w, 16, INK");
    expect(body).toContain("height: slots.lv.h");
    expect(body).toContain('addText(root, "hp", `${opts.hp}/${opts.maxHp}`, slots.hp.x, slots.hp.y, slots.hp.w, 16, INK');
    expect(body).not.toContain("slots.hp.w, 14, INK");
    expect(body).toContain("height: slots.hp.h");
    expect(body).toContain("opts.height, 16)");
    expect(body).not.toContain("opts.height, 12)");
    expect(body).not.toMatch(/addText\(root, "nm"[\s\S]{0,80}GOLD/);
    expect(body).not.toMatch(/addText\(root, "hp"[\s\S]{0,80}MUTED/);
  });

  it("paints art slip titles in dark ink", () => {
    const kit = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/kit.ts"),
      "utf8",
    );
    const start = kit.indexOf("export function makeArtSlip");
    const end = kit.indexOf("export function makeSpiritCard");
    const body = kit.slice(start, end);
    expect(body).toContain("coverHit");
    expect(body).toContain('addText(node, "title", copy.title, 8, 16, opts.width - 28, 22, INK');
    expect(body).not.toContain('opts.width - 28, 20, INK');
    expect(body).toContain('opts.width - 28, 16, MUTED');
    expect(body).not.toContain('opts.width - 28, 14, MUTED');
    expect(body).toContain("opts.height - 16, 6)");
    expect(body).not.toContain("opts.height - 16, 4)");
    expect(body).not.toMatch(/addText\(node, "title", copy.title[\s\S]{0,80}GOLD/);
  });

  it("paints boon card kind labels in dark ink", () => {
    const kit = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/kit.ts"),
      "utf8",
    );
    const start = kit.indexOf("export function makeBoonCard");
    const end = kit.indexOf("export function makeCodexThumb");
    const body = kit.slice(start, end);
    expect(body).toContain("coverHit");
    expect(body).toContain('addText(node, "kind", opts.kind ?? "", 0, height / 2 - 88, 80, 16, INK');
    expect(body).not.toContain('80, 14, INK');
    expect(body).toContain('addText(node, "title", opts.name, 0, 8, width - 20, 24, INK');
    expect(body).not.toContain('width - 20, 22, INK');
    expect(body).toContain('width - 24, 18, MUTED');
    expect(body).not.toContain('width - 24, 16, MUTED');
    expect(body).toContain("height: 72");
    expect(body).not.toMatch(/addText\(node, "kind"[\s\S]{0,80}GOLD/);
  });

  it("paints slip button labels in dark ink", () => {
    const kit = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/kit.ts"),
      "utf8",
    );
    const start = kit.indexOf("export function makeSlipButton");
    const end = kit.indexOf("export function makeTextButton");
    const body = kit.slice(start, end);
    expect(body).toContain("coverHit");
    expect(body).toContain('addText(node, "label", text, 0, 0, width - 16, 26, INK');
    expect(body).not.toContain('width - 16, 24, INK');
    expect(body).toContain('addText(node, "label", text, 16, 0, width - 58, 24, INK');
    expect(body).not.toContain('width - 58, 22, INK');
    expect(body).not.toMatch(/addText\(node, "label"[\s\S]{0,80}GOLD/);
    expect(body).toContain("accent ? GOLD : SLIP");
  });

  it("paints starter card names in dark ink", () => {
    const kit = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/kit.ts"),
      "utf8",
    );
    const start = kit.indexOf("export function makeSpiritCard");
    const end = kit.indexOf("export function makeBoonCard");
    const body = kit.slice(start, end);
    expect(body).toContain("cardCaptionSlots");
    expect(body).toContain('addText(node, "title", opts.name, 0, captions.title.y, width - 24, 20, INK');
    expect(body).not.toContain("width - 24, 18, INK");
    expect(body).toContain("height: captions.title.h");
    expect(body).toContain('addText(node, "hint", "点选开局", 0, captions.hint.y, width - 30, 14, MUTED');
    expect(body).not.toContain("width - 30, 13, MUTED");
    expect(body).toContain("height: captions.hint.h");
    expect(body).not.toMatch(/addText\(node, "title", opts.name[\s\S]{0,80}GOLD/);
  });

  it("paints help button mark in dark ink", () => {
    const kit = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/kit.ts"),
      "utf8",
    );
    const start = kit.indexOf("export function makeHelpButton");
    const end = kit.indexOf("function coverHit");
    const body = kit.slice(start, end);
    expect(body).toContain('addText(node, "q", "?", 0, 0, 40, 30, INK');
    expect(body).not.toContain('40, 28, INK');
    expect(body).toContain("coverHit(node, 56, 56)");
    expect(body).not.toMatch(/addText\(node, "q"[\s\S]{0,80}GOLD/);
  });

  it("keeps cocos taps on coverHit buttons", () => {
    const kit = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/kit.ts"),
      "utf8",
    );
    expect(kit).toContain("function coverHit");
    expect(kit.match(/bindClick\(coverHit\(/g)?.length).toBeGreaterThanOrEqual(6);
    expect(kit).not.toMatch(/paintWindow\([^;]*?, 1[024]\)/);
    expect(kit).toContain(", 16);");
    expect(kit).toContain("56, 56, 28");
    expect(kit).toContain("codexThumbCaption");
    expect(kit).toContain("opts.width - 16, 18, INK");
    expect(kit).not.toContain("opts.width - 16, 16, INK");
    expect(kit).toContain("height: caption.h");
    expect(kit).toContain('PANEL, 8)');
    expect(kit).not.toContain('PANEL, 6)');
  });

  it("paints glossary body at readable size", () => {
    const lobby = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/lobby.ts"),
      "utf8",
    );
    const start = lobby.indexOf('"glossary-body"');
    const body = lobby.slice(start, start + 280);
    expect(body).toContain("24,");
    expect(body).toContain("height: 140");
    expect(body).not.toMatch(/glossary-body[\s\S]{0,220}22,/);
    const sheet = lobby.slice(lobby.indexOf('"codex-body"'), lobby.indexOf('"codex-body"') + 180);
    expect(sheet).toContain("24, INK");
    expect(sheet).toContain("height: grid.sheetH - 24");
    expect(sheet).not.toContain("40, 22, INK");
  });

  it("fills empty lobby sheets and marks primary slips", () => {
    const lobby = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/ui/lobby.ts"),
      "utf8",
    );
    const boot = readFileSync(
      join(fileURLToPath(new URL(".", import.meta.url)), "../../../assets/scripts/Boot.ts"),
      "utf8",
    );
    expect(lobby).toContain("listAchievements");
    expect(lobby).toContain("已得");
    expect(lobby).toContain('"panel-copy"');
    expect(lobby).toContain('["新的旅途", () => host.showModePick(), "map", true]');
    expect(lobby).not.toContain("lobby.panel.width, 240, 16");
    expect(lobby).not.toContain("lobby.panel.width, 280, 16");
    expect(lobby).toContain("tab === host.settingsTab");
    expect(boot).toContain('commandH, "atk"');
    expect(boot).toContain('commandH, "hp"');
    expect(boot).toContain('label === "短征"');
    expect(boot).toContain('"map", true');
    expect(boot).toContain("paintEndSheet");
  });
});
