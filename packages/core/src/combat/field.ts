import type { Affinity } from "../tables/types.ts";
import type { SpiritEntity, Side } from "./spirit-entity.ts";

export type Omen =
  | "clear"
  | "sun"
  | "rain"
  | "sand"
  | "snow"
  | "fog"
  | "harsh_sun"
  | "heavy_rain"
  | "strong_wind";

export type Ley = "none" | "bolt" | "wood" | "mind" | "mist";
export type Hazard = "spikes" | "toxic_spikes" | "rocks" | "web";

export interface FieldState {
  omen: Omen;
  ley: Ley;
  hazards: { player: Hazard[]; foe: Hazard[] };
}

export function emptyField(): FieldState {
  return {
    omen: "clear",
    ley: "none",
    hazards: { player: [], foe: [] },
  };
}

export function omenMul(omen: Omen, artAffinity: Affinity): number {
  if (omen === "rain" || omen === "heavy_rain") {
    if (artAffinity === "tide") {
      return 1.5;
    }
    if (artAffinity === "flame") {
      return 0.5;
    }
  }
  if (omen === "sun" || omen === "harsh_sun") {
    if (artAffinity === "flame") {
      return 1.5;
    }
    if (artAffinity === "tide") {
      return 0.5;
    }
  }
  return 1;
}

export function leyMul(ley: Ley, artAffinity: Affinity): number {
  if (ley === "bolt" && artAffinity === "bolt") {
    return 1.3;
  }
  if (ley === "wood" && artAffinity === "wood") {
    return 1.3;
  }
  return 1;
}

export function applyHazards(unit: SpiritEntity, side: Side, field: FieldState): void {
  const spikes = field.hazards[side].filter((h) => h === "spikes").length;
  if (spikes <= 0 || unit.hp <= 0) {
    return;
  }
  const eighths = Math.min(3, spikes);
  const lost = Math.max(1, Math.floor((unit.maxHp * eighths) / 8));
  unit.hp = Math.max(0, unit.hp - lost);
}
