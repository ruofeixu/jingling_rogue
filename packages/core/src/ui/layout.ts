import type { Affinity } from "../tables/types.ts";

export const VIEW = { width: 750, height: 1334 } as const;

export const HIT_MIN = 44;

export const BATTLE = {
  foe: { x: 130, y: 40, width: 168, height: 220 },
  player: { x: -150, y: -10, width: 176, height: 230 },
  commandsY: -423,
  commandsX: [-84, 84, -84] as [number, number, number],
  commandW: 156,
  commandH: 58,
  logY: -600,
} as const;

export const HUD = {
  foePlate: { x: -170, y: 458, width: 330, height: 96 },
  playerPlate: { x: -190, y: -186, width: 330, height: 104 },
  partyTray: { x: -190, y: -252 },
  message: { y: -600, width: 710, height: 128 },
  topBar: { y: 612, width: 710, height: 52 },
} as const;

export const ART_SLIP = { x: 126, width: 156, height: 58, gap: 12 } as const;

export function artSlipPos(index: number): { x: number; y: number } {
  return commandCell(0, -423, 168, 70, index);
}

export type ScreenKind = "portrait" | "landscape";

export interface ScreenLayout {
  kind: ScreenKind;
  view: { width: number; height: number };
  /** Where the grass band starts. Characters stand with their feet below it. */
  horizonY: number;
  battle: {
    foe: { x: number; y: number; width: number; height: number };
    player: { x: number; y: number; width: number; height: number };
    commandsY: number;
    commandsX: [number, number, number];
    commandW: number;
    commandH: number;
    logY: number;
    skip: { x: number; y: number };
    help: { x: number; y: number };
    quit: { x: number; y: number };
    /** Seats for 回厅 / 术签 / 跳10波, in that order, beside the command cells. */
    tools: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
    back: { x: number; y: number };
    menuY0: number;
    menuGap: number;
    menuDx: number;
  };
  hud: {
    foePlate: { x: number; y: number; width: number; height: number };
    playerPlate: { x: number; y: number; width: number; height: number };
    partyTray: { x: number; y: number };
    message: { y: number; width: number; height: number };
    topBar: { y: number; width: number; height: number };
    log: { x: number; y: number; width: number; height: number };
  };
  artSlip: { x: number; width: number; height: number; gap: number };
  artSlipPos: (index: number) => { x: number; y: number };
  commandPos: (index: number) => { x: number; y: number };
  lobby: {
    splashY: number;
    menu: { x: number; y: number; width: number; height: number };
    itemDx: number;
    itemY0: number;
    itemGap: number;
    buttonW: number;
    buttonH: number;
    tabW: number;
    tabDx: number;
    help: { x: number; y: number };
    glossary: { x: number; y: number; width: number; height: number };
    glossaryBodyY: number;
    glossaryItemY0: number;
    glossaryGap: number;
    glossaryItemDx: number;
    glossaryCols: number;
    glossaryBackY: number;
    panel: { y: number; width: number; height: number };
    backY: number;
    starterRelicY: number;
    starterCandyY: number;
    starterBackY: number;
    starterCard: { y: number; width: number; height: number };
    slotDx: number;
    slotW: number;
    shopDx: number;
    modeCols: number;
  };
  codex: {
    cols: number;
    rows: number;
    y0: number;
    dx: number;
    dy: number;
    cellW: number;
    cellH: number;
    navY: number;
    entryY: number;
    entryW: number;
    entryH: number;
    sheetY: number;
    sheetW: number;
    sheetH: number;
  };
}

export function screenLayout(width: number, height: number): ScreenLayout {
  return height >= width ? portraitLayout() : landscapeLayout();
}

export function codexCell(ui: ScreenLayout, index: number): { x: number; y: number } {
  const grid = ui.codex;
  const col = index % grid.cols;
  const row = Math.floor(index / grid.cols);
  return {
    x: (col - (grid.cols - 1) / 2) * grid.dx,
    y: grid.y0 - row * grid.dy,
  };
}

function commandCell(cx: number, cy: number, dx: number, dy: number, index: number): { x: number; y: number } {
  return {
    x: cx + (index % 2 - 0.5) * dx,
    y: cy - Math.floor(index / 2) * dy,
  };
}

