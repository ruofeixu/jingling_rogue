import { RngStream } from "../rng/rng-stream.ts";
import rows from "../tables/relics.json";

export type RelicKind = "atk" | "def" | "spd" | "hp" | "gold" | "potion" | "exp" | "catch" | "lure" | "map" | "sealPack";

export interface RelicRow {
  id: string;
  name: string;
  kind: RelicKind;
  value: number;
  unlock: "start" | "codex" | "clear";
}

const RELICS = rows as RelicRow[];

export function listRelics(): RelicRow[] {
  return RELICS;
}

export function starterRelicIds(): string[] {
  return RELICS.filter((row) => row.unlock === "start").map((row) => row.id);
}

export function getRelic(id: string): RelicRow {
  const row = RELICS.find((item) => item.id === id);
  if (!row) {
    throw new Error(`unknown relic: ${id}`);
  }
  return row;
}

export function offerRelics(account: { unlockedRelics: string[] }, seed: string): RelicRow[] {
  const byId = new Map(RELICS.map((row) => [row.id, row]));
  const unlocked = (account.unlockedRelics.length > 0 ? account.unlockedRelics : starterRelicIds())
    .map((id) => byId.get(id))
    .filter((row): row is RelicRow => Boolean(row));
  if (unlocked.length <= 3) {
    return unlocked.slice(0, 3);
  }
  const rng = new RngStream(seed).child(17);
  const pool = [...unlocked];
  const picked: RelicRow[] = [];
  while (picked.length < 3 && pool.length > 0) {
    picked.push(pool.splice(rng.int(pool.length), 1)[0]);
  }
  return picked;
}

export function pickStartRelic(account: { unlockedRelics: string[] }, selected: string, seed: string): string {
  const offers = offerRelics(account, seed);
  if (offers.some((row) => row.id === selected)) {
    return selected;
  }
  return offers[0]?.id ?? starterRelicIds()[0] ?? "";
}

export function sumRelicStats(relicIds: string[]): { atk: number; def: number; spd: number; hp: number } {
  const bonus = { atk: 0, def: 0, spd: 0, hp: 0 };
  for (const id of relicIds) {
    const row = RELICS.find((item) => item.id === id);
    if (row?.kind === "atk") {
      bonus.atk += row.value;
    }
    if (row?.kind === "def") {
      bonus.def += row.value;
    }
    if (row?.kind === "spd") {
      bonus.spd += row.value;
    }
    if (row?.kind === "hp") {
      bonus.hp += row.value;
    }
  }
  return bonus;
}

export function relicCatchValue(relicIds: string[]): number {
  return relicIds.reduce((sum, id) => {
    const row = RELICS.find((item) => item.id === id);
    return row?.kind === "catch" ? sum + row.value : sum;
  }, 0);
}
