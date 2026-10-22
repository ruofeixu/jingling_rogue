import { RngStream } from "../rng/rng-stream.ts";

export type NightMarkId =
  | "wound"
  | "ward"
  | "breath"
  | "cleanse"
  | "endure"
  | "numb"
  | "toxin"
  | "scorch"
  | "fuse";

export interface NightMark {
  id: NightMarkId;
  stacks: number;
}

const POOL: NightMarkId[] = [
  "wound",
  "ward",
  "breath",
  "cleanse",
  "endure",
  "numb",
  "toxin",
  "scorch",
  "fuse",
];

const STACK_CAP: Record<NightMarkId, number> = {
  wound: 999,
  ward: 999,
  breath: 10,
  cleanse: 10,
  endure: 10,
  numb: 10,
  toxin: 10,
  scorch: 10,
  fuse: 10,
};

export function expectedMarks(wave: number): number {
  return Math.floor(wave / 50);
}

export function addNightMark(marks: NightMark[], id: NightMarkId): NightMark[] {
  const cap = STACK_CAP[id];
  const found = marks.find((row) => row.id === id);
  if (found) {
    found.stacks = Math.min(cap, found.stacks + 1);
    return marks;
  }
  return [...marks, { id, stacks: 1 }];
}

export function grantMarkForWave(marks: NightMark[], wave: number, seed: string): NightMark[] {
  const need = expectedMarks(wave);
  const next = [...marks.map((row) => ({ ...row }))];
  let stacks = next.reduce((sum, row) => sum + row.stacks, 0);
  let step = 0;
  while (stacks < need) {
    const rng = new RngStream(seed).child(5000 + wave * 13 + step);
    const id = POOL[rng.int(POOL.length)];
    const updated = addNightMark(next, id);
    next.splice(0, next.length, ...updated);
    stacks = next.reduce((sum, row) => sum + row.stacks, 0);
    step += 1;
  }
  return next;
}
