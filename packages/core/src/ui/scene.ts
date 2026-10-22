import { SEAL_TIERS } from "../catch/seal.ts";
import { offerRelics } from "../meta/relics.ts";
import { getArt, getSpirit } from "../tables/load-tables.ts";
import type { Affinity } from "../tables/types.ts";
import {
  CODEX_PAGE_SIZE,
  GLOSSARY,
  boonKindLabel,
  formatArtHint,
  formatBoonHint,
  formatCodexSheet,
  formatFooter,
  formatRunSummary,
  listCodexSpirits,
} from "./copy.ts";
import { itemIcon, sealIcon, type ItemIconId } from "./item-icon.ts";
import { cardCaptionSlots, codexCell, codexThumbCaption, formatArtSlip, nameplateSlots } from "./layout.ts";
import type { ScreenKind, ScreenLayout } from "./layout.ts";
import type { PreviewApp } from "./preview-app.ts";

export type DrawTone =
  | "paper"
  | "panel"
  | "slip"
  | "accent"
  | "ink"
  | "edge"
  | "field"
  | "muted";

export interface BackdropCmd {
  kind: "backdrop";
  name: string;
  variant: ScreenKind;
}

export interface WindowCmd {
  kind: "window";
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  tone: DrawTone;
}

export interface TextCmd {
  kind: "text";
  name: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  size: number;
  tone: DrawTone;
  wrap: boolean;
}

export interface IconCmd {
  kind: "icon";
  name: string;
  icon: ItemIconId;
  x: number;
  y: number;
  size: number;
}

