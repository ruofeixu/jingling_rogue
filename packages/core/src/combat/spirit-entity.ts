import { getArt, getSpirit } from "../tables/load-tables.ts";
import type { Affinity } from "../tables/types.ts";

export type Side = "player" | "foe";
export type CharmId = string;
export type CombatForm = "none" | "sanctify" | "colossus" | "apex";

export type Ailment =
  | { kind: "burn" }
  | { kind: "poison" }
  | { kind: "toxic"; layers: number }
  | { kind: "paralyze" }
  | { kind: "sleep"; turns: number }
  | { kind: "freeze" };

export interface SpiritEntity {
  instanceId: string;
  id: string;
  name: string;
  side: Side;
  level: number;
  affinities: Affinity[];
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  artIds: string[];
  focusLeft: Record<string, number>;
  stages: { atk: number; def: number; spd: number };
  ailment: Ailment | null;
  guarding: boolean;
  substituteHp: number;
  pactId: string;
  hiddenPact: boolean;
  charms: CharmId[];
  form: CombatForm;
  formTurns: number;
  formBackup: { atk: number; maxHp: number; hp: number; affinities: Affinity[] } | null;
}

export function makeSpirit(opts: {
  id: string;
  side: Side;
  level: number;
  instanceId?: string;
  atkOverride?: number;
  defOverride?: number;
  hpOverride?: number;
  hiddenPact?: boolean;
}): SpiritEntity {
  const row = getSpirit(opts.id);
  const scale = 1 + (opts.level - 1) * 0.08;
  const maxHp = opts.hpOverride ?? Math.round(row.baseHp * scale);
  const focusLeft: Record<string, number> = {};
  for (const artId of row.artIds) {
    focusLeft[artId] = getArt(artId).focus;
  }
  return {
    instanceId: opts.instanceId ?? `${opts.side}-${opts.id}`,
    id: row.id,
    name: row.name,
    side: opts.side,
    level: opts.level,
    affinities: row.affinities,
    hp: maxHp,
    maxHp,
    atk: opts.atkOverride ?? Math.round(row.baseAtk * scale),
    def: opts.defOverride ?? Math.round(row.baseDef * scale),
    spd: Math.round(row.baseSpd * scale),
    artIds: row.artIds,
    focusLeft,
    stages: { atk: 0, def: 0, spd: 0 },
    ailment: null,
    guarding: false,
    substituteHp: 0,
    pactId: row.pactId,
    hiddenPact: opts.hiddenPact ?? false,
    charms: [],
    form: "none",
    formTurns: 0,
    formBackup: null,
  };
}

export function isFainted(spirit: SpiritEntity): boolean {
  return spirit.hp <= 0;
}
