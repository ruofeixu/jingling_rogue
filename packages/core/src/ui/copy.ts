import { AFFINITY_CN } from "./layout.ts";
import { getSpirit, loadTables } from "../tables/load-tables.ts";
import { PORTRAIT_IDS } from "../assets/manifest.ts";
import { affinityMod } from "../combat/damage.ts";
import type { Affinity, ArtEffect, ArtRow } from "../tables/types.ts";

const STATUS_CN: Record<string, string> = {
  burn: "灼",
  poison: "毒",
  toxic: "剧毒",
  paralyze: "麻",
};

const STAT_CN: Record<string, string> = {
  atk: "攻",
  def: "守",
  spd: "迅",
};

export function formatArtHint(effects: ArtEffect[], power: number): string {
  const parts = effects.map((effect) => {
    if (effect.kind === "damage") {
      const hits = effect.hits && effect.hits > 1 ? `×${effect.hits}` : "";
      return `伤${power}${hits}`;
    }
    if (effect.kind === "heal") {
      return `愈${Math.round(effect.ratio * 100)}%`;
    }
    if (effect.kind === "drain") {
      return `汲${Math.round(effect.ratio * 100)}%`;
    }
    if (effect.kind === "status") {
      return `可${STATUS_CN[effect.status] ?? effect.status}`;
    }
    if (effect.kind === "stage") {
      const arrow = effect.delta > 0 ? "↑" : "↓";
      const who = effect.on === "user" ? "己" : "敌";
      return `${who}${STAT_CN[effect.stat] ?? effect.stat}${arrow}`;
    }
    if (effect.kind === "guard") {
      return "守";
    }
    return "护符";
  });
  return parts.join(" · ") || "术";
}

export function formatArtPlay(userName: string, art: ArtRow | null): string {
  if (!art) {
    return `${userName} 竭力一击。无灵力时的挣扎。`;
  }
  return `${userName} 使出 ${art.name}。${AFFINITY_CN[art.affinity as Affinity]} · ${formatArtHint(art.effects, art.power)}`;
}

export function formatSealResult(name: string, caught: boolean, chance: number): string {
  const pct = Math.round(chance * 100);
  return caught ? `${name} 收契成功（${pct}%）` : `${name} 挣脱了（${pct}%）`;
}

export function formatNextHint(kind: string): string {
  if (kind === "arts") {
    return "点术签使出，或点「返回」。";
  }
  if (kind === "switch") {
    return "点名字换上场，或点「返回」。";
  }
  if (kind === "bag") {
    return "点小药回血，或点镇物收契，或点「返回」。";
  }
  if (kind === "catch") {
    return "点「镇物」收契，或点「放过」。";
  }
  if (kind === "target") {
    return "点要打的那只精怪。";
  }
  if (kind === "shop") {
    return "点机缘带走，或再择。";
  }
  if (kind === "map") {
    return "点下一境域。";
  }
  if (kind === "omen") {
    return "点一个选项。";
  }
  return "点「术」出第一张。术签选别的术。";
}

const FOOTER_CN: Record<string, string> = {
  eggs: "点机开卵，或兑孵券。",
  achievements: "点「返回」。",
  stats: "点「返回」。",
  slots: "点槽切换，或「返回」。",
  glossary: "点词条看释义。",
  map: "点下一境域。",
  omen: "点一个选项。",
  summary: "点「返回」继续，或「回厅」。",
  hatch: "点「返回」。",
  settings: "点标签改项，或「返回」。",
};

/** Bottom bar: action hint when the panel already shows the body copy. */
export function formatFooter(screen: string, fallback: string): string {
  return FOOTER_CN[screen] ?? fallback;
}

export function formatMiss(waitingFor?: string): string {
  if (waitingFor === "command") {
    return "点空处无事。请点「术」。";
  }
  if (waitingFor === "switch") {
    return "点空处无事。请点名字换上场。";
  }
  if (waitingFor === "arts") {
    return "点空处无事。请点术签。";
  }
  return "点空处无事。请点高亮的指令。";
}

