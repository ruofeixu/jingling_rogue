import { loadTables } from "../tables/load-tables.ts";
import type { Affinity, PactHook } from "../tables/types.ts";
import type { SpiritEntity } from "./spirit-entity.ts";

export const HIDDEN_PACT_BOON = "hidden_pact_charm";

export function hiddenPactOn(opts: {
  boonIds?: string[];
  secondPact?: string[];
  spiritId?: string;
}): boolean {
  if (opts.boonIds?.includes(HIDDEN_PACT_BOON)) {
    return true;
  }
  return Boolean(opts.spiritId && opts.secondPact?.includes(opts.spiritId));
}

function hooksFor(pactId: string, hidden: boolean): PactHook[] {
  const pact = loadTables().pacts.find((row) => row.id === pactId);
  if (!pact) {
    return [];
  }
  if (!hidden) {
    return pact.hooks ?? [];
  }
  return [...(pact.hooks ?? []), ...(pact.hiddenHooks ?? [])];
}

export function pactDealMul(pactId: string, artAffinity: Affinity, hidden = false): number {
  return hooksFor(pactId, hidden).reduce((mul, hook) => {
    if (hook.when !== "deal") {
      return mul;
    }
    if (hook.affinity && hook.affinity !== artAffinity) {
      return mul;
    }
    return mul * hook.mul;
  }, 1);
}

export function pactTakeMul(pactId: string, hidden = false): number {
  return hooksFor(pactId, hidden).reduce((mul, hook) => (hook.when === "take" ? mul * hook.mul : mul), 1);
}

export function applyPactSwitch(unit: SpiritEntity): void {
  for (const hook of hooksFor(unit.pactId, unit.hiddenPact)) {
    if (hook.when === "switchIn") {
      unit.stages[hook.stat] = Math.max(-6, Math.min(6, unit.stages[hook.stat] + hook.delta));
    }
  }
}
