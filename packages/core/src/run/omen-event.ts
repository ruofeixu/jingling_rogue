import omens from "../tables/omens.json";
import type { RunSession } from "./run-session.ts";
import type { AccountProgress } from "./run-session.ts";

export interface OmenOption {
  label: string;
  gold?: number;
  heal?: boolean;
  bone?: number;
  battle?: boolean;
  pact?: boolean;
  voucher?: "fan" | "shang" | "te";
  fuse?: boolean;
  swap?: boolean;
  lost?: boolean;
  shop?: boolean;
  hp?: number;
  luck?: number;
  exp?: number;
  lockOmen?: boolean;
  dual?: boolean;
  temp?: boolean;
}

export interface OmenRow {
  id: string;
  kind: string;
  name: string;
  body: string;
  options: OmenOption[];
}

const ROWS = omens as OmenRow[];

export function listOmens(): OmenRow[] {
  return ROWS;
}

export function getOmen(id: string): OmenRow {
  const row = ROWS.find((item) => item.id === id);
  if (!row) {
    throw new Error(`unknown omen ${id}`);
  }
  return row;
}

export function applyOmenOption(run: RunSession, account: AccountProgress, omenId: string, optionIndex: number): OmenOption {
  const omen = getOmen(omenId);
  const option = omen.options[optionIndex];
  if (!option) {
    throw new Error("no option");
  }
  if (option.gold) {
    run.gold += option.gold;
  }
  if (option.heal) {
    run.partyHpRatios = run.partyHpRatios.map(() => 1);
  }
  if (option.luck) {
    run.luck = (run.luck ?? 0) + option.luck;
  }
  if (option.exp) {
    run.luck = (run.luck ?? 0) + option.exp;
  }
  if (option.dual) {
    run.forceDual = true;
  }
  if (option.voucher) {
    account.vouchers[option.voucher] += 1;
  }
  if (option.swap && run.partyIds.length > 1) {
    const last = run.partyIds.length - 1;
    const first = run.partyIds[0];
    run.partyIds[0] = run.partyIds[last];
    run.partyIds[last] = first;
  }
  return option;
}