export function formatSpentArt(name: string): string {
  return `${name} 灵力已尽。换一张，或点「术」竭力一击。`;
}

export function formatBattleNudge(opts: {
  foeAffinities: Affinity[];
  activeArts: Affinity[];
  benchArts: Affinity[][];
  hpRatio: number;
  potions: number;
}): string {
  const chart = loadTables().typeChart;
  const best = (arts: Affinity[]) =>
    Math.max(0, ...arts.map((art) => affinityMod(art, opts.foeAffinities, chart)));
  const active = best(opts.activeArts);
  const bench = Math.max(0, ...opts.benchArts.map((arts) => best(arts)));
  const parts: string[] = [];
  if (active < 1 && bench > active) {
    parts.push("换人");
  }
  if (opts.hpRatio <= 0.4 && opts.potions > 0) {
    parts.push("囊");
  }
  if (parts.length === 0) {
    return "";
  }
  return `可点「${parts.join("」或「")}」。`;
}

const BOON_KIND_CN: Record<string, string> = {
  atk: "攻",
  def: "守",
  spd: "迅",
  hp: "体",
  catch: "契",
  gold: "金",
  exp: "悟",
  potion: "丹",
  map: "途",
  lure: "诱",
  candy: "糖",
  charm: "佩",
  cleanse: "净",
  ether: "泉",
  evolve: "蜕",
  form: "相",
  formItem: "相器",
  fruit: "果",
  hiddenPact: "隐契",
  mint: "秘",
  passive: "常",
  ppMax: "签容",
  ppUp: "签补",
  revive: "苏",
  sealPack: "镇",
  speciesBoost: "族",
  splicer: "合",
  tm: "术卷",
  typeBoost: "属",
  unsplice: "解",
  vitamin: "补",
  voucher: "券",
  warToken: "战符",
};

export function boonKindLabel(kind: string): string {
  return BOON_KIND_CN[kind] ?? "增益";
}

export function formatBoonHint(kind: string, value: number): string {
  if (kind === "atk") {
    return `本局全队攻+${value}`;
  }
  if (kind === "def") {
    return `本局全队守+${value}`;
  }
  if (kind === "spd") {
    return `本局全队迅+${value}`;
  }
  if (kind === "hp") {
    return `本局全队体+${value}`;
  }
  if (kind === "catch") {
    return `收契率+${Math.round(value * 100)}%`;
  }
  if (kind === "gold") {
    return `立刻得金${value}`;
  }
  if (kind === "exp") {
    return `经验+${Math.round(value * 100)}%`;
  }
  if (kind === "potion") {
    return `囊中小药+1`;
  }
  if (kind === "map") {
    return `打开山河图，可择境域`;
  }
  if (kind === "lure") {
    return `提高双人野遇`;
  }
  if (kind === "revive") {
    return `救回濒死队友`;
  }
  if (kind === "sealPack") {
    return `凡镇+${value}`;
  }
  if (kind === "evolve") {
    return `队内可进化则进化`;
  }
  if (kind === "form") {
    return `战斗中可开对应形态`;
  }
  if (kind === "hiddenPact") {
    return `解锁隐契`;
  }
  return "本局机缘";
}

export function formatBoonTaken(name: string, hint: string): string {
  return `带走${name}。${hint}`;
}

export function formatRunHarvest(opts: {
  seen: number;
  caught: number;
  candy: number;
  unlocked?: boolean;
}): string {
  const parts = [`见 ${opts.seen}`, `收 ${opts.caught}`];
  if (opts.candy > 0) {
    parts.push(`灵糖 ${opts.candy}`);
  }
  if (opts.unlocked) {
    parts.push("新解锁");
  }
  return parts.join("  ");
}

