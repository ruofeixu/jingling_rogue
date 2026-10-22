import { SEAL_TIERS } from "../catch/seal.ts";

export const ICON_IDS = [
  "potion",
  "candy",
  "gold",
  "egg",
  "charm",
  "atk",
  "def",
  "spd",
  "hp",
  "exp",
  "catch",
  "map",
  "lure",
  "seal-fan",
  "seal-shang",
  "seal-te",
  "seal-qi",
  "seal-jie",
] as const;

export type ItemIconId = (typeof ICON_IDS)[number];

/** Shared by every renderer so an icon keeps one colour across backends. */
const FILL: Record<ItemIconId, readonly [number, number, number]> = {
  potion: [88, 168, 92],
  candy: [220, 96, 112],
  gold: [255, 138, 74],
  egg: [232, 212, 164],
  charm: [168, 132, 212],
  atk: [196, 72, 48],
  def: [140, 108, 72],
  spd: [196, 164, 48],
  hp: [88, 196, 92],
  exp: [96, 148, 196],
  catch: [196, 96, 64],
  map: [72, 140, 108],
  lure: [168, 112, 176],
  "seal-fan": [168, 140, 96],
  "seal-shang": [176, 120, 64],
  "seal-te": [196, 72, 56],
  "seal-qi": [88, 156, 128],
  "seal-jie": [148, 116, 196],
};

export function iconFill(kind: ItemIconId): readonly [number, number, number] {
  return FILL[kind];
}

const RELIC: Record<string, ItemIconId> = {
  atk: "atk",
  def: "def",
  spd: "spd",
  hp: "hp",
  exp: "exp",
  gold: "gold",
  catch: "catch",
  map: "map",
  lure: "lure",
  potion: "potion",
  sealPack: "seal-fan",
};

export function sealIcon(tierId: string): ItemIconId {
  const known = SEAL_TIERS.find((row) => row.id === tierId);
  return known ? (`seal-${known.id}` as ItemIconId) : "seal-fan";
}

export function itemIcon(kind: string): ItemIconId {
  if (kind === "candy") {
    return "candy";
  }
  if (kind === "egg") {
    return "egg";
  }
  if (kind === "charm") {
    return "charm";
  }
  if (kind.startsWith("seal-")) {
    return sealIcon(kind.slice(5));
  }
  return RELIC[kind] ?? "charm";
}
