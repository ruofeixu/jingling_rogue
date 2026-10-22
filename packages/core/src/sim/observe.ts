import type { Affinity } from "../tables/types.ts";
import type { ClassicSlice } from "../run/classic-slice.ts";
import type { PartyBattle } from "../combat/party-battle.ts";
import { getArt } from "../tables/load-tables.ts";
import { isFainted } from "../combat/spirit-entity.ts";
import { formatBoonHint } from "../ui/copy.ts";
import { rerollCost } from "../shop/shop.ts";

export type SimTier = "low" | "mid" | "high" | "guide";

export interface ArtView {
  id: string;
  name: string;
  affinity: Affinity;
  power: number;
  focus: number;
}

export interface PartyView {
  id: string;
  instanceId: string;
  name: string;
  hp: number;
  maxHp: number;
  affinities: Affinity[];
  arts: ArtView[];
  fainted: boolean;
}

export interface FoeView {
  id: string;
  instanceId: string;
  name: string;
  hp: number;
  maxHp: number;
  affinities: Affinity[];
}

export interface OfferView {
  id: string;
  name: string;
  kind: string;
  hint: string;
}

export interface SimObserve {
  phase: ClassicSlice["phase"] | "switch" | "target";
  wave: number;
  gold: number;
  potions: number;
  seals: number[];
  waitingFor: PartyBattle["waitingFor"];
  party: PartyView[];
  foes: FoeView[];
  offers: OfferView[];
  rerollCost: number;
  catchable: boolean;
  kind: "wild" | "trainer";
  activeIndex: number;
  realmChoices: string[];
}

function artsOf(unit: { artIds: string[]; focusLeft: Record<string, number> }): ArtView[] {
  return unit.artIds.map((id) => {
    const art = getArt(id);
    return {
      id,
      name: art.name,
      affinity: art.affinity,
      power: art.power,
      focus: unit.focusLeft[id] ?? 0,
    };
  });
}

export function observeBattle(slice: ClassicSlice, battle: PartyBattle | null): SimObserve {
  const shop = slice.shop;
  return {
    phase:
      battle?.waitingFor === "switch"
        ? "switch"
        : battle?.waitingFor === "target"
          ? "target"
          : slice.phase,
    wave: slice.run.wave,
    gold: slice.run.gold,
    potions: battle?.potions ?? slice.run.potions,
    seals: battle?.seals ?? slice.run.seals,
    waitingFor: battle?.waitingFor ?? null,
    party: (battle?.party ?? []).map((unit) => ({
      id: unit.id,
      instanceId: unit.instanceId,
      name: unit.name,
      hp: unit.hp,
      maxHp: unit.maxHp,
      affinities: unit.affinities,
      arts: artsOf(unit),
      fainted: isFainted(unit),
    })),
    foes: (battle?.foes ?? []).filter((unit) => !isFainted(unit)).map((unit) => ({
      id: unit.id,
      instanceId: unit.instanceId,
      name: unit.name,
      hp: unit.hp,
      maxHp: unit.maxHp,
      affinities: unit.affinities,
    })),
    offers: (slice.boonChoices ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      kind: row.kind,
      hint: formatBoonHint(row.kind, row.value),
    })),
    rerollCost: shop ? rerollCost(shop.wave, shop.rerolls, shop.lock ? shop.offers.map((row) => row.tier) : undefined) : 0,
    catchable: Boolean(slice.encounter?.catchable && battle?.kind === "wild"),
    kind: battle?.kind ?? (slice.encounter && slice.encounter.kind !== "wild" ? "trainer" : "wild"),
    activeIndex: battle?.activeIndex ?? 0,
    realmChoices: slice.realmChoices,
  };
}