export interface PortraitCmd {
  kind: "portrait";
  name: string;
  spiritId: string;
  affinity: Affinity;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BarCmd {
  kind: "bar";
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  ratio: number;
}

export type DrawCmd = BackdropCmd | WindowCmd | TextCmd | IconCmd | PortraitCmd | BarCmd;

/** Tapping bare background is a control in `PreviewApp` but never gets a button. */
const NO_BUTTON = "空地";

/** Mirrors the lobby menu in `assets/scripts/ui/lobby.ts`. */
export const TITLE_MENU: { label: string; icon: ItemIconId; accent: boolean }[] = [
  { label: "新的旅途", icon: "map", accent: true },
  { label: "设置", icon: "charm", accent: false },
  { label: "契录", icon: "seal-fan", accent: false },
  { label: "卵房", icon: "egg", accent: false },
  { label: "成就", icon: "exp", accent: false },
  { label: "统计", icon: "gold", accent: false },
  { label: "存档", icon: "catch", accent: false },
  { label: "名词", icon: "lure", accent: false },
];

const MODE_ICON: Record<string, ItemIconId> = {
  短征: "spd",
  经典: "map",
  今日试炼: "gold",
  无尽长夜: "lure",
  "长夜·合体": "charm",
  苛令: "atk",
};

const EGG_ICON: Record<string, ItemIconId> = {
  兑孵券: "egg",
  跳过并开: "catch",
  种族机: "charm",
  卵术机: "atk",
  异相机: "spd",
};

const COMMAND_ICON: Record<string, ItemIconId> = {
  术: "atk",
  队伍: "hp",
  囊: "potion",
  走: "map",
};

const SHOP_ICON: Record<string, ItemIconId> = {
  再择: "gold",
  小药: "potion",
  摘要: "charm",
  奇遇: "lure",
  合体: "charm",
};

interface Slip {
  label: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  icon?: ItemIconId;
  accent?: boolean;
}

// ---------------------------------------------------------------- primitives

function text(
  name: string,
  body: string,
  x: number,
  y: number,
  w: number,
  size: number,
  opts?: { wrap?: boolean; height?: number; tone?: DrawTone },
): TextCmd {
  const wrap = opts?.wrap ?? false;
  return {
    kind: "text",
    name,
    text: body,
    x,
    y,
    w,
    h: opts?.height ?? (wrap ? 104 : size + 14),
    size,
    tone: opts?.tone ?? "ink",
    wrap,
  };
}

function window(
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  tone: DrawTone = "panel",
  radius = 16,
): WindowCmd {
  return { kind: "window", name, x, y, w, h, radius, tone };
}

function portrait(
  name: string,
  spiritId: string,
  affinity: Affinity,
  x: number,
  y: number,
  w: number,
  h: number,
): PortraitCmd {
  return { kind: "portrait", name: `portrait-${name}`, spiritId, affinity, x, y, w, h };
}

function drawSlip(slip: Slip, ui: ScreenLayout): DrawCmd[] {
  const w = slip.w ?? ui.lobby.buttonW;
  const h = slip.h ?? ui.lobby.buttonH;
  const out: DrawCmd[] = [
    window(`slip-${slip.label}`, slip.x, slip.y, w, h, slip.accent ? "accent" : "slip"),
  ];
  if (slip.icon) {
    out.push({
      kind: "icon",
      name: `slip-${slip.label}-icon`,
      icon: slip.icon,
      x: slip.x - w / 2 + 28,
      y: slip.y,
      size: 36,
    });
    out.push(text(`slip-${slip.label}-label`, slip.label, slip.x + 18, slip.y, w - 66, 24));
  } else {
    out.push(text(`slip-${slip.label}-label`, slip.label, slip.x, slip.y, w - 16, 26));
  }
  return out;
}

function helpButton(x: number, y: number): DrawCmd[] {
  return [window("help", x, y, 56, 56, "panel", 28), text("help-mark", "?", x, y, 40, 30)];
}

function panelWindow(ui: ScreenLayout, name: string, height?: number): WindowCmd {
  const panel = ui.lobby.panel;
  return window(name, 0, panel.y, panel.width, height ?? panel.height, "panel");
}

/** Sit a button just above the panel floor so it does not ride the stroke. */
function panelFloorY(ui: ScreenLayout): number {
  const lobby = ui.lobby;
  return lobby.panel.y - lobby.panel.height / 2 + lobby.buttonH / 2 + 20;
}

function panelCopy(ui: ScreenLayout, body: string, yOff = 168, height = 96): TextCmd {
  const panel = ui.lobby.panel;
  return text("panel-copy", body, 0, panel.y + yOff, panel.width - 48, 22, {
    wrap: true,
    height,
  });
}

function spiritCard(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  hint: string,
): DrawCmd[] {
  const spirit = getSpirit(id);
  const captions = cardCaptionSlots(h);
  const tag = `slip-${spirit.name}`;
  return [
    window(tag, x, y, w, h, "slip"),
    {
      ...portrait(spirit.name, id, spirit.affinities[0], x, y + 36, Math.min(140, w - 40), Math.min(180, h - 120)),
      name: `${tag}-portrait`,
    },
    text(`${tag}-title`, spirit.name, x, y + captions.title.y, w - 24, 20, {
      height: captions.title.h,
    }),
    text(`${tag}-hint`, hint, x, y + captions.hint.y, w - 30, 14, {
      height: captions.hint.h,
      tone: "muted",
    }),
  ];
}

function nameplate(
  who: { name: string; level: number; hp: number; maxHp: number; affinities: Affinity[] },
  box: { x: number; y: number; width: number; height: number },
): DrawCmd[] {
  const slots = nameplateSlots(box.width, box.height);
  const ratio = who.maxHp <= 0 ? 0 : Math.max(0, Math.min(1, who.hp / who.maxHp));
  return [
    window(`plate-${who.name}`, box.x, box.y, box.width, box.height),
    text(`plate-${who.name}-aff`, AFFINITY_CN[who.affinities[0]], box.x + slots.aff.x, box.y + slots.aff.y, slots.aff.w, 18, { height: slots.aff.h }),
    text(`plate-${who.name}-name`, who.name, box.x + slots.name.x, box.y + slots.name.y, slots.name.w, 20, { height: slots.name.h }),
    text(`plate-${who.name}-lv`, `Lv${who.level}`, box.x + slots.lv.x, box.y + slots.lv.y, slots.lv.w, 18, { height: slots.lv.h }),
    {
      kind: "bar",
      name: `plate-${who.name}-bar`,
      x: box.x + slots.bar.x,
      y: box.y + slots.bar.y,
      w: slots.bar.w,
      h: 14,
      ratio,
    },
    text(`plate-${who.name}-hp`, `${who.hp}/${who.maxHp}`, box.x + slots.hp.x, box.y + slots.hp.y, slots.hp.w, 16, { height: slots.hp.h }),
  ];
}

const AFFINITY_CN: Record<Affinity, string> = {
  flame: "炎",
  tide: "潮",
  stone: "岩",
  wood: "木",
  bolt: "霆",
  frost: "霜",
  shade: "影",
  light: "光",
};

// ------------------------------------------------------------------- chrome

/** The splash already shouts the game name, so the title screen shows progress instead. */
function topBarText(app: PreviewApp): string {
  if (app.screen !== "title") {
    return app.title;
  }
  const candy = Object.values(app.account.candy).reduce((sum, n) => sum + n, 0);
  return `契录 ${app.account.codex.length}  成就 ${app.account.achievements.length}  灵糖 ${candy}`;
}

function chrome(app: PreviewApp, ui: ScreenLayout): DrawCmd[] {
  const hud = ui.hud;
  return [
    { kind: "backdrop", name: "backdrop", variant: ui.kind },
    window("top-bar", 0, hud.topBar.y, hud.topBar.width, hud.topBar.height),
    window("message", 0, hud.message.y, hud.message.width, hud.message.height),
    text("wave", topBarText(app), 0, hud.topBar.y, hud.topBar.width - 280, 26),
    text("log", formatFooter(app.screen, app.log), hud.log.x, hud.log.y, hud.log.width, 24, {
      wrap: true,
      height: hud.log.height,
    }),
  ];
}

// ------------------------------------------------------------- lobby screens

/** The lobby grid gets roomier slips than the three-across rows elsewhere. */
function titleSlips(ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  return TITLE_MENU.map((item, index) => ({
    label: item.label,
    x: ((index % 2) - 0.5) * lobby.itemDx,
    y: lobby.itemY0 - Math.floor(index / 2) * lobby.itemGap,
    w: lobby.itemDx - 16,
    h: Math.min(lobby.itemGap - 12, lobby.buttonH + 20),
    icon: item.icon,
    accent: item.accent,
  }));
}

function modeSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  const cols = lobby.modeCols;
  const picks = app.labels().filter((label) => label !== "返回");
  return [
    ...picks.map((label, index) => ({
      label,
      x: cols === 1 ? 0 : ((index % cols) - (cols - 1) / 2) * lobby.itemDx,
      y: lobby.itemY0 - Math.floor(index / cols) * lobby.itemGap,
      icon: MODE_ICON[label],
      accent: label === "短征",
    })),
    { label: "返回", x: 0, y: panelFloorY(ui) },
  ];
}

function starterSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  const offers = offerRelics(app.account, "scene-relic");
  const relics = app.labels().slice(0, offers.length);
  const candy = ["灵糖·降费", "灵糖·魂契", "灵糖·专卵"];
  return [
    ...relics.map((label, index) => ({
      label,
      x: (index - 1) * lobby.shopDx,
      y: lobby.starterRelicY,
      icon: itemIcon(offers[index]?.kind ?? "charm"),
    })),
    ...candy.map((label, index) => ({
      label,
      x: (index - 1) * lobby.shopDx,
      y: lobby.starterCandyY,
      icon: (label === "灵糖·专卵" ? "egg" : "candy") as ItemIconId,
    })),
    { label: "返回", x: 0, y: lobby.starterBackY },
  ];
}

function settingsSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  const labels = app.labels();
  const tabs = labels.slice(0, 5);
  const toggles = labels.slice(5, labels.length - 1);
  return [
    ...tabs.map((label, index) => ({
      label,
      x: (index - 2) * lobby.tabDx,
      y: lobby.itemY0,
      w: lobby.tabW,
      accent: label === TAB_CN[app.settingsTab],
    })),
    ...toggles.map((label, index) => ({
      label,
      x: toggles.length === 1 ? 0 : (index - (toggles.length - 1) / 2) * lobby.shopDx,
      y: lobby.panel.y,
    })),
    { label: "返回", x: 0, y: panelFloorY(ui) },
  ];
}

const TAB_CN: Record<string, string> = {
  general: "通用",
  display: "显示",
  audio: "音频",
  play: "玩法",
  controls: "触控",
};

function codexSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  const nav = ui.codex.navY;
  if (app.codexId) {
    return app.labels().map((label) => ({
      label,
      x: label === "卡通" ? -lobby.shopDx : label === "年画" ? lobby.shopDx : 0,
      y: nav,
    }));
  }
  return app
    .labels()
    .filter((label) => ["上一页", "下一页", "返回"].includes(label))
    .map((label) => ({
      label,
      x: label === "上一页" ? -lobby.shopDx : label === "下一页" ? lobby.shopDx : 0,
      y: nav,
    }));
}

function eggSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  const { dx, w } = rowSlots(3, ui);
  const gap = lobby.panel.height / 4;
  const row: Record<string, { x: number; y: number }> = {
    种族机: { x: -dx, y: lobby.panel.y + gap },
    卵术机: { x: 0, y: lobby.panel.y + gap },
    异相机: { x: dx, y: lobby.panel.y + gap },
    兑孵券: { x: -dx, y: lobby.panel.y - gap },
    跳过并开: { x: 0, y: lobby.panel.y - gap },
    返回: { x: dx, y: lobby.panel.y - gap },
  };
  return app.labels().map((label) => ({
    label,
    ...(row[label] ?? { x: 0, y: panelFloorY(ui) }),
    w,
    icon: EGG_ICON[label],
  }));
}

function slotSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  return app.labels().map((label, index) => {
    if (label === "返回") {
      return { label, x: 0, y: panelFloorY(ui) };
    }
    const { dx, w } = rowSlots(5, ui);
    return {
      label,
      x: (index - 2) * dx,
      y: lobby.panel.y,
      w,
      accent: index === app.slot,
    };
  });
}

function glossarySlips(ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  const cols = lobby.glossaryCols;
  return [
    ...GLOSSARY.map((row, index) => ({
      label: row.term,
      x: ((index % cols) - (cols - 1) / 2) * lobby.glossaryItemDx,
      y: lobby.glossaryItemY0 - Math.floor(index / cols) * lobby.glossaryGap,
      w: 190,
    })),
    { label: "返回", x: 0, y: lobby.glossaryBackY },
  ];
}

// --------------------------------------------------------------- run screens

function shopSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  const floor = panelFloorY(ui);
  const upper = floor + lobby.itemGap;
  const chromeLabels = ["再择", "小药", "摘要", "奇遇", "合体", "回厅"];
  const spot: Record<string, { x: number; y: number }> = {
    再择: { x: -lobby.shopDx, y: upper },
    小药: { x: 0, y: upper },
    摘要: { x: lobby.shopDx, y: upper },
    奇遇: { x: -lobby.shopDx, y: floor },
    回厅: { x: 0, y: floor },
    合体: { x: lobby.shopDx, y: floor },
  };
  return app
    .labels()
    .filter((label) => chromeLabels.includes(label))
    .map((label) => ({ label, ...spot[label]!, icon: SHOP_ICON[label] }));
}

/** Rows inside a panel shrink to fit rather than run past its edges. */
function rowSlots(count: number, ui: ScreenLayout): { dx: number; w: number } {
  const lobby = ui.lobby;
  const w = Math.min(lobby.buttonW, (lobby.panel.width - 40) / Math.max(count, 1) - 12);
  return { w, dx: Math.min(lobby.shopDx, w + 20) };
}

function spreadRow(labels: string[], ui: ScreenLayout, y: number, icon?: ItemIconId): Slip[] {
  const { dx, w } = rowSlots(labels.length, ui);
  return labels.map((label, index) => ({
    label,
    x: (index - (labels.length - 1) / 2) * dx,
    y,
    w,
    icon,
  }));
}

// ------------------------------------------------------------ battle screens

function battleField(app: PreviewApp, ui: ScreenLayout): DrawCmd[] {
  const battle = app.battle;
  if (!battle) {
    return [];
  }
  const field = ui.battle;
  const foes = battle.foes.filter((foe) => foe.hp > 0);
  const out: DrawCmd[] = [];
  foes.forEach((foe, index) => {
    const x = field.foe.x + (index - (foes.length - 1) / 2) * 170;
    out.push(portrait(foe.name, foe.id, foe.affinities[0], x, field.foe.y, field.foe.width, field.foe.height));
  });
  const player = battle.active;
  out.push(
    portrait(
      player.name,
      player.id,
      player.affinities[0],
      field.player.x,
      field.player.y,
      field.player.width,
      field.player.height,
    ),
  );
  out.push(...nameplate(battle.foe, ui.hud.foePlate));
  out.push(...nameplate(player, ui.hud.playerPlate));
  const trayCount = Math.max(battle.party.length, 6);
  for (let index = 0; index < trayCount; index += 1) {
    const member = battle.party[index];
    out.push({
      kind: "bar",
      name: `tray-${index}`,
      x: ui.hud.partyTray.x + (index - (trayCount - 1) / 2) * 26,
      y: ui.hud.partyTray.y,
      w: 18,
      h: 18,
      ratio: member && member.hp > 0 ? 1 : 0,
    });
  }
  return out;
}