function portraitLayout(): ScreenLayout {
  const cx = 0;
  const cy = -423;
  const dx = 168;
  const dy = 70;
  const commandPos = (index: number) => commandCell(cx, cy, dx, dy, index);
  const cell0 = commandPos(0);
  return {
    kind: "portrait",
    view: { width: VIEW.width, height: VIEW.height },
    horizonY: 120,
    battle: {
      foe: { ...BATTLE.foe },
      player: { ...BATTLE.player },
      commandsY: cy,
      commandsX: [commandPos(0).x, commandPos(1).x, commandPos(2).x],
      commandW: BATTLE.commandW,
      commandH: BATTLE.commandH,
      logY: HUD.message.y,
      skip: { x: 300, y: HUD.topBar.y },
      help: { x: -336, y: HUD.topBar.y },
      quit: { x: -258, y: HUD.topBar.y },
      tools: [
        { x: -258, y: cy },
        { x: 258, y: cy },
        { x: 258, y: cy - dy },
      ],
      back: { x: cx, y: cy + dy },
      menuY0: -302,
      menuGap: 66,
      menuDx: 168,
    },
    hud: {
      foePlate: { ...HUD.foePlate },
      playerPlate: { ...HUD.playerPlate },
      partyTray: { ...HUD.partyTray },
      message: { ...HUD.message },
      topBar: { ...HUD.topBar },
      log: { x: 0, y: HUD.message.y, width: 680, height: 100 },
    },
    artSlip: { x: cell0.x, width: BATTLE.commandW, height: BATTLE.commandH, gap: 12 },
    artSlipPos: commandPos,
    commandPos,
    lobby: {
      splashY: 490,
      menu: { x: 0, y: 40, width: 660, height: 620 },
      itemDx: 268,
      itemY0: 208,
      itemGap: 112,
      buttonW: 220,
      buttonH: 64,
      tabW: 112,
      tabDx: 118,
      help: { x: 336, y: HUD.topBar.y },
      glossary: { x: 0, y: 40, width: 700, height: 560 },
      glossaryBodyY: -146,
      glossaryItemY0: 240,
      glossaryGap: 68,
      glossaryItemDx: 220,
      glossaryCols: 3,
      glossaryBackY: -360,
      panel: { y: 40, width: 620, height: 520 },
      backY: -186,
      starterRelicY: 268,
      starterCandyY: 168,
      starterBackY: -300,
      starterCard: { y: -70, width: 210, height: 260 },
      slotDx: 136,
      slotW: 120,
      shopDx: 236,
      modeCols: 2,
    },
    codex: {
      cols: 4,
      rows: 4,
      y0: 420,
      dx: 176,
      dy: 212,
      cellW: 164,
      cellH: 196,
      navY: -460,
      entryY: 250,
      entryW: 280,
      entryH: 340,
      sheetY: -140,
      sheetW: 640,
      sheetH: 220,
    },
  };
}

function landscapeLayout(): ScreenLayout {
  const cx = 400;
  const cy = -175;
  const dx = 176;
  const dy = 62;
  const commandPos = (index: number) => commandCell(cx, cy, dx, dy, index);
  const cell0 = commandPos(0);
  return {
    kind: "landscape",
    view: { width: 1334, height: 750 },
    horizonY: 40,
    battle: {
      foe: { x: 80, y: 80, width: 150, height: 170 },
      player: { x: -80, y: 0, width: 160, height: 180 },
      commandsY: cy,
      commandsX: [commandPos(0).x, commandPos(1).x, commandPos(2).x],
      commandW: 164,
      commandH: 54,
      logY: -316,
      skip: { x: 600, y: 332 },
      help: { x: -620, y: 332 },
      quit: { x: -545, y: 332 },
      tools: [
        { x: cx - 180, y: cy + dy + 40 },
        { x: cx, y: cy + dy + 40 },
        { x: cx + 180, y: cy + dy + 40 },
      ],
      back: { x: cx, y: cy + dy },
      menuY0: -70,
      menuGap: 56,
      menuDx: 176,
    },
    hud: {
      foePlate: { x: -480, y: 250, width: 280, height: 68 },
      playerPlate: { x: -480, y: -200, width: 280, height: 72 },
      partyTray: { x: -480, y: -252 },
      message: { y: -316, width: 1280, height: 84 },
      topBar: { y: 332, width: 1280, height: 44 },
      log: { x: 0, y: -316, width: 1240, height: 72 },
    },
    artSlip: { x: cell0.x, width: 164, height: 54, gap: 8 },
    artSlipPos: commandPos,
    commandPos,
    lobby: {
      splashY: 215,
      menu: { x: 0, y: -2, width: 980, height: 320 },
      itemDx: 196,
      itemY0: 76,
      itemGap: 68,
      buttonW: 176,
      buttonH: 48,
      tabW: 100,
      tabDx: 108,
      help: { x: 620, y: 332 },
      glossary: { x: 0, y: 8, width: 1180, height: 380 },
      glossaryBodyY: -94,
      glossaryItemY0: 120,
      glossaryGap: 48,
      glossaryItemDx: 220,
      glossaryCols: 5,
      glossaryBackY: -240,
      panel: { y: 8, width: 980, height: 340 },
      backY: -120,
      starterRelicY: 220,
      starterCandyY: 160,
      starterBackY: -220,
      starterCard: { y: -20, width: 186, height: 180 },
      slotDx: 160,
      slotW: 148,
      shopDx: 196,
      modeCols: 2,
    },
    codex: {
      cols: 4,
      rows: 4,
      y0: 200,
      dx: 160,
      dy: 112,
      cellW: 148,
      cellH: 100,
      navY: -250,
      entryY: 140,
      entryW: 180,
      entryH: 160,
      sheetY: -40,
      sheetW: 980,
      sheetH: 120,
    },
  };
}

