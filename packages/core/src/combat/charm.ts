import { isFainted, type CharmId, type SpiritEntity } from "./spirit-entity.ts";

export type { CharmId };

export function tickCharms(unit: SpiritEntity): void {
  if (isFainted(unit) || !unit.charms.includes("meal")) {
    return;
  }
  const heal = Math.max(1, Math.floor(unit.maxHp / 16));
  unit.hp = Math.min(unit.maxHp, unit.hp + heal);
}
