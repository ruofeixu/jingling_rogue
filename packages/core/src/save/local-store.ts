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

export async function loadRunLocal(
  store: KvStore,
  slot: number,
): Promise<RunSession | null> {
  assertSlot(slot);
  const raw = await store.get(`run:${slot}`);
  return raw ? decodeRun(raw) : null;
}

export async function saveAccountLocal(
  store: KvStore,
  account: AccountProgress,
): Promise<void> {
  await store.set("account", encodeAccount(account));
}

export async function loadAccountLocal(
  store: KvStore,
): Promise<AccountProgress | null> {
  const raw = await store.get("account");
  return raw ? decodeAccount(raw) : null;
}
