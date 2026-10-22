import arts from "./arts.json";
import boons from "./boons.json";
import pacts from "./pacts.json";
import realms from "./realms.json";
import endlessRealms from "./realms-endless.json";
import spirits from "./spirits.json";
import typeChart from "./type-chart.json";
import type { GameTables, RealmRow } from "./types.ts";

export function loadTables(): GameTables {
  return {
    spirits: spirits as GameTables["spirits"],
    arts: arts as GameTables["arts"],
    pacts: pacts as GameTables["pacts"],
    boons: boons as GameTables["boons"],
    realms: realms as GameTables["realms"],
    typeChart: typeChart as GameTables["typeChart"],
  };
}

export function loadEndlessRealms(): RealmRow[] {
  return endlessRealms as RealmRow[];
}

export function getSpirit(id: string) {
  const row = loadTables().spirits.find((s) => s.id === id);
  if (!row) {
    throw new Error(`unknown spirit: ${id}`);
  }
  return row;
}

export function getArt(id: string) {
  const row = loadTables().arts.find((a) => a.id === id);
  if (!row) {
    throw new Error(`unknown art: ${id}`);
  }
  return row;
}