export function formatRunSummary(opts: {
  gold: number;
  potions: number;
  seals: number[];
  partyIds: string[];
  boonIds: string[];
}): string {
  const tables = loadTables();
  const names = opts.partyIds.map((id) => {
    try {
      return getSpirit(id).name;
    } catch {
      return id;
    }
  });
  const boons = opts.boonIds.map((id) => {
    const row = tables.boons.find((boon) => boon.id === id);
    if (!row) {
      return id;
    }
    return `${row.name}（${formatBoonHint(row.kind, row.value)}）`;
  });
  const boonText = boons.length > 0 ? boons.join("；") : "尚无机缘";
  return `金 ${opts.gold}  小药 ${opts.potions}  凡镇 ${opts.seals[0] ?? 0}\n队伍 ${names.join("、")}\n机缘 ${boonText}`;
}

export const CODEX_PAGE_SIZE = 16;

export function listCodexSpirits() {
  const all = loadTables().spirits;
  const withArt = all.filter((row) => PORTRAIT_IDS.has(row.id));
  const rest = all.filter((row) => !PORTRAIT_IDS.has(row.id));
  return [...withArt, ...rest];
}

export function formatCodexSheet(id: string): { headline: string; stats: string; pact: string; arts: string; evo: string } {
  const tables = loadTables();
  const spirit = getSpirit(id);
  const pact = tables.pacts.find((row) => row.id === spirit.pactId);
  const realm = tables.realms.find((row) => row.id === spirit.realm);
  const aff = spirit.affinities.map((row) => AFFINITY_CN[row]).join("·");
  const arts = spirit.artIds.map((artId) => tables.arts.find((row) => row.id === artId)?.name ?? artId);
  let evo = "";
  if (spirit.evolveTo) {
    try {
      evo = `可蜕为${getSpirit(spirit.evolveTo).name}。`;
    } catch {
      evo = "";
    }
  }
  return {
    headline: `${spirit.name}  ${aff}  ${realm?.name ?? spirit.realm}`,
    stats: `体${spirit.baseHp}  攻${spirit.baseAtk}  守${spirit.baseDef}  迅${spirit.baseSpd}`,
    pact: `魂契「${pact?.name ?? spirit.pactId}」：${pact?.description ?? ""}`,
    arts: `术 ${arts.join("、")}`,
    evo,
  };
}

export function formatCodexEntry(id: string): string {
  const sheet = formatCodexSheet(id);
  return [sheet.headline, sheet.stats, sheet.pact, sheet.arts, sheet.evo].filter((line) => line.length > 0).join("\n");
}

export function formatCodexLog(id: string, art?: "folk" | "cartoon"): string {
  const entry = formatCodexEntry(id);
  if (!art || !PORTRAIT_IDS.has(id)) {
    return entry;
  }
  return `${entry}\n立绘·${art === "cartoon" ? "卡通" : "年画"}`;
}

export const GLOSSARY: { term: string; body: string }[] = [
  { term: "精怪", body: "隙中的生灵。对战、收契、编队的对象。" },
  { term: "契录", body: "精怪名册。大厅可翻全部，点开看数值与魂契；有立绘的可对照年画与卡通，无立绘的只看剪影。" },
  { term: "灵性", body: "炎潮岩木霆霜影光八性。相克会改变术法伤害。" },
  { term: "术法", body: "战斗中先点「术」，再点术签使出。每张有灵力次数。" },
  { term: "灵力", body: "这局还能使出该术法的次数，用完会竭力一击。" },
  { term: "镇物", body: "战后收契精怪的器具。成则入契录。" },
  { term: "机缘", body: "坊市三选一的加成，只在本局长征有效。" },
  { term: "佩饰", body: "精怪携带的小物，可在摘要里移佩。" },
  { term: "境域", body: "地图上的下一站，决定会遇到谁。" },
  { term: "卵房", body: "孵卵处。孵券兑卵，步数走完或跳过后可开。" },
  { term: "契印", body: "开局三选一的本局信物，账号解锁后才会出现。" },
  { term: "短征", body: "二十波短途。必须带一枚契印，打完第二十波即结束。" },
  { term: "魂契", body: "精怪自带的特性，影响输出或承伤。" },
  { term: "囊", body: "战斗中喝丹药给当前精怪回血。" },
  { term: "走", body: "从野遇逃离。行者战不能走。" },
  { term: "队伍", body: "换一只未倒下的精怪上场。" },
];
