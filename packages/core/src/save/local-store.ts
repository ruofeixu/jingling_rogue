import { decodeAccount, decodeRun, encodeAccount, encodeRun } from "./codec.ts";
import type { AccountProgress, RunSession } from "../run/run-session.ts";

export interface KvStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

function assertSlot(slot: number): void {
  if (!Number.isInteger(slot) || slot < 0 || slot > 4) {
    throw new Error("slot must be 0-4");
  }
}

export async function saveRunLocal(
  store: KvStore,
  slot: number,
  run: RunSession,
): Promise<void> {
  assertSlot(slot);
  await store.set(`run:${slot}`, encodeRun(run));
}

export type SlotState = "empty" | "ok" | "corrupt";

/** 读一个槽并说明它能不能用。坏档（JSON 坏、版本不对）不抛错，标为 corrupt。 */
export async function inspectRunLocal(
  store: KvStore,
  slot: number,
): Promise<{ state: SlotState; run: RunSession | null }> {
  assertSlot(slot);
  const raw = await store.get(`run:${slot}`);
  if (!raw) {
    return { state: "empty", run: null };
  }
  try {
    return { state: "ok", run: decodeRun(raw) };
  } catch {
    return { state: "corrupt", run: null };
  }
}

export async function loadRunLocal(
  store: KvStore,
  slot: number,
): Promise<RunSession | null> {
  return (await inspectRunLocal(store, slot)).run;
}

/** 局已结束时清掉槽，避免读回一局打完的旅途。 */
export async function clearRunLocal(store: KvStore, slot: number): Promise<void> {
  assertSlot(slot);
  await store.set(`run:${slot}`, "");
}

export async function saveAccountLocal(
  store: KvStore,
  account: AccountProgress,
): Promise<void> {
  await store.set("account", encodeAccount(account));
}

/** 坏账号存档的备份键：回退为空账号前先把原文留在这里，不覆盖丢失。 */
export const CORRUPT_ACCOUNT_KEY = "account.corrupt";

export async function loadAccountLocal(
  store: KvStore,
): Promise<AccountProgress | null> {
  const raw = await store.get("account");
  if (!raw) {
    return null;
  }
  try {
    return decodeAccount(raw);
  } catch {
    await store.set(CORRUPT_ACCOUNT_KEY, raw);
    return null;
  }
}
