export type Affinity =
  | "flame"
  | "tide"
  | "stone"
  | "wood"
  | "bolt"
  | "frost"
  | "shade"
  | "light";

export type ArtEffect =
  | { kind: "damage"; hits?: number }
  | { kind: "heal"; ratio: number }
  | { kind: "drain"; ratio: number }
  | { kind: "status"; status: "burn" | "poison" | "toxic" | "paralyze"; chance?: number }
  | { kind: "stage"; stat: "atk" | "def" | "spd"; delta: number; on: "user" | "target" }
  | { kind: "guard" }
  | { kind: "substitute" };

export interface SpiritRow {
  id: string;
  name: string;
  affinities: Affinity[];
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  artIds: string[];
  pactId: string;
  evolveTo?: string;
  starter: boolean;
  realm: string;
}

export interface ArtRow {
  id: string;
  name: string;
  affinity: Affinity;
  power: number;
  focus: number;
  effects: ArtEffect[];
}

export type PactHook =
  | { when: "deal"; affinity?: Affinity; mul: number }
  | { when: "take"; mul: number }
  | { when: "switchIn"; stat: "atk" | "def" | "spd"; delta: number };

export interface PactRow {
  id: string;
  name: string;
  description: string;
  hooks?: PactHook[];
  hiddenHooks?: PactHook[];
}

export type ShopTier = "fan" | "shang" | "te" | "qi" | "jie";

export type BoonKind =
  | "atk"
  | "def"
  | "spd"
  | "hp"
  | "catch"
  | "gold"
  | "exp"
  | "potion"
  | "map"
  | "lure"
  | "revive"
  | "sealPack"
  | "evolve"
  | "form"
  | "formItem"
  | "hiddenPact"
  | "cleanse"
  | "ether"
  | "candy"
  | "vitamin"
  | "mint"
  | "ppUp"
  | "ppMax"
  | "warToken"
  | "tm"
  | "splicer"
  | "unsplice"
  | "voucher"
  | "fruit"
  | "typeBoost"
  | "speciesBoost"
  | "charm"
  | "passive";

export interface BoonRow {
  id: string;
  name: string;
  kind: BoonKind;
  value: number;
  weight: number;
  tier?: ShopTier;
  slot?: number;
  tag?: string;
}

export interface RealmRow {
  id: string;
  name: string;
  spiritIds: string[];
}

export type TypeChart = Record<Affinity, Record<Affinity, number>>;

export interface GameTables {
  spirits: SpiritRow[];
  arts: ArtRow[];
  pacts: PactRow[];
  boons: BoonRow[];
  realms: RealmRow[];
  typeChart: TypeChart;
}