function battleTools(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const field = ui.battle;
  const labels = app.labels();
  const seats: (string | null)[] = [
    labels.includes("回厅") ? "回厅" : null,
    "术签",
    labels.includes("跳10波") ? "跳10波" : null,
  ];
  return seats.flatMap((label, index) =>
    label ? [{ label, ...field.tools[index]!, w: field.commandW, h: field.commandH }] : [],
  );
}

function battleSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const field = ui.battle;
  return [
    ...["术", "队伍", "囊", "走"].map((label, index) => ({
      label,
      ...ui.commandPos(index),
      w: field.commandW,
      h: field.commandH,
      icon: COMMAND_ICON[label],
    })),
    ...battleTools(app, ui),
  ];
}

function artSlips(app: PreviewApp, ui: ScreenLayout): DrawCmd[] {
  const battle = app.battle;
  const field = ui.battle;
  if (!battle) {
    return [];
  }
  const out: DrawCmd[] = [];
  battle.active.artIds.forEach((artId, index) => {
    const art = getArt(artId);
    const pos = ui.commandPos(index);
    const copy = formatArtSlip(art.name, art.affinity, battle.active.focusLeft[artId] ?? 0, art.focus);
    out.push(window(`slip-${art.name}`, pos.x, pos.y, field.commandW, field.commandH, "slip"));
    out.push(
      text(`slip-${art.name}-title`, copy.title, pos.x + 8, pos.y + 12, field.commandW - 28, 22, {
        height: 26,
      }),
    );
    out.push(
      text(
        `slip-${art.name}-meta`,
        `${copy.meta}  ${formatArtHint(art.effects, art.power)}`,
        pos.x + 8,
        pos.y - 14,
        field.commandW - 28,
        16,
        { tone: "muted", height: 22 },
      ),
    );
  });
  return out;
}

/** Menu rows sit `menuDx` apart, so a full-width slip would collide with its neighbour. */
function menuSlipW(ui: ScreenLayout): number {
  return Math.min(ui.lobby.buttonW, ui.battle.menuDx - 8);
}

function switchSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const field = ui.battle;
  const names = app.labels().filter((label) => label !== "返回" && label !== NO_BUTTON);
  const w = menuSlipW(ui);
  return [
    ...names.map((label, index) => ({
      label,
      x: ((index % 3) - 1) * field.menuDx,
      y: field.menuY0 - Math.floor(index / 3) * field.menuGap,
      w,
    })),
    { label: "返回", x: 0, y: field.menuY0 - field.menuGap * Math.ceil(names.length / 3), w },
  ];
}

function bagSlips(app: PreviewApp, ui: ScreenLayout): Slip[] {
  const field = ui.battle;
  const items = app.labels().filter((label) => label !== "返回" && label !== NO_BUTTON);
  const iconFor = (label: string, index: number): ItemIconId => {
    if (index === 0) {
      return "potion";
    }
    const tier = SEAL_TIERS.find((row) => label.startsWith(row.name));
    return tier ? sealIcon(tier.id) : "charm";
  };
  return [
    ...items.map((label, index) => ({
      label,
      x: field.commandsX[0] + (index % 2) * field.menuDx,
      y: field.menuY0 - Math.floor(index / 2) * field.menuGap,
      w: field.commandW,
      h: field.commandH,
      icon: iconFor(label, index),
    })),
    {
      label: "返回",
      x: field.commandsX[1],
      y: field.menuY0 - field.menuGap * Math.ceil(items.length / 2),
      w: field.commandW,
      h: field.commandH,
    },
  ];
}

// ------------------------------------------------------------------ assembly

