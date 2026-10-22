import { getSpirit, loadTables } from "../tables/load-tables.ts";
import type { Affinity } from "../tables/types.ts";
import { RngStream } from "../rng/rng-stream.ts";

export interface Fusion {
  primaryId: string;
  sacrificeId: string;
  affinities: Affinity[];
  artIds: string[];
  pactId: string;
}

export function fuse(primaryId: string, sacrificeId: string): Fusion {
  if (primaryId === sacrificeId) {
    throw new Error("need two spirits");
  }
  const primary = getSpirit(primaryId);
  const other = getSpirit(sacrificeId);
  return {
    primaryId,
    sacrificeId,
    affinities: [primary.affinities[0], other.affinities[0]],
    artIds: [...primary.artIds.slice(0, 2), ...other.artIds.slice(0, 2)],
    pactId: primary.pactId,
  };
}

export function unfuse(fusion: Fusion): string {
  return fusion.primaryId;
}

export function pickFusePartner(starterId: string, seed: string): string {
  const ids = loadTables()
    .spirits.map((row) => row.id)
    .filter((id) => id !== starterId);
  if (ids.length === 0) {
    throw new Error("need two spirits");
  }
  return ids[new RngStream(seed).child(3).int(ids.length)];
}
