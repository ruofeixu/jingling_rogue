import { RngStream } from "../rng/rng-stream.ts";

export interface MiasmaHost {
  id: string;
  miasma: boolean;
}

export function dailyMiasma(utcDate: string, caughtIds: string[]): string[] {
  const unique = Array.from(new Set(caughtIds));
  if (unique.length === 0) {
    return [];
  }
  const rng = new RngStream(`${utcDate}|miasma`);
  const picked: string[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (picked.length < Math.min(5, unique.length) && guard < 64) {
    const id = unique[rng.int(unique.length)];
    if (!used.has(id)) {
      used.add(id);
      picked.push(id);
    }
    guard += 1;
  }
  return picked;
}

export function spreadMiasma(party: MiasmaHost[]): void {
  if (!party.some((row) => row.miasma)) {
    return;
  }
  for (const row of party) {
    row.miasma = true;
  }
}

export function expMul(host: MiasmaHost): number {
  return host.miasma ? 1.5 : 1;
}
