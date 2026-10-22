import { RngStream } from "../rng/rng-stream.ts";
import graph from "../tables/realm-graph.json";
import trainers from "../tables/trainers.json";

export type EncounterKind =
  | "wild"
  | "trainer"
  | "rival"
  | "gym"
  | "grunt"
  | "admin"
  | "e4"
  | "champion"
  | "legend"
  | "void";

export interface WaveSpec {
  kind: EncounterKind;
  boss: boolean;
  finale: boolean;
  shields: number;
  catchable: boolean;
  trainerId?: string;
}

const LEVEL_CAPS = [
  10, 16, 24, 32, 38, 48, 56, 64, 74, 84, 94, 104, 114, 126, 138, 150, 162, 174, 188, 200,
];

const RIVAL_WAVES = [8, 25, 55, 95, 145, 195];
const GRUNT_WAVES = [35, 62, 64, 66, 112, 114];
const ADMIN_WAVES = [115, 165];
const E4_WAVES = [182, 184, 186, 188];

type GraphFile = Record<string, { neighbors: { id: string; weight: number }[] }>;

const REALM_GRAPH = graph as GraphFile;

export function levelCap(wave: number): number {
  const band = Math.min(LEVEL_CAPS.length, Math.max(1, Math.ceil(wave / 10)));
  return LEVEL_CAPS[band - 1];
}

export function encounterLevel(wave: number): number {
  const cap = levelCap(wave);
  const prior = wave <= 10 ? 5 : levelCap(wave - 10);
  const t = ((wave - 1) % 10) / 9;
  return Math.round(prior + (cap - prior) * t);
}

export function foeEncounterLevel(wave: number): number {
  const level = encounterLevel(wave);
  if (wave <= 10) {
    return Math.max(1, level - 6);
  }
  if (wave <= 20) {
    return Math.max(1, level - 3);
  }
  if (wave <= 180) {
    return level + 9;
  }
  return Math.max(1, level - 12);
}

export function earlyAffinityClamp(wave: number): { min: number; max: number } | undefined {
  if (wave <= 10) {
    return { min: 0.9, max: 1.1 };
  }
  if (wave <= 20) {
    return { min: 0.8, max: 1.25 };
  }
  return undefined;
}

export function firstGymWave(seed: string): 20 | 30 {
  return new RngStream(seed).child(19).float() < 0.5 ? 20 : 30;
}

export function gymWaves(seed: string): number[] {
  const first = firstGymWave(seed);
  const waves: number[] = [];
  for (let wave = first; wave <= 180; wave += 30) {
    waves.push(wave);
  }
  return waves;
}

export function describeWave(wave: number, seed: string): WaveSpec {
  if (wave === 250 || wave === 1000) {
    return { kind: "legend", boss: true, finale: false, shields: 2, catchable: false, trainerId: "legend" };
  }
  if (wave === 200) {
    return { kind: "legend", boss: true, finale: true, shields: 2, catchable: false, trainerId: "legend" };
  }
  if (RIVAL_WAVES.includes(wave)) {
    return { kind: "rival", boss: false, finale: false, shields: 0, catchable: false, trainerId: "rival" };
  }
  if (wave >= 191 && wave <= 199) {
    return { kind: "void", boss: true, finale: false, shields: 1, catchable: false };
  }
  if (wave === 190) {
    return { kind: "champion", boss: true, finale: false, shields: 0, catchable: false, trainerId: "champion" };
  }
  if (E4_WAVES.includes(wave)) {
    return { kind: "e4", boss: true, finale: false, shields: 0, catchable: false, trainerId: "e4" };
  }
  if (ADMIN_WAVES.includes(wave)) {
    return { kind: "admin", boss: true, finale: false, shields: 0, catchable: false, trainerId: "admin" };
  }
  if (GRUNT_WAVES.includes(wave)) {
    return { kind: "grunt", boss: false, finale: false, shields: 0, catchable: false, trainerId: "grunt" };
  }
  if (wave === 5) {
    return { kind: "trainer", boss: false, finale: false, shields: 0, catchable: false, trainerId: "disciple" };
  }
  if (gymWaves(seed).includes(wave)) {
    return { kind: "gym", boss: true, finale: false, shields: 0, catchable: false, trainerId: "gym" };
  }
  if (wave % 10 === 0) {
    return { kind: "wild", boss: true, finale: false, shields: wave <= 10 ? 0 : 1, catchable: false };
  }
  return { kind: "wild", boss: false, finale: false, shields: 0, catchable: true };
}

export function partyBattleKind(kind: EncounterKind): "wild" | "trainer" {
  return kind === "wild" ? "wild" : "trainer";
}

export function isApexRivalWave(wave: number): boolean {
  return RIVAL_WAVES.indexOf(wave) === 3;
}

export function rivalFightIndex(wave: number): number {
  return RIVAL_WAVES.indexOf(wave);
}

const RIVAL_SLOTS = ["zao_li", "luo_yan_c", "jing_zhong", "huo_de_li", "zhen_yue", "lian_xin"];

export function rivalRoster(fightIndex: number, _seed = ""): { partyIds: string[]; sanctify: boolean } {
  const count = Math.min(6, Math.max(1, fightIndex + 1));
  return {
    partyIds: RIVAL_SLOTS.slice(0, count),
    sanctify: fightIndex >= 5,
  };
}

export function neighborIds(realmId: string): string[] {
  return (REALM_GRAPH[realmId]?.neighbors ?? []).map((row) => row.id);
}

export function realmChoices(realmId: string, seed: string, wave: number): string[] {
  const neighbors = REALM_GRAPH[realmId]?.neighbors ?? [];
  if (neighbors.length <= 3) {
    return neighbors.map((row) => row.id);
  }
  const rng = new RngStream(seed).child(3000 + wave);
  const pool = [...neighbors];
  const picked: string[] = [];
  while (picked.length < 3 && pool.length > 0) {
    const index = rng.int(pool.length);
    picked.push(pool[index].id);
    pool.splice(index, 1);
  }
  return picked;
}

export function pickNextRealm(opts: {
  realmId: string;
  seed: string;
  wave: number;
  hasMap: boolean;
}): string {
  if (opts.hasMap) {
    const choices = realmChoices(opts.realmId, opts.seed, opts.wave);
    return choices[0] ?? opts.realmId;
  }
  const neighbors = REALM_GRAPH[opts.realmId]?.neighbors ?? [];
  if (neighbors.length === 0) {
    return opts.realmId;
  }
  const rng = new RngStream(opts.seed).child(3100 + opts.wave);
  const total = neighbors.reduce((sum, row) => sum + row.weight, 0);
  let ticket = rng.float() * total;
  for (const row of neighbors) {
    ticket -= row.weight;
    if (ticket <= 0) {
      return row.id;
    }
  }
  return neighbors[neighbors.length - 1].id;
}

export function trainerName(trainerId: string): string {
  const row = (trainers as { id: string; name: string }[]).find((item) => item.id === trainerId);
  return row?.name ?? trainerId;
}

export function defaultRealmForWave(wave: number): string {
  if (wave >= 191) {
    return "void";
  }
  if (wave <= 10) {
    return "town_ruins";
  }
  return "wilds";
}