function screenBody(app: PreviewApp, ui: ScreenLayout): { cmds: DrawCmd[]; slips: Slip[] } {
  const lobby = ui.lobby;
  const panel = lobby.panel;
  switch (app.screen) {
    case "title":
      return {
        cmds: [
          text("splash-title", "契灵志怪", 0, lobby.splashY + 36, 680, 58),
          text("splash-sub", "精怪肉鸽", 0, lobby.splashY - 28, 400, 28),
          window("menu", lobby.menu.x, lobby.menu.y, lobby.menu.width, lobby.menu.height),
          ...helpButton(lobby.help.x, lobby.help.y),
        ],
        slips: titleSlips(ui),
      };
    case "mode":
      return {
        cmds: [panelWindow(ui, "mode-panel"), ...helpButton(lobby.help.x, lobby.help.y)],
        slips: modeSlips(app, ui),
      };
    case "starter":
      return {
        cmds: [
          ...["zao_li", "jing_zhu", "tao_geng"].flatMap((id, index) =>
            spiritCard(
              id,
              (index - 1) * lobby.shopDx,
              lobby.starterCard.y,
              lobby.starterCard.width,
              lobby.starterCard.height,
              "点选开局",
            ),
          ),
        ],
        slips: starterSlips(app, ui),
      };
    case "settings":
      return {
        cmds: [panelWindow(ui, "settings"), ...helpButton(lobby.help.x, lobby.help.y)],
        slips: settingsSlips(app, ui),
      };
    case "codex":
      return { cmds: codexBody(app, ui), slips: codexSlips(app, ui) };
    case "eggs":
      return {
        cmds: [
          panelWindow(ui, "eggs"),
          panelCopy(ui, app.log, 220, 64),
          ...helpButton(lobby.help.x, lobby.help.y),
        ],
        slips: eggSlips(app, ui),
      };
    case "achievements":
      return {
        cmds: [
          panelWindow(ui, "achieve"),
          panelCopy(ui, app.log, 40, 280),
          ...helpButton(lobby.help.x, lobby.help.y),
        ],
        slips: [{ label: "返回", x: 0, y: panelFloorY(ui) }],
      };
    case "stats":
      return {
        cmds: [
          panelWindow(ui, "stats"),
          panelCopy(ui, app.log.replace(/ {2}/g, "\n"), 40, 220),
          ...helpButton(lobby.help.x, lobby.help.y),
        ],
        slips: [{ label: "返回", x: 0, y: panelFloorY(ui) }],
      };
    case "slots":
      return {
        cmds: [
          panelWindow(ui, "slots"),
          panelCopy(ui, app.log),
          ...helpButton(lobby.help.x, lobby.help.y),
        ],
        slips: slotSlips(app, ui),
      };
    case "glossary":
      return {
        cmds: [
          window("glossary", lobby.glossary.x, lobby.glossary.y, lobby.glossary.width, lobby.glossary.height),
          text("glossary-body", app.log, 0, lobby.glossaryBodyY, lobby.glossary.width - 60, 24, {
            wrap: true,
            height: 140,
          }),
        ],
        slips: glossarySlips(ui),
      };
    case "hatch":
      return {
        cmds: hatchBody(app, ui),
        slips: [{ label: "返回", x: 0, y: panelFloorY(ui) }],
      };
    case "battle":
      return {
        cmds: [...battleField(app, ui), ...helpButton(ui.battle.help.x, ui.battle.help.y)],
        slips: battleSlips(app, ui),
      };
    case "arts":
      return {
        cmds: [
          ...battleField(app, ui),
          ...artSlips(app, ui),
          ...helpButton(ui.battle.help.x, ui.battle.help.y),
        ],
        slips: [
          {
            label: "返回",
            ...ui.battle.tools[0],
            w: ui.battle.commandW,
            h: ui.battle.commandH,
          },
        ],
      };
    case "switch":
      return {
        cmds: [...battleField(app, ui), ...helpButton(ui.battle.help.x, ui.battle.help.y)],
        slips: switchSlips(app, ui),
      };
    case "bag":
      return {
        cmds: [...battleField(app, ui), ...helpButton(ui.battle.help.x, ui.battle.help.y)],
        slips: bagSlips(app, ui),
      };
    case "target":
      return {
        cmds: [...battleField(app, ui), ...helpButton(ui.battle.help.x, ui.battle.help.y)],
        slips: app
          .labels()
          .filter((label) => label !== NO_BUTTON)
          .map((label, index, all) => ({
            label,
            x: (index - (all.length - 1) / 2) * ui.battle.menuDx,
            y: ui.battle.menuY0,
            w: menuSlipW(ui),
          })),
      };
    case "catch":
      return { cmds: catchBody(app, ui), slips: catchSlips(ui) };
    case "shop":
      return { cmds: shopBody(app, ui), slips: shopSlips(app, ui) };
    case "map":
      return {
        cmds: [panelWindow(ui, "map"), panelCopy(ui, "择下一境域。", 160, 72)],
        slips: [
          ...spreadRow(
            app.labels().filter((label) => label !== "回厅" && label !== NO_BUTTON),
            ui,
            panel.y,
            "map",
          ),
          { label: "回厅", x: 0, y: panelFloorY(ui) },
        ],
      };
    case "omen":
      return {
        cmds: [panelWindow(ui, "omen"), panelCopy(ui, `${app.title}\n${app.log}`, 140, 160)],
        slips: [
          ...spreadRow(
            app.labels().filter((label) => label !== "回厅" && label !== NO_BUTTON),
            ui,
            panel.y,
          ),
          { label: "回厅", x: 0, y: panelFloorY(ui) },
        ],
      };
    case "summary":
      return {
        cmds: [panelWindow(ui, "summary"), panelCopy(ui, app.log, 40, 240)],
        slips: [
          { label: "返回", x: lobby.shopDx, y: panelFloorY(ui) },
          { label: "回厅", x: -lobby.shopDx, y: panelFloorY(ui) },
        ],
      };
    case "defeat":
    case "victory":
      return {
        cmds: [panelWindow(ui, "end"), panelCopy(ui, endSheet(app), 40, 240)],
        slips: [{ label: "再来一局", x: 0, y: panelFloorY(ui), icon: "map", accent: true }],
      };
    default:
      return { cmds: [], slips: [] };
  }
}

