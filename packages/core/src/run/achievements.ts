import rows from "../tables/achievements.json";
import { getSpirit, loadTables } from "../tables/load-tables.ts";
import type { AccountProgress } from "./run-session.ts";

export const ACH_CLEAR = "clear_classic";
export const ACH_CARRY_YOUNG = "carry_young";

export type AchWhen =
  | { type: "victory" }
  | { type: "baby" }
  | { type: "fuse" }
  | { type: "endless" }
  | { type: "catch"; count?: number }
  | { type: "seen"; count?: number }
  | { type: "hatch" }
  | { type: "candy"; kind?: "cost" | "pact" | "egg" }
  | { type: "daily"; wave?: number }
  | { type: "ribbon"; count?: number };

export interface AchRow {
  id: string;
  name: string;
  hidden: boolean;
  when: AchWhen;
}

export type AchEvent =
  | { type: "victory"; partyIds: string[]; mode?: string }
  | { type: "catch" }
  | { type: "seen" }
  | { type: "hatch" }
  | { type: "candy"; kind: "cost" | "pact" | "egg" }
  | { type: "daily"; wave: number }
  | { type: "ribbon" }
  | { type: "fuse" }
  | { type: "endless" };

const CATALOG = rows as AchRow[];

export function listAchievements(filter?: { hidden?: boolean }): AchRow[] {
  if (filter?.hidden === undefined) {
    return [...CATALOG];
  }
  return CATALOG.filter((row) => row.hidden === filter.hidden);
}

export function grantAchievement(account: AccountProgress, id: string): boolean {
  if (account.achievements.includes(id)) {
    return false;
  }
  account.achievements.push(id);
  return true;
}

export function partyHasBaby(partyIds: string[]): boolean {
  return partyIds.some((id) => Boolean(getSpirit(id).evolveTo));
}

function ribbonRoot(spiritId: string): string {
  const parent = new Map<string, string>();
  for (const row of loadTables().spirits) {
    if (row.evolveTo) {
      parent.set(row.evolveTo, row.id);
    }
  }
  let current = spiritId;
  const seen = new Set<string>();
  while (parent.has(current) && !seen.has(current)) {
    seen.add(current);
    current = parent.get(current) ?? current;
  }
  return current;
}

function matches(row: AchRow, account: AccountProgress, event: AchEvent): boolean {
  const when = row.when;
  if (when.type === "victory") {
    return event.type === "victory";
  }
  if (when.type === "baby") {
    return event.type === "victory" && partyHasBaby(event.partyIds);
  }
  if (when.type === "fuse") {
    return event.type === "fuse" || (event.type === "victory" && event.mode === "spliced") || account.fusedClear;
  }
  if (when.type === "endless") {
    return event.type === "endless";
  }
  if (when.type === "catch") {
    return (event.type === "catch" || event.type === "hatch" || event.type === "victory") && account.codex.length >= (when.count ?? 1);
  }
  if (when.type === "seen") {
    return (event.type === "catch" || event.type === "hatch" || event.type === "victory" || event.type === "seen") &&
      account.seenIds.length >= (when.count ?? 1);
  }
  if (when.type === "hatch") {
    return event.type === "hatch";
  }
  if (when.type === "candy") {
    return event.type === "candy" && (!when.kind || when.kind === event.kind);
  }
  if (when.type === "daily") {
    return event.type === "daily" && event.wave >= (when.wave ?? 1);
  }
  if (when.type === "ribbon") {
    return (event.type === "victory" || event.type === "ribbon") && account.ribbons.length >= (when.count ?? 1);
  }
  return false;
}

export function evaluateAchievements(account: AccountProgress, event: AchEvent): string[] {
  const granted: string[] = [];
  for (const row of CATALOG) {
    if (!matches(row, account, event)) {
      continue;
    }
    if (grantAchievement(account, row.id)) {
      granted.push(row.id);
      if (row.id === ACH_CARRY_YOUNG) {
        account.carryBaby = true;
      }
    }
  }
  return granted;
}

export function onRunVictory(account: AccountProgress, partyIds: string[], mode?: string): void {
  account.classicCleared = true;
  if (mode === "spliced") {
    account.fusedClear = true;
  }
  for (const id of partyIds) {
    const root = ribbonRoot(id);
    if (!account.ribbons.includes(root)) {
      account.ribbons.push(root);
    }
  }
  evaluateAchievements(account, { type: "victory", partyIds, mode });
}