const INK: Record<Affinity, { r: number; g: number; b: number }> = {
  flame: { r: 196, g: 72, b: 48 },
  tide: { r: 48, g: 112, b: 168 },
  stone: { r: 140, g: 108, b: 72 },
  wood: { r: 56, g: 132, b: 72 },
  bolt: { r: 196, g: 164, b: 48 },
  frost: { r: 120, g: 176, b: 196 },
  shade: { r: 32, g: 28, b: 40 },
  light: { r: 212, g: 168, b: 96 },
};

export const AFFINITY_CN: Record<Affinity, string> = {
  flame: "炎",
  tide: "潮",
  stone: "岩",
  wood: "木",
  bolt: "霆",
  frost: "霜",
  shade: "影",
  light: "光",
};

export function affinityInk(affinity: Affinity): { r: number; g: number; b: number } {
  return INK[affinity];
}

export function formatHpText(hp: number, maxHp: number): string {
  return `${hp}/${maxHp}`;
}

export function formatTopBar(wave: number, realm: string, mark: string, gold?: number): string {
  const tail = gold === undefined ? "" : `  金${gold}`;
  return `第${wave}波  ${realm}  ${mark}${tail}`;
}

export function formatArtSlip(
  name: string,
  affinity: Affinity,
  left: number,
  max: number,
): { title: string; meta: string } {
  return { title: name, meta: `${AFFINITY_CN[affinity]}  ${left}/${max}` };
}

export interface TextSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function nameplateSlots(width: number, height: number): {
  aff: TextSlot;
  name: TextSlot;
  lv: TextSlot;
  bar: TextSlot;
  hp: TextSlot;
} {
  const pad = Math.min(16, Math.max(10, width * 0.05));
  const affW = 32;
  const lvW = 52;
  const hpW = 84;
  const rowH = 32;
  const barH = 14;
  const gap = 8;
  const topY = height / 2 - 16;
  const aff: TextSlot = { x: -width / 2 + pad + affW / 2, y: topY, w: affW, h: rowH };
  const lv: TextSlot = { x: width / 2 - pad - lvW / 2, y: topY, w: lvW, h: rowH };
  const nameLeft = aff.x + affW / 2 + gap;
  const nameRight = lv.x - lvW / 2 - gap;
  const name: TextSlot = {
    x: (nameLeft + nameRight) / 2,
    y: topY,
    w: nameRight - nameLeft,
    h: rowH,
  };
  const botY = -height / 2 + 18;
  const barW = width - pad * 2 - hpW - gap;
  const bar: TextSlot = { x: -width / 2 + pad + barW / 2, y: botY, w: barW, h: barH };
  const hp: TextSlot = { x: width / 2 - pad - hpW / 2, y: botY, w: hpW, h: rowH };
  return { aff, name, lv, bar, hp };
}

export function cardCaptionSlots(height: number): { title: TextSlot; hint: TextSlot } {
  const titleH = 32;
  const hintH = 24;
  const pad = 12;
  const hint: TextSlot = { x: 0, y: -height / 2 + pad + hintH / 2, w: 0, h: hintH };
  const title: TextSlot = {
    x: 0,
    y: hint.y + hintH / 2 + 8 + titleH / 2,
    w: 0,
    h: titleH,
  };
  return { title, hint };
}

export function codexThumbCaption(cellH: number): { y: number; h: number } {
  const h = 30;
  return { y: -cellH / 2 + 4 + h / 2, h };
}
