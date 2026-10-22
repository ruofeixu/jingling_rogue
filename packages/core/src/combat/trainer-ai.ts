import { affinityMod } from "./damage.ts";
import { getArt, loadTables } from "../tables/load-tables.ts";
import { STRUGGLE_ID } from "./effects/apply-art.ts";
import type { SpiritEntity } from "./spirit-entity.ts";

export function pickTrainerArt(user: SpiritEntity, target: SpiritEntity): string {
  const usable = user.artIds.filter((id) => (user.focusLeft[id] ?? 0) > 0);
  if (usable.length === 0) {
    return STRUGGLE_ID;
  }
  const chart = loadTables().typeChart;
  let best = usable[0];
  let bestScore = -Infinity;
  for (const artId of usable) {
    const art = getArt(artId);
    const damaging = art.effects.some((effect) => effect.kind === "damage" || effect.kind === "drain");
    const mul = damaging ? affinityMod(art.affinity, target.affinities, chart) : 0;
    const estimate = (art.power * user.atk * (user.level / 50)) / Math.max(target.def, 1);
    let score = mul * Math.max(art.power, 1);
    if (damaging && estimate * mul >= target.hp) {
      score += 1000;
    }
    if (score > bestScore) {
      bestScore = score;
      best = artId;
    }
  }
  return best;
}