function endSheet(app: PreviewApp): string {
  const run = app.slice?.run;
  if (!run) {
    return app.log;
  }
  return formatRunSummary({
    gold: run.gold,
    potions: run.potions,
    seals: run.seals,
    partyIds: run.partyIds,
    boonIds: run.boonIds,
  });
}

function codexBody(app: PreviewApp, ui: ScreenLayout): DrawCmd[] {
  const grid = ui.codex;
  const help = helpButton(ui.lobby.help.x, ui.lobby.help.y);
  if (app.codexId) {
    const spirit = getSpirit(app.codexId);
    const sheet = formatCodexSheet(app.codexId);
    const body = [sheet.headline, sheet.stats, sheet.pact, sheet.arts, sheet.evo]
      .filter((line) => line.length > 0)
      .join("\n");
    return [
      portrait(spirit.name, spirit.id, spirit.affinities[0], 0, grid.entryY, grid.entryW, grid.entryH),
      window("codex-sheet", 0, grid.sheetY, grid.sheetW, grid.sheetH),
      text("codex-body", body, 0, grid.sheetY, grid.sheetW - 40, 24, {
        wrap: true,
        height: grid.sheetH - 24,
      }),
      ...help,
    ];
  }
  const page = listCodexSpirits().slice(
    app.codexPage * CODEX_PAGE_SIZE,
    app.codexPage * CODEX_PAGE_SIZE + CODEX_PAGE_SIZE,
  );
  const caption = codexThumbCaption(grid.cellH);
  return [
    ...page.flatMap((row, index) => {
      const cell = codexCell(ui, index);
      const tag = `slip-${row.name}`;
      return [
        window(tag, cell.x, cell.y, grid.cellW, grid.cellH, "slip"),
        {
          ...portrait(row.name, row.id, row.affinities[0], cell.x, cell.y - 6, grid.cellW - 16, grid.cellH - 28),
          name: `${tag}-portrait`,
        },
        text(`${tag}-title`, row.name, cell.x, cell.y + caption.y, grid.cellW - 16, 18, {
          height: caption.h,
        }),
      ];
    }),
    ...help,
  ];
}

const CATCH_PANEL_H = 240;

function catchBody(app: PreviewApp, ui: ScreenLayout): DrawCmd[] {
  const field = ui.battle;
  const lobby = ui.lobby;
  const out: DrawCmd[] = [panelWindow(ui, "catch", CATCH_PANEL_H)];
  const foeId = app.slice?.encounter?.foeId;
  if (!foeId) {
    return out;
  }
  const spirit = getSpirit(foeId);
  // The panel is opaque, so the quarry stands clear of its top edge.
  const feet = lobby.panel.y + CATCH_PANEL_H / 2 + 20;
  out.push(
    portrait(
      spirit.name,
      spirit.id,
      spirit.affinities[0],
      0,
      feet + field.foe.height / 2,
      field.foe.width,
      field.foe.height,
    ),
  );
  out.push(
    text(
      "catch-who",
      `${spirit.name}  ${AFFINITY_CN[spirit.affinities[0]!]}`,
      0,
      lobby.panel.y + CATCH_PANEL_H / 2 - 44,
      lobby.panel.width - 80,
      26,
    ),
  );
  return out;
}

