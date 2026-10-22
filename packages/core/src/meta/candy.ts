import type { AccountProgress } from "../run/run-session.ts";
import { evaluateAchievements } from "../run/achievements.ts";
import { grantSpeciesEgg } from "./eggs.ts";

const BASE_COST: Record<string, number> = {
  zao_li: 3,
  jing_zhu: 3,
  tao_geng: 3,
};

const CANDY_PRICE = 20;

export function baseCost(spiritId: string): number {
  return BASE_COST[spiritId] ?? 5;
}

export function currentCost(spiritId: string, account: AccountProgress): number {
  const down = account.costDown[spiritId] ?? 0;
  return Math.max(1, baseCost(spiritId) - down);
}

export function spendCandy(
  account: AccountProgress,
  spiritId: string,
  kind: "cost" | "pact" | "egg",
): void {
  const have = account.candy[spiritId] ?? 0;
  if (have < CANDY_PRICE) {
    throw new Error("not enough candy");
  }
  if (kind === "cost") {
    const next = (account.costDown[spiritId] ?? 0) + 1;
    if (baseCost(spiritId) - next < 1) {
      throw new Error("cost floor");
    }
    account.candy[spiritId] = have - CANDY_PRICE;
    account.costDown[spiritId] = next;
    evaluateAchievements(account, { type: "candy", kind });
    return;
  }
  if (kind === "pact") {
    account.candy[spiritId] = have - CANDY_PRICE;
    if (!account.secondPact.includes(spiritId)) {
      account.secondPact.push(spiritId);
    }
    evaluateAchievements(account, { type: "candy", kind });
    return;
  }
  if (!account.secondPact.includes(spiritId)) {
    throw new Error("need second pact");
  }
  account.candy[spiritId] = have - CANDY_PRICE;
  grantSpeciesEgg(account, spiritId, `candy-${spiritId}-${account.eggs.length}`);
  evaluateAchievements(account, { type: "candy", kind });
}

export function addCandy(account: AccountProgress, spiritId: string, amount: number): void {
  account.candy[spiritId] = (account.candy[spiritId] ?? 0) + amount;
}