function catchSlips(ui: ScreenLayout): Slip[] {
  const lobby = ui.lobby;
  const dx = Math.min(lobby.shopDx, lobby.panel.width / 2 - lobby.buttonW / 2 - 20);
  const y = lobby.panel.y - CATCH_PANEL_H / 2 + lobby.buttonH / 2 + 24;
  return [
    { label: "镇物", x: -dx, y, icon: "seal-fan" },
    { label: "放过", x: dx, y, icon: "map" },
    {
      label: "回厅",
      x: 0,
      y: Math.min(lobby.backY, lobby.panel.y - CATCH_PANEL_H / 2 - lobby.buttonH / 2 - 16),
    },
  ];
}

function hatchBody(app: PreviewApp, ui: ScreenLayout): DrawCmd[] {
  const lobby = ui.lobby;
  const out: DrawCmd[] = [panelWindow(ui, "hatch")];
  const id = app.account.codex.at(-1);
  if (!id) {
    out.push(panelCopy(ui, app.log, 40, 160));
    return out;
  }
  const spirit = getSpirit(id);
  const h = Math.min(200, lobby.panel.height - lobby.buttonH - 80);
  out.push(
    portrait(spirit.name, spirit.id, spirit.affinities[0], 0, lobby.panel.y + 36, Math.min(160, lobby.panel.width - 80), h),
  );
  out.push(text("hatch-who", `${spirit.name}  ${AFFINITY_CN[spirit.affinities[0]!]}`, 0, lobby.panel.y - h / 2, lobby.panel.width - 80, 26));
  return out;
}

function shopBody(app: PreviewApp, ui: ScreenLayout): DrawCmd[] {
  const slice = app.slice;
  const lobby = ui.lobby;
  const out: DrawCmd[] = [panelWindow(ui, "shop-frame")];
  if (!slice) {
    return out;
  }
  const count = Math.max(slice.boonChoices.length, 1);
  const slot = (lobby.panel.width - 40) / count;
  const w = slot - 12;
  // Cards hang from the panel top and stop short of the two chrome rows on the floor.
  const top = lobby.panel.y + lobby.panel.height / 2 - 20;
  const chromeTop = panelFloorY(ui) + lobby.itemGap;
  const h = Math.min(
    top - Math.max(lobby.panel.y - lobby.panel.height / 2 + 20, chromeTop + lobby.buttonH / 2 + 16),
    340,
  );
  const cardY = top - h / 2;
  const titleY = top - 140;
  const floor = cardY - h / 2 + 12;
  slice.boonChoices.forEach((boon, index) => {
    const x = (index - (count - 1) / 2) * slot;
    out.push(window(`slip-${boon.name}`, x, cardY, w, h, "slip"));
    out.push({
      kind: "icon",
      name: `slip-${boon.name}-icon`,
      icon: itemIcon(boon.kind),
      x,
      y: top - 56,
      size: 56,
    });
    out.push(text(`slip-${boon.name}-kind`, boonKindLabel(boon.kind), x, top - 100, w - 24, 18));
    out.push(text(`slip-${boon.name}-title`, boon.name, x, titleY, w - 20, 24));
    out.push(
      text(`slip-${boon.name}-hint`, formatBoonHint(boon.kind, boon.value), x, (titleY - 16 + floor) / 2, w - 24, 18, {
        wrap: true,
        height: titleY - 16 - floor,
        tone: "muted",
      }),
    );
  });
  return out;
}

export function buildScene(app: PreviewApp, ui: ScreenLayout): DrawCmd[] {
  const body = screenBody(app, ui);
  const out = [...chrome(app, ui), ...body.cmds];
  for (const slip of body.slips) {
    out.push(...drawSlip(slip, ui));
  }
  return out;
}

/** Labels the player can act on. Everything here must end up drawn. */
export function tappableLabels(app: PreviewApp): string[] {
  return app.labels().filter((label) => label !== NO_BUTTON);
}
