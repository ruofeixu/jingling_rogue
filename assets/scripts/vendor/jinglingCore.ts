/* generated from packages/core — do not edit */

// src/combat/damage.ts
function affinityMod(artAffinity, defender, chart, invert = false) {
  const raw = defender.reduce((acc, d) => acc * chart[artAffinity][d], 1);
  if (!invert) {
    return raw;
  }
  if (raw === 0 || raw === 0.5) {
    return 2;
  }
  if (raw === 2) {
    return 0.5;
  }
  return raw;
}
function clampAffinity(mod, range) {
  if (!range || mod === 0) {
    return mod;
  }
  return Math.min(range.max, Math.max(range.min, mod));
}
function calcDamage(opts) {
  if (opts.power <= 0) {
    return 0;
  }
  const levelScale = opts.level / 50;
  const base = opts.power * opts.atk / Math.max(opts.def, 1) * levelScale + 2;
  const roll = 0.85 + opts.rng.float() * 0.15;
  return Math.max(1, Math.floor(base * opts.affinityMod * roll * opts.boneMod));
}

// src/tables/arts.json
var arts_default = [
  {
    id: "cinder_claw",
    name: "\u7076\u722A",
    affinity: "flame",
    power: 40,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "ash_veil",
    name: "\u7070\u5E54",
    affinity: "flame",
    power: 20,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "kiln_burst",
    name: "\u7A91\u7206",
    affinity: "flame",
    power: 35,
    focus: 10,
    effects: [
      {
        kind: "damage",
        hits: 2
      }
    ]
  },
  {
    id: "well_thread",
    name: "\u4E95\u4E1D",
    affinity: "tide",
    power: 35,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "drip_fang",
    name: "\u6EF4\u7259",
    affinity: "tide",
    power: 45,
    focus: 20,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "status",
        status: "toxic",
        chance: 1
      }
    ]
  },
  {
    id: "tide_lash",
    name: "\u6F6E\u97AD",
    affinity: "tide",
    power: 65,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "peach_strike",
    name: "\u6843\u51FB",
    affinity: "wood",
    power: 40,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "ward_bark",
    name: "\u62A4\u76AE",
    affinity: "wood",
    power: 0,
    focus: 15,
    effects: [
      {
        kind: "heal",
        ratio: 0.25
      }
    ]
  },
  {
    id: "mask_slam",
    name: "\u50A9\u649E",
    affinity: "wood",
    power: 60,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "pebble_toss",
    name: "\u6295\u783E",
    affinity: "stone",
    power: 35,
    focus: 30,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "ridge_guard",
    name: "\u5CAD\u536B",
    affinity: "stone",
    power: 20,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "crag_fall",
    name: "\u5D82\u843D",
    affinity: "stone",
    power: 75,
    focus: 8,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "spark_cut",
    name: "\u7535\u526A",
    affinity: "bolt",
    power: 40,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "static_web",
    name: "\u9759\u7F51",
    affinity: "bolt",
    power: 30,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "thunder_coil",
    name: "\u96F7\u7EDE",
    affinity: "bolt",
    power: 70,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "rime_needle",
    name: "\u971C\u9488",
    affinity: "frost",
    power: 40,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "chill_dust",
    name: "\u5BD2\u7C89",
    affinity: "frost",
    power: 25,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "glacier_silk",
    name: "\u51B0\u7F2B",
    affinity: "frost",
    power: 65,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "ink_swipe",
    name: "\u58A8\u626B",
    affinity: "shade",
    power: 40,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "shade_nudge",
    name: "\u5F71\u63A8",
    affinity: "shade",
    power: 30,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "wail_mark",
    name: "\u591C\u8BB0",
    affinity: "shade",
    power: 65,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "lamp_dust",
    name: "\u706F\u5C51",
    affinity: "light",
    power: 35,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "halo_cut",
    name: "\u6655\u88C1",
    affinity: "light",
    power: 45,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "solar_bead",
    name: "\u65E5\u73E0",
    affinity: "light",
    power: 70,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "hearth_spit",
    name: "\u7076\u553E",
    affinity: "flame",
    power: 50,
    focus: 15,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "status",
        status: "burn",
        chance: 1
      }
    ]
  },
  {
    id: "cistern_pull",
    name: "\u6C72\u4E95",
    affinity: "tide",
    power: 50,
    focus: 15,
    effects: [
      {
        kind: "drain",
        ratio: 0.5
      }
    ]
  },
  {
    id: "root_snare",
    name: "\u6839\u7ECA",
    affinity: "wood",
    power: 50,
    focus: 15,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "stage",
        stat: "spd",
        delta: -1,
        on: "target"
      }
    ]
  },
  {
    id: "millstone",
    name: "\u78E8\u76D8",
    affinity: "stone",
    power: 55,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "bell_spark",
    name: "\u94C3\u706B",
    affinity: "bolt",
    power: 55,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "snow_bite",
    name: "\u96EA\u556E",
    affinity: "frost",
    power: 55,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "ledger_cut",
    name: "\u7C3F\u88C1",
    affinity: "shade",
    power: 55,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "wick_flare",
    name: "\u82AF\u7130",
    affinity: "light",
    power: 55,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "clay_shot",
    name: "\u9676\u4E38",
    affinity: "stone",
    power: 45,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "lotus_slap",
    name: "\u8377\u62CD",
    affinity: "wood",
    power: 45,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "paper_edge",
    name: "\u7EB8\u5203",
    affinity: "shade",
    power: 45,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "bronze_hum",
    name: "\u94DC\u9E23",
    affinity: "light",
    power: 45,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "ember_mend",
    name: "\u70EC\u517B",
    affinity: "flame",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "heal",
        ratio: 0.3
      }
    ]
  },
  {
    id: "spring_mend",
    name: "\u6CC9\u517B",
    affinity: "tide",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "heal",
        ratio: 0.3
      }
    ]
  },
  {
    id: "grove_mend",
    name: "\u6797\u517B",
    affinity: "wood",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "heal",
        ratio: 0.3
      }
    ]
  },
  {
    id: "dawn_mend",
    name: "\u6653\u517B",
    affinity: "light",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "heal",
        ratio: 0.3
      }
    ]
  },
  {
    id: "twin_peck",
    name: "\u8FDE\u5544",
    affinity: "wood",
    power: 15,
    focus: 15,
    effects: [
      {
        kind: "damage",
        hits: 3
      }
    ]
  },
  {
    id: "veil_guard",
    name: "\u5E55\u5B88",
    affinity: "stone",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "life_sip",
    name: "\u6C72\u547D",
    affinity: "shade",
    power: 60,
    focus: 10,
    effects: [
      {
        kind: "drain",
        ratio: 0.5
      }
    ]
  },
  {
    id: "decoy_paper",
    name: "\u7EB8\u4FD1",
    affinity: "shade",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "substitute"
      }
    ]
  },
  {
    id: "cinder_rain",
    name: "\u70AD\u96E8",
    affinity: "flame",
    power: 20,
    focus: 15,
    effects: [
      {
        kind: "damage",
        hits: 2
      }
    ]
  },
  {
    id: "soot_brand",
    name: "\u7070\u5370",
    affinity: "flame",
    power: 40,
    focus: 15,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "status",
        status: "burn",
        chance: 0.3
      }
    ]
  },
  {
    id: "kiln_guard",
    name: "\u7A91\u5B88",
    affinity: "flame",
    power: 0,
    focus: 12,
    effects: [
      {
        kind: "stage",
        stat: "def",
        delta: 1,
        on: "user"
      }
    ]
  },
  {
    id: "hearth_drain",
    name: "\u7076\u6C72",
    affinity: "flame",
    power: 45,
    focus: 12,
    effects: [
      {
        kind: "drain",
        ratio: 0.4
      }
    ]
  },
  {
    id: "well_coil",
    name: "\u4E95\u7EDE",
    affinity: "tide",
    power: 18,
    focus: 15,
    effects: [
      {
        kind: "damage",
        hits: 2
      }
    ]
  },
  {
    id: "mire_spit",
    name: "\u6DD6\u553E",
    affinity: "tide",
    power: 40,
    focus: 15,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "status",
        status: "poison",
        chance: 0.3
      }
    ]
  },
  {
    id: "tide_guard",
    name: "\u6F6E\u5B88",
    affinity: "tide",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "foam_veil",
    name: "\u6CAB\u5E55",
    affinity: "tide",
    power: 0,
    focus: 12,
    effects: [
      {
        kind: "stage",
        stat: "spd",
        delta: 1,
        on: "user"
      }
    ]
  },
  {
    id: "bark_spike",
    name: "\u76AE\u523A",
    affinity: "wood",
    power: 40,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "leaf_bind",
    name: "\u53F6\u7F1A",
    affinity: "wood",
    power: 35,
    focus: 15,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "stage",
        stat: "atk",
        delta: -1,
        on: "target"
      }
    ]
  },
  {
    id: "grove_guard",
    name: "\u6797\u5B88",
    affinity: "wood",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "sap_sip",
    name: "\u6DB2\u6C72",
    affinity: "wood",
    power: 50,
    focus: 12,
    effects: [
      {
        kind: "drain",
        ratio: 0.5
      }
    ]
  },
  {
    id: "gravel_burst",
    name: "\u783E\u7206",
    affinity: "stone",
    power: 18,
    focus: 15,
    effects: [
      {
        kind: "damage",
        hits: 2
      }
    ]
  },
  {
    id: "stone_stare",
    name: "\u5CA9\u51DD",
    affinity: "stone",
    power: 0,
    focus: 15,
    effects: [
      {
        kind: "stage",
        stat: "atk",
        delta: -2,
        on: "target"
      }
    ]
  },
  {
    id: "cairn_guard",
    name: "\u51A2\u5B88",
    affinity: "stone",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "slate_sub",
    name: "\u7891\u4FD1",
    affinity: "stone",
    power: 0,
    focus: 8,
    effects: [
      {
        kind: "substitute"
      }
    ]
  },
  {
    id: "spark_fan",
    name: "\u7535\u6247",
    affinity: "bolt",
    power: 18,
    focus: 15,
    effects: [
      {
        kind: "damage",
        hits: 2
      }
    ]
  },
  {
    id: "static_bite",
    name: "\u9759\u566C",
    affinity: "bolt",
    power: 40,
    focus: 15,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "status",
        status: "paralyze",
        chance: 0.3
      }
    ]
  },
  {
    id: "coil_guard",
    name: "\u7EDE\u5B88",
    affinity: "bolt",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "wire_sip",
    name: "\u4E1D\u6C72",
    affinity: "bolt",
    power: 50,
    focus: 12,
    effects: [
      {
        kind: "drain",
        ratio: 0.4
      }
    ]
  },
  {
    id: "frost_needles",
    name: "\u971C\u7C07",
    affinity: "frost",
    power: 15,
    focus: 15,
    effects: [
      {
        kind: "damage",
        hits: 3
      }
    ]
  },
  {
    id: "rime_brand",
    name: "\u51B0\u5370",
    affinity: "frost",
    power: 40,
    focus: 15,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "stage",
        stat: "spd",
        delta: -1,
        on: "target"
      }
    ]
  },
  {
    id: "ice_guard",
    name: "\u51B0\u5B88",
    affinity: "frost",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "hail_sip",
    name: "\u96F9\u6C72",
    affinity: "frost",
    power: 50,
    focus: 12,
    effects: [
      {
        kind: "drain",
        ratio: 0.4
      }
    ]
  },
  {
    id: "ink_spray",
    name: "\u58A8\u6E85",
    affinity: "shade",
    power: 18,
    focus: 15,
    effects: [
      {
        kind: "damage",
        hits: 2
      }
    ]
  },
  {
    id: "night_bind",
    name: "\u591C\u7F1A",
    affinity: "shade",
    power: 40,
    focus: 15,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "status",
        status: "poison",
        chance: 0.3
      }
    ]
  },
  {
    id: "shade_guard",
    name: "\u5F71\u5B88",
    affinity: "shade",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "ghost_sub",
    name: "\u9B42\u4FD1",
    affinity: "shade",
    power: 0,
    focus: 8,
    effects: [
      {
        kind: "substitute"
      }
    ]
  },
  {
    id: "lamp_burst",
    name: "\u706F\u7206",
    affinity: "light",
    power: 55,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "halo_guard",
    name: "\u6655\u5B88",
    affinity: "light",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "bead_rain",
    name: "\u73E0\u96E8",
    affinity: "light",
    power: 18,
    focus: 15,
    effects: [
      {
        kind: "damage",
        hits: 2
      }
    ]
  },
  {
    id: "wick_sip",
    name: "\u82AF\u6C72",
    affinity: "light",
    power: 50,
    focus: 12,
    effects: [
      {
        kind: "drain",
        ratio: 0.4
      }
    ]
  },
  {
    id: "clay_bind",
    name: "\u9676\u7F1A",
    affinity: "stone",
    power: 40,
    focus: 15,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "stage",
        stat: "def",
        delta: -1,
        on: "target"
      }
    ]
  },
  {
    id: "lotus_drain",
    name: "\u8377\u6C72",
    affinity: "wood",
    power: 45,
    focus: 12,
    effects: [
      {
        kind: "drain",
        ratio: 0.5
      }
    ]
  },
  {
    id: "paper_guard",
    name: "\u7EB8\u5B88",
    affinity: "shade",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "bronze_guard",
    name: "\u94DC\u5B88",
    affinity: "light",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "ember_stack",
    name: "\u70EC\u53E0",
    affinity: "flame",
    power: 12,
    focus: 12,
    effects: [
      {
        kind: "damage",
        hits: 4
      }
    ]
  },
  {
    id: "spring_coil",
    name: "\u6CC9\u7EDE",
    affinity: "tide",
    power: 55,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "grove_spike",
    name: "\u6797\u523A",
    affinity: "wood",
    power: 55,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "void_cannon",
    name: "\u5F52\u589F\u70AE",
    affinity: "bolt",
    power: 80,
    focus: 5,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_1",
    name: "\u95F2\u672F1",
    affinity: "tide",
    power: 31,
    focus: 11,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_2",
    name: "\u95F2\u672F2",
    affinity: "stone",
    power: 32,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_3",
    name: "\u95F2\u672F3",
    affinity: "wood",
    power: 33,
    focus: 13,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_4",
    name: "\u95F2\u672F4",
    affinity: "bolt",
    power: 34,
    focus: 14,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_5",
    name: "\u95F2\u672F5",
    affinity: "frost",
    power: 35,
    focus: 15,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_6",
    name: "\u95F2\u672F6",
    affinity: "shade",
    power: 36,
    focus: 16,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_7",
    name: "\u95F2\u672F7",
    affinity: "light",
    power: 37,
    focus: 17,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_8",
    name: "\u95F2\u672F8",
    affinity: "flame",
    power: 38,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_9",
    name: "\u95F2\u672F9",
    affinity: "tide",
    power: 39,
    focus: 19,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_10",
    name: "\u95F2\u672F10",
    affinity: "stone",
    power: 40,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_11",
    name: "\u95F2\u672F11",
    affinity: "wood",
    power: 41,
    focus: 21,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_12",
    name: "\u95F2\u672F12",
    affinity: "bolt",
    power: 42,
    focus: 22,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_13",
    name: "\u95F2\u672F13",
    affinity: "frost",
    power: 43,
    focus: 23,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_14",
    name: "\u95F2\u672F14",
    affinity: "shade",
    power: 44,
    focus: 24,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_15",
    name: "\u95F2\u672F15",
    affinity: "light",
    power: 45,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_16",
    name: "\u95F2\u672F16",
    affinity: "flame",
    power: 46,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_17",
    name: "\u95F2\u672F17",
    affinity: "tide",
    power: 47,
    focus: 11,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_18",
    name: "\u95F2\u672F18",
    affinity: "stone",
    power: 48,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_19",
    name: "\u95F2\u672F19",
    affinity: "wood",
    power: 49,
    focus: 13,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_20",
    name: "\u95F2\u672F20",
    affinity: "bolt",
    power: 50,
    focus: 14,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_21",
    name: "\u95F2\u672F21",
    affinity: "frost",
    power: 51,
    focus: 15,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_22",
    name: "\u95F2\u672F22",
    affinity: "shade",
    power: 52,
    focus: 16,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_23",
    name: "\u95F2\u672F23",
    affinity: "light",
    power: 53,
    focus: 17,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_24",
    name: "\u95F2\u672F24",
    affinity: "flame",
    power: 54,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_25",
    name: "\u95F2\u672F25",
    affinity: "tide",
    power: 55,
    focus: 19,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_26",
    name: "\u95F2\u672F26",
    affinity: "stone",
    power: 56,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_27",
    name: "\u95F2\u672F27",
    affinity: "wood",
    power: 57,
    focus: 21,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_28",
    name: "\u95F2\u672F28",
    affinity: "bolt",
    power: 58,
    focus: 22,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_29",
    name: "\u95F2\u672F29",
    affinity: "frost",
    power: 59,
    focus: 23,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_30",
    name: "\u95F2\u672F30",
    affinity: "shade",
    power: 60,
    focus: 24,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_31",
    name: "\u95F2\u672F31",
    affinity: "light",
    power: 61,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_32",
    name: "\u95F2\u672F32",
    affinity: "flame",
    power: 62,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_33",
    name: "\u95F2\u672F33",
    affinity: "tide",
    power: 63,
    focus: 11,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_34",
    name: "\u95F2\u672F34",
    affinity: "stone",
    power: 64,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_35",
    name: "\u95F2\u672F35",
    affinity: "wood",
    power: 65,
    focus: 13,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_36",
    name: "\u95F2\u672F36",
    affinity: "bolt",
    power: 66,
    focus: 14,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_37",
    name: "\u95F2\u672F37",
    affinity: "frost",
    power: 67,
    focus: 15,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_38",
    name: "\u95F2\u672F38",
    affinity: "shade",
    power: 68,
    focus: 16,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_39",
    name: "\u95F2\u672F39",
    affinity: "light",
    power: 69,
    focus: 17,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_40",
    name: "\u95F2\u672F40",
    affinity: "flame",
    power: 30,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_41",
    name: "\u95F2\u672F41",
    affinity: "tide",
    power: 31,
    focus: 19,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_42",
    name: "\u95F2\u672F42",
    affinity: "stone",
    power: 32,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_43",
    name: "\u95F2\u672F43",
    affinity: "wood",
    power: 33,
    focus: 21,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_44",
    name: "\u95F2\u672F44",
    affinity: "bolt",
    power: 34,
    focus: 22,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_45",
    name: "\u95F2\u672F45",
    affinity: "frost",
    power: 35,
    focus: 23,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_46",
    name: "\u95F2\u672F46",
    affinity: "shade",
    power: 36,
    focus: 24,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_47",
    name: "\u95F2\u672F47",
    affinity: "light",
    power: 37,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_48",
    name: "\u95F2\u672F48",
    affinity: "flame",
    power: 38,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_49",
    name: "\u95F2\u672F49",
    affinity: "tide",
    power: 39,
    focus: 11,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_50",
    name: "\u95F2\u672F50",
    affinity: "stone",
    power: 40,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_51",
    name: "\u95F2\u672F51",
    affinity: "wood",
    power: 41,
    focus: 13,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_52",
    name: "\u95F2\u672F52",
    affinity: "bolt",
    power: 42,
    focus: 14,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_53",
    name: "\u95F2\u672F53",
    affinity: "frost",
    power: 43,
    focus: 15,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_54",
    name: "\u95F2\u672F54",
    affinity: "shade",
    power: 44,
    focus: 16,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_55",
    name: "\u95F2\u672F55",
    affinity: "light",
    power: 45,
    focus: 17,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_56",
    name: "\u95F2\u672F56",
    affinity: "flame",
    power: 46,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_57",
    name: "\u95F2\u672F57",
    affinity: "tide",
    power: 47,
    focus: 19,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_58",
    name: "\u95F2\u672F58",
    affinity: "stone",
    power: 48,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_59",
    name: "\u95F2\u672F59",
    affinity: "wood",
    power: 49,
    focus: 21,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_60",
    name: "\u95F2\u672F60",
    affinity: "bolt",
    power: 50,
    focus: 22,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_61",
    name: "\u95F2\u672F61",
    affinity: "frost",
    power: 51,
    focus: 23,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_62",
    name: "\u95F2\u672F62",
    affinity: "shade",
    power: 52,
    focus: 24,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_63",
    name: "\u95F2\u672F63",
    affinity: "light",
    power: 53,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_64",
    name: "\u95F2\u672F64",
    affinity: "flame",
    power: 54,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_65",
    name: "\u95F2\u672F65",
    affinity: "tide",
    power: 55,
    focus: 11,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_66",
    name: "\u95F2\u672F66",
    affinity: "stone",
    power: 56,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_67",
    name: "\u95F2\u672F67",
    affinity: "wood",
    power: 57,
    focus: 13,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_68",
    name: "\u95F2\u672F68",
    affinity: "bolt",
    power: 58,
    focus: 14,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_69",
    name: "\u95F2\u672F69",
    affinity: "frost",
    power: 59,
    focus: 15,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_70",
    name: "\u95F2\u672F70",
    affinity: "shade",
    power: 60,
    focus: 16,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_71",
    name: "\u95F2\u672F71",
    affinity: "light",
    power: 61,
    focus: 17,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_72",
    name: "\u95F2\u672F72",
    affinity: "flame",
    power: 62,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_73",
    name: "\u95F2\u672F73",
    affinity: "tide",
    power: 63,
    focus: 19,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_74",
    name: "\u95F2\u672F74",
    affinity: "stone",
    power: 64,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_75",
    name: "\u95F2\u672F75",
    affinity: "wood",
    power: 65,
    focus: 21,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_76",
    name: "\u95F2\u672F76",
    affinity: "bolt",
    power: 66,
    focus: 22,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_77",
    name: "\u95F2\u672F77",
    affinity: "frost",
    power: 67,
    focus: 23,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_78",
    name: "\u95F2\u672F78",
    affinity: "shade",
    power: 68,
    focus: 24,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_79",
    name: "\u95F2\u672F79",
    affinity: "light",
    power: 69,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_80",
    name: "\u95F2\u672F80",
    affinity: "flame",
    power: 30,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_81",
    name: "\u95F2\u672F81",
    affinity: "tide",
    power: 31,
    focus: 11,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_82",
    name: "\u95F2\u672F82",
    affinity: "stone",
    power: 32,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_83",
    name: "\u95F2\u672F83",
    affinity: "wood",
    power: 33,
    focus: 13,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_84",
    name: "\u95F2\u672F84",
    affinity: "bolt",
    power: 34,
    focus: 14,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_85",
    name: "\u95F2\u672F85",
    affinity: "frost",
    power: 35,
    focus: 15,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_86",
    name: "\u95F2\u672F86",
    affinity: "shade",
    power: 36,
    focus: 16,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_87",
    name: "\u95F2\u672F87",
    affinity: "light",
    power: 37,
    focus: 17,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_88",
    name: "\u95F2\u672F88",
    affinity: "flame",
    power: 38,
    focus: 18,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_89",
    name: "\u95F2\u672F89",
    affinity: "tide",
    power: 39,
    focus: 19,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_90",
    name: "\u95F2\u672F90",
    affinity: "stone",
    power: 40,
    focus: 20,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_91",
    name: "\u95F2\u672F91",
    affinity: "wood",
    power: 41,
    focus: 21,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_92",
    name: "\u95F2\u672F92",
    affinity: "bolt",
    power: 42,
    focus: 22,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_93",
    name: "\u95F2\u672F93",
    affinity: "frost",
    power: 43,
    focus: 23,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_94",
    name: "\u95F2\u672F94",
    affinity: "shade",
    power: 44,
    focus: 24,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_95",
    name: "\u95F2\u672F95",
    affinity: "light",
    power: 45,
    focus: 25,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "catalog_art_96",
    name: "\u95F2\u672F96",
    affinity: "flame",
    power: 46,
    focus: 10,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "kiln_gate",
    name: "\u7A91\u95E8",
    affinity: "flame",
    power: 0,
    focus: 16,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "ember_sip",
    name: "\u4F59\u70EC\u6C72",
    affinity: "flame",
    power: 40,
    focus: 12,
    effects: [
      {
        kind: "drain",
        ratio: 0.5
      }
    ]
  },
  {
    id: "kiln_heart",
    name: "\u7076\u5FC3\u7206",
    affinity: "flame",
    power: 25,
    focus: 10,
    effects: [
      {
        kind: "damage",
        hits: 2
      }
    ]
  },
  {
    id: "well_flood",
    name: "\u4E95\u6EE1",
    affinity: "tide",
    power: 0,
    focus: 12,
    effects: [
      {
        kind: "heal",
        ratio: 0.5
      }
    ]
  },
  {
    id: "triple_tide",
    name: "\u6F6E\u4E09\u53E0",
    affinity: "tide",
    power: 20,
    focus: 8,
    effects: [
      {
        kind: "damage",
        hits: 3
      }
    ]
  },
  {
    id: "mire_toxin",
    name: "\u6D4A\u6CBC",
    affinity: "tide",
    power: 30,
    focus: 16,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "status",
        status: "poison",
        chance: 1
      }
    ]
  },
  {
    id: "stele_press",
    name: "\u7891\u538B",
    affinity: "stone",
    power: 0,
    focus: 16,
    effects: [
      {
        kind: "stage",
        stat: "def",
        delta: 1,
        on: "user"
      }
    ]
  },
  {
    id: "cliff_fang",
    name: "\u88C2\u5D16\u7259",
    affinity: "stone",
    power: 55,
    focus: 14,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "mount_palm",
    name: "\u9547\u5CB3\u638C",
    affinity: "stone",
    power: 70,
    focus: 8,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "peach_rain",
    name: "\u6843\u523A\u96E8",
    affinity: "wood",
    power: 25,
    focus: 12,
    effects: [
      {
        kind: "damage",
        hits: 2
      }
    ]
  },
  {
    id: "grove_breath",
    name: "\u6797\u606F",
    affinity: "wood",
    power: 0,
    focus: 12,
    effects: [
      {
        kind: "heal",
        ratio: 0.4
      }
    ]
  },
  {
    id: "vine_bind",
    name: "\u8513\u7F1A",
    affinity: "wood",
    power: 0,
    focus: 16,
    effects: [
      {
        kind: "stage",
        stat: "atk",
        delta: -1,
        on: "target"
      }
    ]
  },
  {
    id: "gold_thread",
    name: "\u91D1\u7EBF\u523A",
    affinity: "bolt",
    power: 50,
    focus: 16,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "numb_web",
    name: "\u9EBB\u7EDC",
    affinity: "bolt",
    power: 35,
    focus: 12,
    effects: [
      {
        kind: "damage"
      },
      {
        kind: "status",
        status: "paralyze",
        chance: 1
      }
    ]
  },
  {
    id: "frost_seal",
    name: "\u971C\u5C01",
    affinity: "frost",
    power: 0,
    focus: 16,
    effects: [
      {
        kind: "stage",
        stat: "spd",
        delta: -1,
        on: "target"
      }
    ]
  },
  {
    id: "cold_tooth",
    name: "\u5BD2\u9F7F",
    affinity: "frost",
    power: 55,
    focus: 14,
    effects: [
      {
        kind: "damage"
      }
    ]
  },
  {
    id: "shade_stand",
    name: "\u5F71\u66FF",
    affinity: "shade",
    power: 0,
    focus: 10,
    effects: [
      {
        kind: "substitute"
      }
    ]
  },
  {
    id: "ink_sip",
    name: "\u58A8\u566C",
    affinity: "shade",
    power: 40,
    focus: 12,
    effects: [
      {
        kind: "drain",
        ratio: 0.5
      }
    ]
  },
  {
    id: "lamp_guard",
    name: "\u706F\u5B88",
    affinity: "light",
    power: 0,
    focus: 16,
    effects: [
      {
        kind: "guard"
      }
    ]
  },
  {
    id: "pale_blade",
    name: "\u7693\u5203",
    affinity: "light",
    power: 60,
    focus: 12,
    effects: [
      {
        kind: "damage"
      }
    ]
  }
];

// src/tables/boons.json
var boons_default = [
  {
    id: "iron_claw",
    name: "\u94C1\u722A",
    kind: "atk",
    value: 4,
    weight: 10,
    tier: "fan"
  },
  {
    id: "ox_hide",
    name: "\u725B\u76AE",
    kind: "def",
    value: 4,
    weight: 10,
    tier: "fan"
  },
  {
    id: "swift_talisman",
    name: "\u75BE\u7B26",
    kind: "spd",
    value: 4,
    weight: 8,
    tier: "fan"
  },
  {
    id: "gourd_life",
    name: "\u547D\u846B",
    kind: "hp",
    value: 12,
    weight: 10,
    tier: "fan"
  },
  {
    id: "binder_thread",
    name: "\u7F1A\u7EBF",
    kind: "catch",
    value: 0.08,
    weight: 8,
    tier: "fan"
  },
  {
    id: "coin_toad",
    name: "\u91D1\u87FE",
    kind: "gold",
    value: 20,
    weight: 8,
    tier: "fan"
  },
  {
    id: "lesson_scroll",
    name: "\u8BFE\u5377",
    kind: "exp",
    value: 0.15,
    weight: 8,
    tier: "fan"
  },
  {
    id: "small_draught",
    name: "\u5C0F\u836F",
    kind: "potion",
    value: 20,
    weight: 0,
    tier: "fan"
  },
  {
    id: "flame_seal",
    name: "\u708E\u5370",
    kind: "atk",
    value: 6,
    weight: 6,
    tier: "fan"
  },
  {
    id: "tide_seal",
    name: "\u6F6E\u5370",
    kind: "atk",
    value: 6,
    weight: 6,
    tier: "fan"
  },
  {
    id: "wood_seal",
    name: "\u6728\u5370",
    kind: "def",
    value: 6,
    weight: 6,
    tier: "fan"
  },
  {
    id: "stone_seal",
    name: "\u5CA9\u5370",
    kind: "def",
    value: 6,
    weight: 6,
    tier: "fan"
  },
  {
    id: "bolt_seal",
    name: "\u9706\u5370",
    kind: "spd",
    value: 6,
    weight: 6,
    tier: "fan"
  },
  {
    id: "frost_seal",
    name: "\u971C\u5370",
    kind: "atk",
    value: 6,
    weight: 6,
    tier: "fan"
  },
  {
    id: "shade_seal",
    name: "\u5F71\u5370",
    kind: "atk",
    value: 6,
    weight: 6,
    tier: "fan"
  },
  {
    id: "light_seal",
    name: "\u5149\u5370",
    kind: "atk",
    value: 6,
    weight: 6,
    tier: "fan"
  },
  {
    id: "thick_gourd",
    name: "\u539A\u846B",
    kind: "hp",
    value: 20,
    weight: 5,
    tier: "shang"
  },
  {
    id: "silver_toad",
    name: "\u94F6\u87FE",
    kind: "gold",
    value: 40,
    weight: 5,
    tier: "shang"
  },
  {
    id: "master_scroll",
    name: "\u5E08\u5377",
    kind: "exp",
    value: 0.25,
    weight: 5,
    tier: "shang"
  },
  {
    id: "spirit_snare",
    name: "\u7075\u5957",
    kind: "catch",
    value: 0.15,
    weight: 5,
    tier: "shang"
  },
  {
    id: "temple_bell",
    name: "\u5BFA\u949F",
    kind: "def",
    value: 8,
    weight: 4,
    tier: "shang"
  },
  {
    id: "wind_flag",
    name: "\u98CE\u65D7",
    kind: "spd",
    value: 8,
    weight: 4,
    tier: "shang"
  },
  {
    id: "battle_drum",
    name: "\u6218\u9F13",
    kind: "atk",
    value: 8,
    weight: 4,
    tier: "te"
  },
  {
    id: "long_life",
    name: "\u957F\u547D",
    kind: "hp",
    value: 28,
    weight: 3,
    tier: "te"
  },
  {
    id: "thunder_banner",
    name: "\u9706\u7E9B",
    kind: "spd",
    value: 8,
    weight: 3,
    tier: "te"
  },
  {
    id: "iron_pagoda",
    name: "\u94C1\u5854",
    kind: "def",
    value: 8,
    weight: 3,
    tier: "te"
  },
  {
    id: "fate_knot",
    name: "\u7F18\u7ED3",
    kind: "catch",
    value: 0.2,
    weight: 3,
    tier: "qi"
  },
  {
    id: "ley_chart",
    name: "\u5C71\u6CB3\u56FE",
    kind: "map",
    value: 1,
    weight: 3,
    tier: "qi"
  },
  {
    id: "soul_glass",
    name: "\u9B42\u9274",
    kind: "hp",
    value: 32,
    weight: 3,
    tier: "qi"
  },
  {
    id: "void_latch",
    name: "\u52AB\u6263",
    kind: "atk",
    value: 12,
    weight: 1,
    tier: "jie"
  },
  {
    id: "lure_fan",
    name: "\u51E1\u9975",
    kind: "lure",
    value: 0.1,
    weight: 4,
    tier: "fan"
  },
  {
    id: "lure_shang",
    name: "\u4E0A\u9975",
    kind: "lure",
    value: 0.25,
    weight: 3,
    tier: "shang"
  },
  {
    id: "catalog_boon_1",
    name: "\u95F2\u7F181",
    kind: "def",
    value: 3,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_2",
    name: "\u95F2\u7F182",
    kind: "spd",
    value: 4,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_3",
    name: "\u95F2\u7F183",
    kind: "hp",
    value: 5,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_4",
    name: "\u95F2\u7F184",
    kind: "catch",
    value: 0.02,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_5",
    name: "\u95F2\u7F185",
    kind: "gold",
    value: 7,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_6",
    name: "\u95F2\u7F186",
    kind: "exp",
    value: 8,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_7",
    name: "\u95F2\u7F187",
    kind: "atk",
    value: 9,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_8",
    name: "\u95F2\u7F188",
    kind: "def",
    value: 2,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_9",
    name: "\u95F2\u7F189",
    kind: "spd",
    value: 3,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_10",
    name: "\u95F2\u7F1810",
    kind: "hp",
    value: 4,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_11",
    name: "\u95F2\u7F1811",
    kind: "catch",
    value: 0.02,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_12",
    name: "\u95F2\u7F1812",
    kind: "gold",
    value: 6,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_13",
    name: "\u95F2\u7F1813",
    kind: "exp",
    value: 7,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_14",
    name: "\u95F2\u7F1814",
    kind: "atk",
    value: 8,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_15",
    name: "\u95F2\u7F1815",
    kind: "def",
    value: 9,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_16",
    name: "\u95F2\u7F1816",
    kind: "spd",
    value: 2,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_17",
    name: "\u95F2\u7F1817",
    kind: "hp",
    value: 3,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_18",
    name: "\u95F2\u7F1818",
    kind: "catch",
    value: 0.02,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_19",
    name: "\u95F2\u7F1819",
    kind: "gold",
    value: 5,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_20",
    name: "\u95F2\u7F1820",
    kind: "exp",
    value: 6,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_21",
    name: "\u95F2\u7F1821",
    kind: "atk",
    value: 7,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_22",
    name: "\u95F2\u7F1822",
    kind: "def",
    value: 8,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_23",
    name: "\u95F2\u7F1823",
    kind: "spd",
    value: 9,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_24",
    name: "\u95F2\u7F1824",
    kind: "hp",
    value: 2,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_25",
    name: "\u95F2\u7F1825",
    kind: "catch",
    value: 0.02,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_26",
    name: "\u95F2\u7F1826",
    kind: "gold",
    value: 4,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_27",
    name: "\u95F2\u7F1827",
    kind: "exp",
    value: 5,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_28",
    name: "\u95F2\u7F1828",
    kind: "atk",
    value: 6,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_29",
    name: "\u95F2\u7F1829",
    kind: "def",
    value: 7,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_30",
    name: "\u95F2\u7F1830",
    kind: "spd",
    value: 8,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_31",
    name: "\u95F2\u7F1831",
    kind: "hp",
    value: 9,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_32",
    name: "\u95F2\u7F1832",
    kind: "catch",
    value: 0.02,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_33",
    name: "\u95F2\u7F1833",
    kind: "gold",
    value: 3,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_34",
    name: "\u95F2\u7F1834",
    kind: "exp",
    value: 4,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_35",
    name: "\u95F2\u7F1835",
    kind: "atk",
    value: 5,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_36",
    name: "\u95F2\u7F1836",
    kind: "def",
    value: 6,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_37",
    name: "\u95F2\u7F1837",
    kind: "spd",
    value: 7,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_38",
    name: "\u95F2\u7F1838",
    kind: "hp",
    value: 8,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_39",
    name: "\u95F2\u7F1839",
    kind: "catch",
    value: 0.02,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_40",
    name: "\u95F2\u7F1840",
    kind: "gold",
    value: 2,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_41",
    name: "\u95F2\u7F1841",
    kind: "exp",
    value: 3,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_42",
    name: "\u95F2\u7F1842",
    kind: "atk",
    value: 4,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_43",
    name: "\u95F2\u7F1843",
    kind: "def",
    value: 5,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_44",
    name: "\u95F2\u7F1844",
    kind: "spd",
    value: 6,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_45",
    name: "\u95F2\u7F1845",
    kind: "hp",
    value: 7,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_46",
    name: "\u95F2\u7F1846",
    kind: "catch",
    value: 0.02,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_47",
    name: "\u95F2\u7F1847",
    kind: "gold",
    value: 9,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_48",
    name: "\u95F2\u7F1848",
    kind: "exp",
    value: 2,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_49",
    name: "\u95F2\u7F1849",
    kind: "atk",
    value: 3,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_50",
    name: "\u95F2\u7F1850",
    kind: "def",
    value: 4,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_51",
    name: "\u95F2\u7F1851",
    kind: "spd",
    value: 5,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_52",
    name: "\u95F2\u7F1852",
    kind: "hp",
    value: 6,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_53",
    name: "\u95F2\u7F1853",
    kind: "catch",
    value: 0.02,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_54",
    name: "\u95F2\u7F1854",
    kind: "gold",
    value: 8,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_55",
    name: "\u95F2\u7F1855",
    kind: "exp",
    value: 9,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_56",
    name: "\u95F2\u7F1856",
    kind: "atk",
    value: 2,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_57",
    name: "\u95F2\u7F1857",
    kind: "def",
    value: 3,
    weight: 2,
    tier: "fan"
  },
  {
    id: "catalog_boon_58",
    name: "\u95F2\u7F1858",
    kind: "spd",
    value: 4,
    weight: 2,
    tier: "fan"
  },
  {
    id: "soul_return",
    name: "\u8FD8\u9B42",
    kind: "revive",
    value: 1,
    weight: 0,
    tier: "fan"
  },
  {
    id: "seal_pouch",
    name: "\u51E1\u9547\u5323",
    kind: "sealPack",
    value: 5,
    weight: 4,
    tier: "fan"
  },
  {
    id: "sanctify_cuff",
    name: "\u663E\u5723\u956F",
    kind: "form",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "colossus_band",
    name: "\u5DE8\u7075\u5E26",
    kind: "form",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "hidden_pact_charm",
    name: "\u9690\u5951\u7B26",
    kind: "hiddenPact",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "seal_pouch_shang",
    name: "\u4E0A\u9547\u5323",
    kind: "sealPack",
    value: 4,
    weight: 3,
    tier: "shang",
    slot: 1
  },
  {
    id: "seal_pouch_te",
    name: "\u7279\u9547\u5323",
    kind: "sealPack",
    value: 3,
    weight: 2,
    tier: "te",
    slot: 2
  },
  {
    id: "seal_pouch_qi",
    name: "\u5947\u9547\u5323",
    kind: "sealPack",
    value: 2,
    weight: 1,
    tier: "qi",
    slot: 3
  },
  {
    id: "seal_pouch_jie",
    name: "\u52AB\u9547\u5323",
    kind: "sealPack",
    value: 1,
    weight: 1,
    tier: "jie",
    slot: 4
  },
  {
    id: "cleanse_talisman",
    name: "\u51C0\u4F53",
    kind: "cleanse",
    value: 1,
    weight: 4,
    tier: "fan"
  },
  {
    id: "ether_dew",
    name: "\u7075\u9732",
    kind: "ether",
    value: 10,
    weight: 4,
    tier: "fan"
  },
  {
    id: "rare_sugar",
    name: "\u7A00\u7CD6",
    kind: "candy",
    value: 1,
    weight: 3,
    tier: "shang"
  },
  {
    id: "party_sugar",
    name: "\u4F17\u7CD6",
    kind: "candy",
    value: 1,
    weight: 2,
    tier: "te",
    tag: "party"
  },
  {
    id: "sugar_jar",
    name: "\u7CD6\u74EE",
    kind: "candy",
    value: 10,
    weight: 2,
    tier: "te",
    tag: "jar"
  },
  {
    id: "bone_dose_atk",
    name: "\u653B\u9AA8\u836F",
    kind: "vitamin",
    value: 1,
    weight: 3,
    tier: "shang",
    tag: "atk"
  },
  {
    id: "temper_mint",
    name: "\u6027\u7075\u4E39",
    kind: "mint",
    value: 1,
    weight: 3,
    tier: "shang",
    tag: "fierce"
  },
  {
    id: "focus_up",
    name: "\u7075\u529B\u5347",
    kind: "ppUp",
    value: 5,
    weight: 4,
    tier: "fan"
  },
  {
    id: "focus_full",
    name: "\u7075\u529B\u6EE1",
    kind: "ppMax",
    value: 1,
    weight: 2,
    tier: "shang"
  },
  {
    id: "war_hit",
    name: "\u547D\u4E2D\u7B26",
    kind: "warToken",
    value: 5,
    weight: 4,
    tier: "fan",
    tag: "hit"
  },
  {
    id: "war_atk",
    name: "\u653B\u6218\u7B26",
    kind: "warToken",
    value: 5,
    weight: 4,
    tier: "fan",
    tag: "atk"
  },
  {
    id: "war_crit",
    name: "\u4F1A\u5FC3\u7B26",
    kind: "warToken",
    value: 5,
    weight: 3,
    tier: "shang",
    tag: "crit"
  },
  {
    id: "lure_te",
    name: "\u7279\u9975",
    kind: "lure",
    value: 10,
    weight: 2,
    tier: "te"
  },
  {
    id: "lure_gold",
    name: "\u91D1\u9975",
    kind: "lure",
    value: 10,
    weight: 1,
    tier: "qi"
  },
  {
    id: "tm_fan",
    name: "\u51E1\u79D8\u5377",
    kind: "tm",
    value: 1,
    weight: 4,
    tier: "fan"
  },
  {
    id: "tm_shang",
    name: "\u4E0A\u79D8\u5377",
    kind: "tm",
    value: 1,
    weight: 3,
    tier: "shang"
  },
  {
    id: "evo_dust",
    name: "\u5316\u5C18",
    kind: "evolve",
    value: 1,
    weight: 2,
    tier: "shang"
  },
  {
    id: "sanctify_stone",
    name: "\u663E\u5723\u77F3",
    kind: "formItem",
    value: 1,
    weight: 2,
    tier: "te",
    tag: "sanctify"
  },
  {
    id: "colossus_shroom",
    name: "\u5DE8\u7075\u83C7",
    kind: "formItem",
    value: 1,
    weight: 2,
    tier: "te",
    tag: "colossus"
  },
  {
    id: "apex_crystal",
    name: "\u7075\u6781\u6676",
    kind: "formItem",
    value: 1,
    weight: 1,
    tier: "qi",
    tag: "apex"
  },
  {
    id: "twin_pact",
    name: "\u53CC\u751F\u5951",
    kind: "splicer",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "unsplice_charm",
    name: "\u89E3\u5408\u4F53",
    kind: "unsplice",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "voucher_fan",
    name: "\u51E1\u5B75\u5238",
    kind: "voucher",
    value: 1,
    weight: 8,
    tier: "fan",
    tag: "fan"
  },
  {
    id: "voucher_shang",
    name: "\u4E0A\u5B75\u5238",
    kind: "voucher",
    value: 1,
    weight: 4,
    tier: "shang",
    tag: "shang"
  },
  {
    id: "voucher_te",
    name: "\u7279\u5B75\u5238",
    kind: "voucher",
    value: 1,
    weight: 2,
    tier: "te",
    tag: "te"
  },
  {
    id: "fruit_heal",
    name: "\u56DE\u8840\u679C",
    kind: "fruit",
    value: 2,
    weight: 4,
    tier: "fan"
  },
  {
    id: "fruit_cleanse",
    name: "\u51C0\u4F53\u679C",
    kind: "fruit",
    value: 2,
    weight: 3,
    tier: "fan"
  },
  {
    id: "fruit_focus",
    name: "\u8865\u7075\u679C",
    kind: "fruit",
    value: 2,
    weight: 3,
    tier: "fan"
  },
  {
    id: "fruit_pinch",
    name: "\u6025\u667A\u679C",
    kind: "fruit",
    value: 3,
    weight: 3,
    tier: "shang"
  },
  {
    id: "type_boost_flame",
    name: "\u708E\u50AC",
    kind: "typeBoost",
    value: 20,
    weight: 3,
    tier: "shang",
    tag: "flame"
  },
  {
    id: "type_boost_tide",
    name: "\u6F6E\u50AC",
    kind: "typeBoost",
    value: 20,
    weight: 3,
    tier: "shang",
    tag: "tide"
  },
  {
    id: "type_boost_stone",
    name: "\u5CA9\u50AC",
    kind: "typeBoost",
    value: 20,
    weight: 3,
    tier: "shang",
    tag: "stone"
  },
  {
    id: "type_boost_wood",
    name: "\u6728\u50AC",
    kind: "typeBoost",
    value: 20,
    weight: 3,
    tier: "shang",
    tag: "wood"
  },
  {
    id: "type_boost_bolt",
    name: "\u9706\u50AC",
    kind: "typeBoost",
    value: 20,
    weight: 3,
    tier: "shang",
    tag: "bolt"
  },
  {
    id: "type_boost_frost",
    name: "\u971C\u50AC",
    kind: "typeBoost",
    value: 20,
    weight: 3,
    tier: "shang",
    tag: "frost"
  },
  {
    id: "type_boost_shade",
    name: "\u5F71\u50AC",
    kind: "typeBoost",
    value: 20,
    weight: 3,
    tier: "shang",
    tag: "shade"
  },
  {
    id: "type_boost_light",
    name: "\u5149\u50AC",
    kind: "typeBoost",
    value: 20,
    weight: 3,
    tier: "shang",
    tag: "light"
  },
  {
    id: "species_boost_zao_li",
    name: "\u7076\u72F8\u50AC",
    kind: "speciesBoost",
    value: 20,
    weight: 2,
    tier: "te",
    tag: "zao_li"
  },
  {
    id: "leftover_meal",
    name: "\u5269\u996D",
    kind: "charm",
    value: 1,
    weight: 3,
    tier: "fan",
    tag: "meal"
  },
  {
    id: "focus_knot",
    name: "\u7126\u70B9",
    kind: "charm",
    value: 1,
    weight: 3,
    tier: "shang"
  },
  {
    id: "momentum_band",
    name: "\u6C14\u52BF",
    kind: "charm",
    value: 1,
    weight: 3,
    tier: "shang"
  },
  {
    id: "king_bead",
    name: "\u738B\u8005",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "shell_chime",
    name: "\u58F3\u94C3",
    kind: "charm",
    value: 1,
    weight: 3,
    tier: "shang"
  },
  {
    id: "soothe_chime",
    name: "\u5B89\u629A\u94C3",
    kind: "charm",
    value: 1,
    weight: 3,
    tier: "fan"
  },
  {
    id: "temper_dew",
    name: "\u6027\u7075\u9732",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "shang"
  },
  {
    id: "spirit_mirror",
    name: "\u955C",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "shang"
  },
  {
    id: "wide_mirror",
    name: "\u5E7F\u955C",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "revive_seed",
    name: "\u8FD8\u9B42\u79CD",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "relay_rod",
    name: "\u63A5\u529B\u68D2",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "shang"
  },
  {
    id: "grip_nail",
    name: "\u652B\u722A",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "shang"
  },
  {
    id: "first_nail",
    name: "\u5148\u5236\u722A",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "shang"
  },
  {
    id: "burn_bead",
    name: "\u707C\u73E0",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "shang"
  },
  {
    id: "toxic_bead",
    name: "\u6BD2\u73E0",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "shang"
  },
  {
    id: "young_bone",
    name: "\u672A\u5316\u9AA8",
    kind: "charm",
    value: 1,
    weight: 1,
    tier: "qi"
  },
  {
    id: "lost_swallow",
    name: "\u8FF7\u9014\u541E",
    kind: "charm",
    value: 1,
    weight: 1,
    tier: "jie",
    tag: "lost_swallow"
  },
  {
    id: "multi_mirror",
    name: "\u591A\u51FB\u955C",
    kind: "charm",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "lock_casket",
    name: "\u5C01\u5323",
    kind: "passive",
    value: 1,
    weight: 2,
    tier: "te",
    tag: "lock"
  },
  {
    id: "coin_charm",
    name: "\u91D1\u94B1\u7B26",
    kind: "passive",
    value: 1,
    weight: 4,
    tier: "fan",
    tag: "gold"
  },
  {
    id: "exp_share",
    name: "\u7ECF\u9A8C\u5747\u6CBE",
    kind: "exp",
    value: 1,
    weight: 4,
    tier: "fan"
  },
  {
    id: "exp_balance",
    name: "\u7ECF\u9A8C\u5E73\u8861",
    kind: "exp",
    value: 1,
    weight: 3,
    tier: "shang"
  },
  {
    id: "exp_charm",
    name: "\u7ECF\u9A8C\u7B26",
    kind: "exp",
    value: 1,
    weight: 4,
    tier: "fan"
  },
  {
    id: "exp_charm_shang",
    name: "\u7ECF\u9A8C\u4E0A\u7B26",
    kind: "exp",
    value: 1,
    weight: 3,
    tier: "shang"
  },
  {
    id: "exp_charm_gold",
    name: "\u7ECF\u9A8C\u91D1\u7B26",
    kind: "exp",
    value: 1,
    weight: 2,
    tier: "te"
  },
  {
    id: "shiny_charm",
    name: "\u5F02\u76F8\u7B26",
    kind: "passive",
    value: 2,
    weight: 2,
    tier: "te",
    tag: "shiny"
  },
  {
    id: "bone_mirror",
    name: "\u9AA8\u76F8\u955C",
    kind: "passive",
    value: 1,
    weight: 2,
    tier: "te",
    tag: "bone"
  },
  {
    id: "apex_vessel",
    name: "\u7075\u6781\u5668",
    kind: "passive",
    value: 1,
    weight: 1,
    tier: "qi",
    tag: "apex"
  },
  {
    id: "fruit_pouch",
    name: "\u679C\u888B",
    kind: "passive",
    value: 1,
    weight: 3,
    tier: "shang",
    tag: "fruit"
  },
  {
    id: "heal_charm",
    name: "\u6108\u7B26",
    kind: "passive",
    value: 1,
    weight: 3,
    tier: "fan",
    tag: "heal"
  },
  {
    id: "catch_charm",
    name: "\u6355\u6349\u7B26",
    kind: "catch",
    value: 0.2,
    weight: 2,
    tier: "te"
  },
  {
    id: "golden_slot",
    name: "\u91D1\u5951\u69FD",
    kind: "passive",
    value: 1,
    weight: 2,
    tier: "qi",
    tag: "slot"
  }
];

// src/tables/pacts.json
var pacts_default = [
  {
    id: "hearth_watch",
    name: "\u5B88\u7076",
    description: "\u708E\u4F24\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.2
      }
    ],
    hiddenHooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.5
      },
      {
        when: "take",
        mul: 0.9
      }
    ]
  },
  {
    id: "cistern_lurk",
    name: "\u4F0F\u4E95",
    description: "\u6F6E\u4F24\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.2
      }
    ]
  },
  {
    id: "grove_ward",
    name: "\u5B88\u793E",
    description: "\u6728\u9632\u5FAE\u589E",
    hooks: [
      {
        when: "take",
        mul: 0.95
      }
    ]
  },
  {
    id: "bedrock",
    name: "\u76D8\u77F3",
    description: "\u5CA9\u9632\u5FAE\u589E",
    hooks: [
      {
        when: "take",
        mul: 0.95
      }
    ]
  },
  {
    id: "storm_silk",
    name: "\u96F7\u4E1D",
    description: "\u9706\u901F\u5FAE\u589E",
    hooks: [
      {
        when: "switchIn",
        stat: "spd",
        delta: 1
      }
    ]
  },
  {
    id: "winter_husk",
    name: "\u51AC\u8327",
    description: "\u971C\u4F24\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "frost",
        mul: 1.2
      }
    ]
  },
  {
    id: "night_ledger",
    name: "\u591C\u7C3F",
    description: "\u5F71\u4F24\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.2
      }
    ]
  },
  {
    id: "lantern_vow",
    name: "\u706F\u8A93",
    description: "\u5149\u4F24\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.2
      }
    ]
  },
  {
    id: "kiln_heart",
    name: "\u7A91\u5FC3",
    description: "\u708E\u5CA9\u53CC\u4FEE",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.1
      },
      {
        when: "deal",
        affinity: "stone",
        mul: 1.1
      }
    ]
  },
  {
    id: "lotus_drift",
    name: "\u840D\u8E2A",
    description: "\u6F6E\u6728\u53CC\u4FEE",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.1
      },
      {
        when: "deal",
        affinity: "wood",
        mul: 1.1
      }
    ]
  },
  {
    id: "folded_night",
    name: "\u6298\u591C",
    description: "\u5F71\u971C\u53CC\u4FEE",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.1
      },
      {
        when: "deal",
        affinity: "frost",
        mul: 1.1
      }
    ]
  },
  {
    id: "bell_oath",
    name: "\u94C3\u8A93",
    description: "\u5149\u9706\u53CC\u4FEE",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.1
      },
      {
        when: "deal",
        affinity: "bolt",
        mul: 1.1
      }
    ]
  },
  {
    id: "ruin_echo",
    name: "\u589F\u54CD",
    description: "\u9547\u589F\u51FA\u6218\u52A0\u6210",
    hooks: [
      {
        when: "deal",
        mul: 1.05
      }
    ]
  },
  {
    id: "wild_wind",
    name: "\u91CE\u98CE",
    description: "\u91CE\u539F\u51FA\u6218\u52A0\u6210",
    hooks: [
      {
        when: "deal",
        mul: 1.05
      }
    ]
  },
  {
    id: "deep_shade",
    name: "\u5BC6\u836B",
    description: "\u5BC6\u6797\u51FA\u6218\u52A0\u6210",
    hooks: [
      {
        when: "deal",
        mul: 1.05
      }
    ]
  },
  {
    id: "city_ward",
    name: "\u574A\u536B",
    description: "\u53D7\u51FB\u51CF\u514D\u5FAE\u5F31",
    hooks: [
      {
        when: "take",
        mul: 0.9
      }
    ]
  },
  {
    id: "catalog_pact_1",
    name: "\u6F6E\u7EB91",
    description: "\u6F6E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_2",
    name: "\u5CA9\u7EB92",
    description: "\u5CA9\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "stone",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_3",
    name: "\u6728\u7EB93",
    description: "\u6728\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "wood",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_4",
    name: "\u9706\u7EB94",
    description: "\u9706\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "bolt",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_5",
    name: "\u971C\u7EB95",
    description: "\u971C\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "frost",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_6",
    name: "\u5F71\u7EB96",
    description: "\u5F71\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_7",
    name: "\u5149\u7EB97",
    description: "\u5149\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_8",
    name: "\u708E\u7EB98",
    description: "\u708E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_9",
    name: "\u6F6E\u7EB99",
    description: "\u6F6E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_10",
    name: "\u5CA9\u7EB910",
    description: "\u5CA9\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "stone",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_11",
    name: "\u6728\u7EB911",
    description: "\u6728\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "wood",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_12",
    name: "\u9706\u7EB912",
    description: "\u9706\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "bolt",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_13",
    name: "\u971C\u7EB913",
    description: "\u971C\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "frost",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_14",
    name: "\u5F71\u7EB914",
    description: "\u5F71\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_15",
    name: "\u5149\u7EB915",
    description: "\u5149\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_16",
    name: "\u708E\u7EB916",
    description: "\u708E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_17",
    name: "\u6F6E\u7EB917",
    description: "\u6F6E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_18",
    name: "\u5CA9\u7EB918",
    description: "\u5CA9\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "stone",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_19",
    name: "\u6728\u7EB919",
    description: "\u6728\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "wood",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_20",
    name: "\u9706\u7EB920",
    description: "\u9706\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "bolt",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_21",
    name: "\u971C\u7EB921",
    description: "\u971C\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "frost",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_22",
    name: "\u5F71\u7EB922",
    description: "\u5F71\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_23",
    name: "\u5149\u7EB923",
    description: "\u5149\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_24",
    name: "\u708E\u7EB924",
    description: "\u708E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_25",
    name: "\u6F6E\u7EB925",
    description: "\u6F6E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_26",
    name: "\u5CA9\u7EB926",
    description: "\u5CA9\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "stone",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_27",
    name: "\u6728\u7EB927",
    description: "\u6728\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "wood",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_28",
    name: "\u9706\u7EB928",
    description: "\u9706\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "bolt",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_29",
    name: "\u971C\u7EB929",
    description: "\u971C\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "frost",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_30",
    name: "\u5F71\u7EB930",
    description: "\u5F71\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_31",
    name: "\u5149\u7EB931",
    description: "\u5149\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_32",
    name: "\u708E\u7EB932",
    description: "\u708E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_33",
    name: "\u6F6E\u7EB933",
    description: "\u6F6E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_34",
    name: "\u5CA9\u7EB934",
    description: "\u5CA9\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "stone",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_35",
    name: "\u6728\u7EB935",
    description: "\u6728\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "wood",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_36",
    name: "\u9706\u7EB936",
    description: "\u9706\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "bolt",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_37",
    name: "\u971C\u7EB937",
    description: "\u971C\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "frost",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_38",
    name: "\u5F71\u7EB938",
    description: "\u5F71\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_39",
    name: "\u5149\u7EB939",
    description: "\u5149\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_40",
    name: "\u708E\u7EB940",
    description: "\u708E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_41",
    name: "\u6F6E\u7EB941",
    description: "\u6F6E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_42",
    name: "\u5CA9\u7EB942",
    description: "\u5CA9\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "stone",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_43",
    name: "\u6728\u7EB943",
    description: "\u6728\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "wood",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_44",
    name: "\u9706\u7EB944",
    description: "\u9706\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "bolt",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_45",
    name: "\u971C\u7EB945",
    description: "\u971C\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "frost",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_46",
    name: "\u5F71\u7EB946",
    description: "\u5F71\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_47",
    name: "\u5149\u7EB947",
    description: "\u5149\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_48",
    name: "\u708E\u7EB948",
    description: "\u708E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_49",
    name: "\u6F6E\u7EB949",
    description: "\u6F6E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_50",
    name: "\u5CA9\u7EB950",
    description: "\u5CA9\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "stone",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_51",
    name: "\u6728\u7EB951",
    description: "\u6728\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "wood",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_52",
    name: "\u9706\u7EB952",
    description: "\u9706\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "bolt",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_53",
    name: "\u971C\u7EB953",
    description: "\u971C\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "frost",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_54",
    name: "\u5F71\u7EB954",
    description: "\u5F71\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_55",
    name: "\u5149\u7EB955",
    description: "\u5149\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_56",
    name: "\u708E\u7EB956",
    description: "\u708E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_57",
    name: "\u6F6E\u7EB957",
    description: "\u6F6E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "tide",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_58",
    name: "\u5CA9\u7EB958",
    description: "\u5CA9\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "stone",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_59",
    name: "\u6728\u7EB959",
    description: "\u6728\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "wood",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_60",
    name: "\u9706\u7EB960",
    description: "\u9706\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "bolt",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_61",
    name: "\u971C\u7EB961",
    description: "\u971C\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "frost",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_62",
    name: "\u5F71\u7EB962",
    description: "\u5F71\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "shade",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_63",
    name: "\u5149\u7EB963",
    description: "\u5149\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "light",
        mul: 1.05
      }
    ]
  },
  {
    id: "catalog_pact_64",
    name: "\u708E\u7EB964",
    description: "\u708E\u7CFB\u5FAE\u589E",
    hooks: [
      {
        when: "deal",
        affinity: "flame",
        mul: 1.05
      }
    ]
  }
];

// src/tables/realms.json
var realms_default = [
  {
    id: "town_ruins",
    name: "\u9547\u589F",
    spiritIds: ["zao_li", "jing_zhu", "dian_zhu", "mo_mao", "deng_e", "yao_shu", "dan_li", "ye_ti", "tao_quan"]
  },
  {
    id: "wilds",
    name: "\u91CE\u539F",
    spiritIds: ["quan_ji", "luan_shi", "pi_li", "jin_hui", "tong_ling", "he_bo_cong", "zhang_yan", "lei_ying", "ming_duo"]
  },
  {
    id: "woods",
    name: "\u5BC6\u6797",
    spiritIds: ["tao_geng", "nuo_mian", "shuang_ming", "ping_yu", "zhi_ren", "bing_can", "he_hun", "jian_ying", "she_mu"]
  },
  {
    id: "market",
    name: "\u574A\u5E02",
    spiritIds: ["dian_zhu", "mo_mao", "deng_e", "yao_shu", "tong_ling", "jin_hui", "tao_quan", "dan_li", "ye_ti"]
  },
  {
    id: "marsh",
    name: "\u6CB3\u6CFD",
    spiritIds: ["jing_zhu", "quan_ji", "ping_yu", "he_hun", "he_bo_cong", "lian_xin", "shuang_ming", "bing_can", "tao_geng"]
  },
  {
    id: "waste",
    name: "\u8352\u539F",
    spiritIds: ["luan_shi", "zhang_yan", "zhen_yue", "yao_shu", "tao_quan", "dan_zao", "zao_li", "dan_li", "huo_de_li"]
  },
  {
    id: "foothill",
    name: "\u5C71\u8179",
    spiritIds: ["zhang_yan", "zhen_yue", "pi_li", "lei_ying", "nuo_mian", "she_mu", "luan_shi", "zhi_ren", "jian_ying"]
  },
  {
    id: "shrine",
    name: "\u793E\u575B",
    spiritIds: ["tao_geng", "nuo_mian", "she_mu", "deng_e", "jin_hui", "yao_lun", "tong_ling", "ming_duo", "jing_zhong"]
  },
  {
    id: "cavern",
    name: "\u6D1E\u7A9F",
    spiritIds: ["mo_mao", "ye_ti", "wu_mian", "zhi_ren", "jian_ying", "zang_shu", "luan_shi", "zhang_yan", "dian_zhu"]
  },
  {
    id: "snow",
    name: "\u96EA\u539F",
    spiritIds: ["shuang_ming", "bing_can", "xuan_dong", "zhi_ren", "jian_ying", "zang_shu", "ping_yu", "he_hun", "nuo_mian"]
  },
  {
    id: "tide",
    name: "\u6F6E\u6C50",
    spiritIds: ["jing_zhu", "quan_ji", "he_bo_cong", "ping_yu", "he_hun", "lian_xin", "shuang_ming", "bing_can", "xuan_dong"]
  },
  {
    id: "void",
    name: "\u5F52\u589F",
    spiritIds: ["huo_de_li", "he_bo_cong", "she_mu", "zhen_yue", "lei_ying", "xuan_dong", "wu_mian", "yao_lun", "jing_zhong"]
  }
];

// src/tables/spirits.json
var spirits_default = [
  {
    id: "zao_li",
    name: "\u7076\u72F8",
    affinities: [
      "flame"
    ],
    baseHp: 36,
    baseAtk: 20,
    baseDef: 14,
    baseSpd: 18,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "hearth_watch",
    evolveTo: "dan_li",
    starter: true,
    realm: "town_ruins"
  },
  {
    id: "dan_li",
    name: "\u4E39\u72F8",
    affinities: [
      "flame"
    ],
    baseHp: 52,
    baseAtk: 28,
    baseDef: 20,
    baseSpd: 24,
    artIds: [
      "cinder_claw",
      "kiln_burst",
      "ash_veil",
      "hearth_spit"
    ],
    pactId: "hearth_watch",
    evolveTo: "huo_de_li",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "huo_de_li",
    name: "\u706B\u5FB7\u540F",
    affinities: [
      "flame"
    ],
    baseHp: 74,
    baseAtk: 38,
    baseDef: 28,
    baseSpd: 30,
    artIds: [
      "kiln_burst",
      "cinder_claw",
      "ash_veil",
      "hearth_spit"
    ],
    pactId: "hearth_watch",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "jing_zhu",
    name: "\u4E95\u86DB",
    affinities: [
      "tide"
    ],
    baseHp: 34,
    baseAtk: 18,
    baseDef: 16,
    baseSpd: 20,
    artIds: [
      "well_thread",
      "drip_fang",
      "tide_lash",
      "cistern_pull"
    ],
    pactId: "cistern_lurk",
    evolveTo: "quan_ji",
    starter: true,
    realm: "town_ruins"
  },
  {
    id: "quan_ji",
    name: "\u6CC9\u59EC",
    affinities: [
      "tide"
    ],
    baseHp: 50,
    baseAtk: 26,
    baseDef: 22,
    baseSpd: 26,
    artIds: [
      "well_thread",
      "tide_lash",
      "drip_fang",
      "cistern_pull"
    ],
    pactId: "cistern_lurk",
    evolveTo: "he_bo_cong",
    starter: false,
    realm: "wilds"
  },
  {
    id: "he_bo_cong",
    name: "\u6CB3\u4F2F\u4ECE\u4E8B",
    affinities: [
      "tide"
    ],
    baseHp: 72,
    baseAtk: 34,
    baseDef: 30,
    baseSpd: 32,
    artIds: [
      "tide_lash",
      "well_thread",
      "drip_fang",
      "cistern_pull"
    ],
    pactId: "cistern_lurk",
    starter: false,
    realm: "wilds"
  },
  {
    id: "tao_geng",
    name: "\u6843\u6897",
    affinities: [
      "wood"
    ],
    baseHp: 38,
    baseAtk: 16,
    baseDef: 20,
    baseSpd: 14,
    artIds: [
      "peach_strike",
      "ward_bark",
      "mask_slam",
      "root_snare"
    ],
    pactId: "grove_ward",
    evolveTo: "nuo_mian",
    starter: true,
    realm: "woods"
  },
  {
    id: "nuo_mian",
    name: "\u50A9\u9762",
    affinities: [
      "wood"
    ],
    baseHp: 56,
    baseAtk: 24,
    baseDef: 28,
    baseSpd: 18,
    artIds: [
      "peach_strike",
      "mask_slam",
      "ward_bark",
      "root_snare"
    ],
    pactId: "grove_ward",
    evolveTo: "she_mu",
    starter: false,
    realm: "woods"
  },
  {
    id: "she_mu",
    name: "\u793E\u6728",
    affinities: [
      "wood"
    ],
    baseHp: 80,
    baseAtk: 32,
    baseDef: 38,
    baseSpd: 22,
    artIds: [
      "mask_slam",
      "ward_bark",
      "peach_strike",
      "root_snare"
    ],
    pactId: "grove_ward",
    starter: false,
    realm: "woods"
  },
  {
    id: "luan_shi",
    name: "\u5375\u77F3\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 40,
    baseAtk: 17,
    baseDef: 22,
    baseSpd: 10,
    artIds: [
      "pebble_toss",
      "ridge_guard",
      "crag_fall",
      "millstone"
    ],
    pactId: "bedrock",
    evolveTo: "zhang_yan",
    starter: false,
    realm: "wilds"
  },
  {
    id: "zhang_yan",
    name: "\u5D82\u5CA9",
    affinities: [
      "stone"
    ],
    baseHp: 60,
    baseAtk: 25,
    baseDef: 32,
    baseSpd: 14,
    artIds: [
      "pebble_toss",
      "crag_fall",
      "ridge_guard",
      "millstone"
    ],
    pactId: "bedrock",
    evolveTo: "zhen_yue",
    starter: false,
    realm: "wilds"
  },
  {
    id: "zhen_yue",
    name: "\u9547\u5CB3\u517D",
    affinities: [
      "stone"
    ],
    baseHp: 86,
    baseAtk: 34,
    baseDef: 42,
    baseSpd: 16,
    artIds: [
      "crag_fall",
      "ridge_guard",
      "pebble_toss",
      "millstone"
    ],
    pactId: "bedrock",
    starter: false,
    realm: "wilds"
  },
  {
    id: "dian_zhu",
    name: "\u7535\u86DB",
    affinities: [
      "bolt"
    ],
    baseHp: 32,
    baseAtk: 21,
    baseDef: 12,
    baseSpd: 24,
    artIds: [
      "spark_cut",
      "static_web",
      "thunder_coil",
      "bell_spark"
    ],
    pactId: "storm_silk",
    evolveTo: "pi_li",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "pi_li",
    name: "\u9739\u96F3\u8708",
    affinities: [
      "bolt"
    ],
    baseHp: 48,
    baseAtk: 30,
    baseDef: 18,
    baseSpd: 32,
    artIds: [
      "spark_cut",
      "thunder_coil",
      "static_web",
      "bell_spark"
    ],
    pactId: "storm_silk",
    evolveTo: "lei_ying",
    starter: false,
    realm: "wilds"
  },
  {
    id: "lei_ying",
    name: "\u96F7\u516C\u6B8B\u5F71",
    affinities: [
      "bolt"
    ],
    baseHp: 68,
    baseAtk: 40,
    baseDef: 24,
    baseSpd: 40,
    artIds: [
      "thunder_coil",
      "spark_cut",
      "static_web",
      "bell_spark"
    ],
    pactId: "storm_silk",
    starter: false,
    realm: "wilds"
  },
  {
    id: "shuang_ming",
    name: "\u971C\u879F",
    affinities: [
      "frost"
    ],
    baseHp: 33,
    baseAtk: 19,
    baseDef: 15,
    baseSpd: 19,
    artIds: [
      "rime_needle",
      "chill_dust",
      "glacier_silk",
      "snow_bite"
    ],
    pactId: "winter_husk",
    evolveTo: "bing_can",
    starter: false,
    realm: "woods"
  },
  {
    id: "bing_can",
    name: "\u51B0\u8695",
    affinities: [
      "frost"
    ],
    baseHp: 50,
    baseAtk: 27,
    baseDef: 22,
    baseSpd: 24,
    artIds: [
      "rime_needle",
      "glacier_silk",
      "chill_dust",
      "snow_bite"
    ],
    pactId: "winter_husk",
    evolveTo: "xuan_dong",
    starter: false,
    realm: "woods"
  },
  {
    id: "xuan_dong",
    name: "\u7384\u51AC",
    affinities: [
      "frost"
    ],
    baseHp: 70,
    baseAtk: 36,
    baseDef: 30,
    baseSpd: 28,
    artIds: [
      "glacier_silk",
      "rime_needle",
      "chill_dust",
      "snow_bite"
    ],
    pactId: "winter_husk",
    starter: false,
    realm: "woods"
  },
  {
    id: "mo_mao",
    name: "\u58A8\u732B",
    affinities: [
      "shade"
    ],
    baseHp: 34,
    baseAtk: 22,
    baseDef: 13,
    baseSpd: 22,
    artIds: [
      "ink_swipe",
      "shade_nudge",
      "wail_mark",
      "ledger_cut"
    ],
    pactId: "night_ledger",
    evolveTo: "ye_ti",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "ye_ti",
    name: "\u591C\u557C",
    affinities: [
      "shade"
    ],
    baseHp: 50,
    baseAtk: 31,
    baseDef: 18,
    baseSpd: 28,
    artIds: [
      "ink_swipe",
      "wail_mark",
      "shade_nudge",
      "ledger_cut"
    ],
    pactId: "night_ledger",
    evolveTo: "wu_mian",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "wu_mian",
    name: "\u65E0\u9762\u7C3F\u540F",
    affinities: [
      "shade"
    ],
    baseHp: 72,
    baseAtk: 40,
    baseDef: 24,
    baseSpd: 34,
    artIds: [
      "wail_mark",
      "ink_swipe",
      "shade_nudge",
      "ledger_cut"
    ],
    pactId: "night_ledger",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "deng_e",
    name: "\u706F\u86FE",
    affinities: [
      "light"
    ],
    baseHp: 32,
    baseAtk: 18,
    baseDef: 14,
    baseSpd: 23,
    artIds: [
      "lamp_dust",
      "halo_cut",
      "solar_bead",
      "wick_flare"
    ],
    pactId: "lantern_vow",
    evolveTo: "jin_hui",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "jin_hui",
    name: "\u91D1\u8F89\u96C0",
    affinities: [
      "light"
    ],
    baseHp: 48,
    baseAtk: 27,
    baseDef: 20,
    baseSpd: 30,
    artIds: [
      "halo_cut",
      "solar_bead",
      "lamp_dust",
      "wick_flare"
    ],
    pactId: "lantern_vow",
    evolveTo: "yao_lun",
    starter: false,
    realm: "wilds"
  },
  {
    id: "yao_lun",
    name: "\u66DC\u8F6E",
    affinities: [
      "light"
    ],
    baseHp: 68,
    baseAtk: 36,
    baseDef: 26,
    baseSpd: 36,
    artIds: [
      "solar_bead",
      "halo_cut",
      "lamp_dust",
      "wick_flare"
    ],
    pactId: "lantern_vow",
    starter: false,
    realm: "wilds"
  },
  {
    id: "yao_shu",
    name: "\u7A91\u9F20",
    affinities: [
      "flame",
      "stone"
    ],
    baseHp: 35,
    baseAtk: 19,
    baseDef: 18,
    baseSpd: 16,
    artIds: [
      "cinder_claw",
      "pebble_toss",
      "ash_veil",
      "kiln_burst"
    ],
    pactId: "kiln_heart",
    evolveTo: "tao_quan",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "tao_quan",
    name: "\u9676\u72AC",
    affinities: [
      "flame",
      "stone"
    ],
    baseHp: 54,
    baseAtk: 27,
    baseDef: 26,
    baseSpd: 20,
    artIds: [
      "kiln_burst",
      "ridge_guard",
      "cinder_claw",
      "ash_veil"
    ],
    pactId: "kiln_heart",
    evolveTo: "dan_zao",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "dan_zao",
    name: "\u4E39\u7076\u516C",
    affinities: [
      "flame",
      "stone"
    ],
    baseHp: 76,
    baseAtk: 36,
    baseDef: 34,
    baseSpd: 24,
    artIds: [
      "kiln_burst",
      "crag_fall",
      "cinder_claw",
      "ash_veil"
    ],
    pactId: "kiln_heart",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "ping_yu",
    name: "\u840D\u9C7C",
    affinities: [
      "tide",
      "wood"
    ],
    baseHp: 36,
    baseAtk: 17,
    baseDef: 17,
    baseSpd: 17,
    artIds: [
      "drip_fang",
      "peach_strike",
      "well_thread",
      "tide_lash"
    ],
    pactId: "lotus_drift",
    evolveTo: "he_hun",
    starter: false,
    realm: "woods"
  },
  {
    id: "he_hun",
    name: "\u8377\u9B42",
    affinities: [
      "tide",
      "wood"
    ],
    baseHp: 54,
    baseAtk: 25,
    baseDef: 24,
    baseSpd: 23,
    artIds: [
      "tide_lash",
      "ward_bark",
      "well_thread",
      "drip_fang"
    ],
    pactId: "lotus_drift",
    evolveTo: "lian_xin",
    starter: false,
    realm: "woods"
  },
  {
    id: "lian_xin",
    name: "\u83B2\u5FC3\u86DF",
    affinities: [
      "tide",
      "wood"
    ],
    baseHp: 78,
    baseAtk: 34,
    baseDef: 32,
    baseSpd: 28,
    artIds: [
      "tide_lash",
      "mask_slam",
      "well_thread",
      "drip_fang"
    ],
    pactId: "lotus_drift",
    starter: false,
    realm: "woods"
  },
  {
    id: "zhi_ren",
    name: "\u7EB8\u4EBA",
    affinities: [
      "shade",
      "frost"
    ],
    baseHp: 30,
    baseAtk: 20,
    baseDef: 12,
    baseSpd: 21,
    artIds: [
      "shade_nudge",
      "rime_needle",
      "ink_swipe",
      "wail_mark"
    ],
    pactId: "folded_night",
    evolveTo: "jian_ying",
    starter: false,
    realm: "woods"
  },
  {
    id: "jian_ying",
    name: "\u526A\u5F71",
    affinities: [
      "shade",
      "frost"
    ],
    baseHp: 46,
    baseAtk: 29,
    baseDef: 16,
    baseSpd: 29,
    artIds: [
      "wail_mark",
      "chill_dust",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "folded_night",
    evolveTo: "zang_shu",
    starter: false,
    realm: "woods"
  },
  {
    id: "zang_shu",
    name: "\u846C\u4E66\u9B3C",
    affinities: [
      "shade",
      "frost"
    ],
    baseHp: 66,
    baseAtk: 38,
    baseDef: 22,
    baseSpd: 34,
    artIds: [
      "wail_mark",
      "glacier_silk",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "folded_night",
    starter: false,
    realm: "woods"
  },
  {
    id: "tong_ling",
    name: "\u94DC\u94C3",
    affinities: [
      "light",
      "bolt"
    ],
    baseHp: 33,
    baseAtk: 19,
    baseDef: 15,
    baseSpd: 22,
    artIds: [
      "lamp_dust",
      "spark_cut",
      "halo_cut",
      "solar_bead"
    ],
    pactId: "bell_oath",
    evolveTo: "ming_duo",
    starter: false,
    realm: "wilds"
  },
  {
    id: "ming_duo",
    name: "\u9E23\u94CE",
    affinities: [
      "light",
      "bolt"
    ],
    baseHp: 50,
    baseAtk: 28,
    baseDef: 21,
    baseSpd: 29,
    artIds: [
      "halo_cut",
      "thunder_coil",
      "lamp_dust",
      "solar_bead"
    ],
    pactId: "bell_oath",
    evolveTo: "jing_zhong",
    starter: false,
    realm: "wilds"
  },
  {
    id: "jing_zhong",
    name: "\u666F\u949F",
    affinities: [
      "light",
      "bolt"
    ],
    baseHp: 74,
    baseAtk: 37,
    baseDef: 28,
    baseSpd: 33,
    artIds: [
      "solar_bead",
      "thunder_coil",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "bell_oath",
    starter: false,
    realm: "wilds"
  },
  {
    id: "luo_yan_a",
    name: "\u843D\u96C1\u5E7C",
    affinities: [
      "flame"
    ],
    baseHp: 32,
    baseAtk: 16,
    baseDef: 14,
    baseSpd: 14,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "hearth_watch",
    evolveTo: "luo_yan_b",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "luo_yan_b",
    name: "\u843D\u96C1\u7CBE",
    affinities: [
      "flame"
    ],
    baseHp: 48,
    baseAtk: 24,
    baseDef: 20,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "hearth_watch",
    evolveTo: "luo_yan_c",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "luo_yan_c",
    name: "\u843D\u96C1\u541B",
    affinities: [
      "flame"
    ],
    baseHp: 66,
    baseAtk: 32,
    baseDef: 26,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "hearth_watch",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "qing_wu_a",
    name: "\u9752\u829C\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 33,
    baseAtk: 17,
    baseDef: 15,
    baseSpd: 15,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "cistern_lurk",
    evolveTo: "qing_wu_b",
    starter: false,
    realm: "wilds"
  },
  {
    id: "qing_wu_b",
    name: "\u9752\u829C\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 49,
    baseAtk: 25,
    baseDef: 21,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "cistern_lurk",
    evolveTo: "qing_wu_c",
    starter: false,
    realm: "wilds"
  },
  {
    id: "qing_wu_c",
    name: "\u9752\u829C\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 67,
    baseAtk: 33,
    baseDef: 27,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "cistern_lurk",
    starter: false,
    realm: "wilds"
  },
  {
    id: "han_quan_a",
    name: "\u5BD2\u6CC9\u5E7C",
    affinities: [
      "tide"
    ],
    baseHp: 34,
    baseAtk: 18,
    baseDef: 16,
    baseSpd: 16,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "grove_ward",
    evolveTo: "han_quan_b",
    starter: false,
    realm: "woods"
  },
  {
    id: "han_quan_b",
    name: "\u5BD2\u6CC9\u7CBE",
    affinities: [
      "tide"
    ],
    baseHp: 50,
    baseAtk: 26,
    baseDef: 22,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "grove_ward",
    evolveTo: "han_quan_c",
    starter: false,
    realm: "woods"
  },
  {
    id: "han_quan_c",
    name: "\u5BD2\u6CC9\u541B",
    affinities: [
      "tide"
    ],
    baseHp: 68,
    baseAtk: 34,
    baseDef: 28,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "grove_ward",
    starter: false,
    realm: "woods"
  },
  {
    id: "chi_ya_a",
    name: "\u9F7F\u5D16\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 35,
    baseAtk: 19,
    baseDef: 17,
    baseSpd: 17,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "bedrock",
    evolveTo: "chi_ya_b",
    starter: false,
    realm: "market"
  },
  {
    id: "chi_ya_b",
    name: "\u9F7F\u5D16\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 51,
    baseAtk: 27,
    baseDef: 23,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "bedrock",
    evolveTo: "chi_ya_c",
    starter: false,
    realm: "market"
  },
  {
    id: "chi_ya_c",
    name: "\u9F7F\u5D16\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 69,
    baseAtk: 35,
    baseDef: 29,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "bedrock",
    starter: false,
    realm: "market"
  },
  {
    id: "lei_mao_a",
    name: "\u96F7\u732B\u5E7C",
    affinities: [
      "bolt"
    ],
    baseHp: 36,
    baseAtk: 20,
    baseDef: 18,
    baseSpd: 18,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "storm_silk",
    evolveTo: "lei_mao_b",
    starter: false,
    realm: "marsh"
  },
  {
    id: "lei_mao_b",
    name: "\u96F7\u732B\u7CBE",
    affinities: [
      "bolt"
    ],
    baseHp: 52,
    baseAtk: 28,
    baseDef: 24,
    baseSpd: 24,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "storm_silk",
    evolveTo: "lei_mao_c",
    starter: false,
    realm: "marsh"
  },
  {
    id: "lei_mao_c",
    name: "\u96F7\u732B\u541B",
    affinities: [
      "bolt"
    ],
    baseHp: 70,
    baseAtk: 36,
    baseDef: 30,
    baseSpd: 30,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "storm_silk",
    starter: false,
    realm: "marsh"
  },
  {
    id: "xue_hu_a",
    name: "\u96EA\u72D0\u5E7C",
    affinities: [
      "frost"
    ],
    baseHp: 37,
    baseAtk: 21,
    baseDef: 19,
    baseSpd: 19,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "winter_husk",
    evolveTo: "xue_hu_b",
    starter: false,
    realm: "waste"
  },
  {
    id: "xue_hu_b",
    name: "\u96EA\u72D0\u7CBE",
    affinities: [
      "frost"
    ],
    baseHp: 53,
    baseAtk: 29,
    baseDef: 25,
    baseSpd: 25,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "winter_husk",
    evolveTo: "xue_hu_c",
    starter: false,
    realm: "waste"
  },
  {
    id: "xue_hu_c",
    name: "\u96EA\u72D0\u541B",
    affinities: [
      "frost"
    ],
    baseHp: 71,
    baseAtk: 37,
    baseDef: 31,
    baseSpd: 31,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "winter_husk",
    starter: false,
    realm: "waste"
  },
  {
    id: "you_deng_a",
    name: "\u5E7D\u706F\u5E7C",
    affinities: [
      "shade"
    ],
    baseHp: 38,
    baseAtk: 22,
    baseDef: 14,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "night_ledger",
    evolveTo: "you_deng_b",
    starter: false,
    realm: "foothill"
  },
  {
    id: "you_deng_b",
    name: "\u5E7D\u706F\u7CBE",
    affinities: [
      "shade"
    ],
    baseHp: 54,
    baseAtk: 30,
    baseDef: 20,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "night_ledger",
    evolveTo: "you_deng_c",
    starter: false,
    realm: "foothill"
  },
  {
    id: "you_deng_c",
    name: "\u5E7D\u706F\u541B",
    affinities: [
      "shade"
    ],
    baseHp: 72,
    baseAtk: 38,
    baseDef: 26,
    baseSpd: 32,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "night_ledger",
    starter: false,
    realm: "foothill"
  },
  {
    id: "hao_que_a",
    name: "\u7693\u96C0\u5E7C",
    affinities: [
      "light"
    ],
    baseHp: 39,
    baseAtk: 23,
    baseDef: 15,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "lantern_vow",
    evolveTo: "hao_que_b",
    starter: false,
    realm: "shrine"
  },
  {
    id: "hao_que_b",
    name: "\u7693\u96C0\u7CBE",
    affinities: [
      "light"
    ],
    baseHp: 55,
    baseAtk: 31,
    baseDef: 21,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "lantern_vow",
    evolveTo: "hao_que_c",
    starter: false,
    realm: "shrine"
  },
  {
    id: "hao_que_c",
    name: "\u7693\u96C0\u541B",
    affinities: [
      "light"
    ],
    baseHp: 73,
    baseAtk: 39,
    baseDef: 27,
    baseSpd: 33,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "lantern_vow",
    starter: false,
    realm: "shrine"
  },
  {
    id: "tao_ni_a",
    name: "\u9676\u6CE5\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 40,
    baseAtk: 16,
    baseDef: 16,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "kiln_heart",
    evolveTo: "tao_ni_b",
    starter: false,
    realm: "cavern"
  },
  {
    id: "tao_ni_b",
    name: "\u9676\u6CE5\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 56,
    baseAtk: 24,
    baseDef: 22,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "kiln_heart",
    evolveTo: "tao_ni_c",
    starter: false,
    realm: "cavern"
  },
  {
    id: "tao_ni_c",
    name: "\u9676\u6CE5\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 74,
    baseAtk: 32,
    baseDef: 28,
    baseSpd: 34,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "kiln_heart",
    starter: false,
    realm: "cavern"
  },
  {
    id: "he_lan_a",
    name: "\u8377\u6F9C\u5E7C",
    affinities: [
      "tide"
    ],
    baseHp: 41,
    baseAtk: 17,
    baseDef: 17,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "lotus_drift",
    evolveTo: "he_lan_b",
    starter: false,
    realm: "snow"
  },
  {
    id: "he_lan_b",
    name: "\u8377\u6F9C\u7CBE",
    affinities: [
      "tide"
    ],
    baseHp: 57,
    baseAtk: 25,
    baseDef: 23,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "lotus_drift",
    evolveTo: "he_lan_c",
    starter: false,
    realm: "snow"
  },
  {
    id: "he_lan_c",
    name: "\u8377\u6F9C\u541B",
    affinities: [
      "tide"
    ],
    baseHp: 75,
    baseAtk: 33,
    baseDef: 29,
    baseSpd: 35,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "lotus_drift",
    starter: false,
    realm: "snow"
  },
  {
    id: "song_hun_a",
    name: "\u677E\u9B42\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 42,
    baseAtk: 18,
    baseDef: 18,
    baseSpd: 14,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "folded_night",
    evolveTo: "song_hun_b",
    starter: false,
    realm: "tide"
  },
  {
    id: "song_hun_b",
    name: "\u677E\u9B42\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 58,
    baseAtk: 26,
    baseDef: 24,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "folded_night",
    evolveTo: "song_hun_c",
    starter: false,
    realm: "tide"
  },
  {
    id: "song_hun_c",
    name: "\u677E\u9B42\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 76,
    baseAtk: 34,
    baseDef: 30,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "folded_night",
    starter: false,
    realm: "tide"
  },
  {
    id: "jin_chan_a",
    name: "\u70EC\u8749\u5E7C",
    affinities: [
      "flame"
    ],
    baseHp: 43,
    baseAtk: 19,
    baseDef: 19,
    baseSpd: 15,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "bell_oath",
    evolveTo: "jin_chan_b",
    starter: false,
    realm: "void"
  },
  {
    id: "jin_chan_b",
    name: "\u70EC\u8749\u7CBE",
    affinities: [
      "flame"
    ],
    baseHp: 59,
    baseAtk: 27,
    baseDef: 25,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "bell_oath",
    evolveTo: "jin_chan_c",
    starter: false,
    realm: "void"
  },
  {
    id: "jin_chan_c",
    name: "\u70EC\u8749\u541B",
    affinities: [
      "flame"
    ],
    baseHp: 77,
    baseAtk: 35,
    baseDef: 31,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "bell_oath",
    starter: false,
    realm: "void"
  },
  {
    id: "shi_wen_a",
    name: "\u77F3\u7EB9\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 44,
    baseAtk: 20,
    baseDef: 14,
    baseSpd: 16,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "ruin_echo",
    evolveTo: "shi_wen_b",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "shi_wen_b",
    name: "\u77F3\u7EB9\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 60,
    baseAtk: 28,
    baseDef: 20,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "ruin_echo",
    evolveTo: "shi_wen_c",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "shi_wen_c",
    name: "\u77F3\u7EB9\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 78,
    baseAtk: 36,
    baseDef: 26,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "ruin_echo",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "yu_si_a",
    name: "\u96E8\u4E1D\u5E7C",
    affinities: [
      "tide"
    ],
    baseHp: 45,
    baseAtk: 21,
    baseDef: 15,
    baseSpd: 17,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "wild_wind",
    evolveTo: "yu_si_b",
    starter: false,
    realm: "wilds"
  },
  {
    id: "yu_si_b",
    name: "\u96E8\u4E1D\u7CBE",
    affinities: [
      "tide"
    ],
    baseHp: 61,
    baseAtk: 29,
    baseDef: 21,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "wild_wind",
    evolveTo: "yu_si_c",
    starter: false,
    realm: "wilds"
  },
  {
    id: "yu_si_c",
    name: "\u96E8\u4E1D\u541B",
    affinities: [
      "tide"
    ],
    baseHp: 79,
    baseAtk: 37,
    baseDef: 27,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "wild_wind",
    starter: false,
    realm: "wilds"
  },
  {
    id: "feng_ling_a",
    name: "\u98CE\u94C3\u5E7C",
    affinities: [
      "bolt"
    ],
    baseHp: 46,
    baseAtk: 22,
    baseDef: 16,
    baseSpd: 18,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "deep_shade",
    evolveTo: "feng_ling_b",
    starter: false,
    realm: "woods"
  },
  {
    id: "feng_ling_b",
    name: "\u98CE\u94C3\u7CBE",
    affinities: [
      "bolt"
    ],
    baseHp: 62,
    baseAtk: 30,
    baseDef: 22,
    baseSpd: 24,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "deep_shade",
    evolveTo: "feng_ling_c",
    starter: false,
    realm: "woods"
  },
  {
    id: "feng_ling_c",
    name: "\u98CE\u94C3\u541B",
    affinities: [
      "bolt"
    ],
    baseHp: 80,
    baseAtk: 38,
    baseDef: 28,
    baseSpd: 30,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "deep_shade",
    starter: false,
    realm: "woods"
  },
  {
    id: "bing_hua_a",
    name: "\u51B0\u82B1\u5E7C",
    affinities: [
      "frost"
    ],
    baseHp: 47,
    baseAtk: 23,
    baseDef: 17,
    baseSpd: 19,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "city_ward",
    evolveTo: "bing_hua_b",
    starter: false,
    realm: "market"
  },
  {
    id: "bing_hua_b",
    name: "\u51B0\u82B1\u7CBE",
    affinities: [
      "frost"
    ],
    baseHp: 63,
    baseAtk: 31,
    baseDef: 23,
    baseSpd: 25,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "city_ward",
    evolveTo: "bing_hua_c",
    starter: false,
    realm: "market"
  },
  {
    id: "bing_hua_c",
    name: "\u51B0\u82B1\u541B",
    affinities: [
      "frost"
    ],
    baseHp: 81,
    baseAtk: 39,
    baseDef: 29,
    baseSpd: 31,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "city_ward",
    starter: false,
    realm: "market"
  },
  {
    id: "mo_he_a",
    name: "\u58A8\u9E64\u5E7C",
    affinities: [
      "shade"
    ],
    baseHp: 48,
    baseAtk: 16,
    baseDef: 18,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_1",
    evolveTo: "mo_he_b",
    starter: false,
    realm: "marsh"
  },
  {
    id: "mo_he_b",
    name: "\u58A8\u9E64\u7CBE",
    affinities: [
      "shade"
    ],
    baseHp: 64,
    baseAtk: 24,
    baseDef: 24,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_1",
    evolveTo: "mo_he_c",
    starter: false,
    realm: "marsh"
  },
  {
    id: "mo_he_c",
    name: "\u58A8\u9E64\u541B",
    affinities: [
      "shade"
    ],
    baseHp: 82,
    baseAtk: 32,
    baseDef: 30,
    baseSpd: 32,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_1",
    starter: false,
    realm: "marsh"
  },
  {
    id: "ri_gui_a",
    name: "\u65E5\u6677\u5E7C",
    affinities: [
      "light"
    ],
    baseHp: 49,
    baseAtk: 17,
    baseDef: 19,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_2",
    evolveTo: "ri_gui_b",
    starter: false,
    realm: "waste"
  },
  {
    id: "ri_gui_b",
    name: "\u65E5\u6677\u7CBE",
    affinities: [
      "light"
    ],
    baseHp: 65,
    baseAtk: 25,
    baseDef: 25,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_2",
    evolveTo: "ri_gui_c",
    starter: false,
    realm: "waste"
  },
  {
    id: "ri_gui_c",
    name: "\u65E5\u6677\u541B",
    affinities: [
      "light"
    ],
    baseHp: 83,
    baseAtk: 33,
    baseDef: 31,
    baseSpd: 33,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_2",
    starter: false,
    realm: "waste"
  },
  {
    id: "yao_yan_a",
    name: "\u7A91\u70DF\u5E7C",
    affinities: [
      "flame"
    ],
    baseHp: 50,
    baseAtk: 18,
    baseDef: 14,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_3",
    evolveTo: "yao_yan_b",
    starter: false,
    realm: "foothill"
  },
  {
    id: "yao_yan_b",
    name: "\u7A91\u70DF\u7CBE",
    affinities: [
      "flame"
    ],
    baseHp: 66,
    baseAtk: 26,
    baseDef: 20,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_3",
    evolveTo: "yao_yan_c",
    starter: false,
    realm: "foothill"
  },
  {
    id: "yao_yan_c",
    name: "\u7A91\u70DF\u541B",
    affinities: [
      "flame"
    ],
    baseHp: 84,
    baseAtk: 34,
    baseDef: 26,
    baseSpd: 34,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_3",
    starter: false,
    realm: "foothill"
  },
  {
    id: "zhu_lin_a",
    name: "\u7AF9\u9716\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 51,
    baseAtk: 19,
    baseDef: 15,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_4",
    evolveTo: "zhu_lin_b",
    starter: false,
    realm: "shrine"
  },
  {
    id: "zhu_lin_b",
    name: "\u7AF9\u9716\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 67,
    baseAtk: 27,
    baseDef: 21,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_4",
    evolveTo: "zhu_lin_c",
    starter: false,
    realm: "shrine"
  },
  {
    id: "zhu_lin_c",
    name: "\u7AF9\u9716\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 85,
    baseAtk: 35,
    baseDef: 27,
    baseSpd: 35,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_4",
    starter: false,
    realm: "shrine"
  },
  {
    id: "jing_bo_a",
    name: "\u4E95\u6CE2\u5E7C",
    affinities: [
      "tide"
    ],
    baseHp: 52,
    baseAtk: 20,
    baseDef: 16,
    baseSpd: 14,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_5",
    evolveTo: "jing_bo_b",
    starter: false,
    realm: "cavern"
  },
  {
    id: "jing_bo_b",
    name: "\u4E95\u6CE2\u7CBE",
    affinities: [
      "tide"
    ],
    baseHp: 68,
    baseAtk: 28,
    baseDef: 22,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_5",
    evolveTo: "jing_bo_c",
    starter: false,
    realm: "cavern"
  },
  {
    id: "jing_bo_c",
    name: "\u4E95\u6CE2\u541B",
    affinities: [
      "tide"
    ],
    baseHp: 86,
    baseAtk: 36,
    baseDef: 28,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_5",
    starter: false,
    realm: "cavern"
  },
  {
    id: "ya_shi_a",
    name: "\u5D16\u77F3\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 53,
    baseAtk: 21,
    baseDef: 17,
    baseSpd: 15,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_6",
    evolveTo: "ya_shi_b",
    starter: false,
    realm: "snow"
  },
  {
    id: "ya_shi_b",
    name: "\u5D16\u77F3\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 69,
    baseAtk: 29,
    baseDef: 23,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_6",
    evolveTo: "ya_shi_c",
    starter: false,
    realm: "snow"
  },
  {
    id: "ya_shi_c",
    name: "\u5D16\u77F3\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 87,
    baseAtk: 37,
    baseDef: 29,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_6",
    starter: false,
    realm: "snow"
  },
  {
    id: "shan_dian_a",
    name: "\u95EA\u94BF\u5E7C",
    affinities: [
      "bolt"
    ],
    baseHp: 54,
    baseAtk: 22,
    baseDef: 18,
    baseSpd: 16,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_7",
    evolveTo: "shan_dian_b",
    starter: false,
    realm: "tide"
  },
  {
    id: "shan_dian_b",
    name: "\u95EA\u94BF\u7CBE",
    affinities: [
      "bolt"
    ],
    baseHp: 70,
    baseAtk: 30,
    baseDef: 24,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_7",
    evolveTo: "shan_dian_c",
    starter: false,
    realm: "tide"
  },
  {
    id: "shan_dian_c",
    name: "\u95EA\u94BF\u541B",
    affinities: [
      "bolt"
    ],
    baseHp: 88,
    baseAtk: 38,
    baseDef: 30,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_7",
    starter: false,
    realm: "tide"
  },
  {
    id: "shuang_lu_a",
    name: "\u971C\u9732\u5E7C",
    affinities: [
      "frost"
    ],
    baseHp: 55,
    baseAtk: 23,
    baseDef: 19,
    baseSpd: 17,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_8",
    evolveTo: "shuang_lu_b",
    starter: false,
    realm: "void"
  },
  {
    id: "shuang_lu_b",
    name: "\u971C\u9732\u7CBE",
    affinities: [
      "frost"
    ],
    baseHp: 71,
    baseAtk: 31,
    baseDef: 25,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_8",
    evolveTo: "shuang_lu_c",
    starter: false,
    realm: "void"
  },
  {
    id: "shuang_lu_c",
    name: "\u971C\u9732\u541B",
    affinities: [
      "frost"
    ],
    baseHp: 89,
    baseAtk: 39,
    baseDef: 31,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_8",
    starter: false,
    realm: "void"
  },
  {
    id: "gui_ying_a",
    name: "\u6842\u5F71\u5E7C",
    affinities: [
      "shade"
    ],
    baseHp: 56,
    baseAtk: 16,
    baseDef: 14,
    baseSpd: 18,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_9",
    evolveTo: "gui_ying_b",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "gui_ying_b",
    name: "\u6842\u5F71\u7CBE",
    affinities: [
      "shade"
    ],
    baseHp: 72,
    baseAtk: 24,
    baseDef: 20,
    baseSpd: 24,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_9",
    evolveTo: "gui_ying_c",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "gui_ying_c",
    name: "\u6842\u5F71\u541B",
    affinities: [
      "shade"
    ],
    baseHp: 90,
    baseAtk: 32,
    baseDef: 26,
    baseSpd: 30,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_9",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "xing_hui_a",
    name: "\u661F\u8F89\u5E7C",
    affinities: [
      "light"
    ],
    baseHp: 57,
    baseAtk: 17,
    baseDef: 15,
    baseSpd: 19,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_10",
    evolveTo: "xing_hui_b",
    starter: false,
    realm: "wilds"
  },
  {
    id: "xing_hui_b",
    name: "\u661F\u8F89\u7CBE",
    affinities: [
      "light"
    ],
    baseHp: 73,
    baseAtk: 25,
    baseDef: 21,
    baseSpd: 25,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_10",
    evolveTo: "xing_hui_c",
    starter: false,
    realm: "wilds"
  },
  {
    id: "xing_hui_c",
    name: "\u661F\u8F89\u541B",
    affinities: [
      "light"
    ],
    baseHp: 91,
    baseAtk: 33,
    baseDef: 27,
    baseSpd: 31,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_10",
    starter: false,
    realm: "wilds"
  },
  {
    id: "lu_wei_a",
    name: "\u82A6\u82C7\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 58,
    baseAtk: 18,
    baseDef: 16,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_11",
    evolveTo: "lu_wei_b",
    starter: false,
    realm: "woods"
  },
  {
    id: "lu_wei_b",
    name: "\u82A6\u82C7\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 74,
    baseAtk: 26,
    baseDef: 22,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_11",
    evolveTo: "lu_wei_c",
    starter: false,
    realm: "woods"
  },
  {
    id: "lu_wei_c",
    name: "\u82A6\u82C7\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 92,
    baseAtk: 34,
    baseDef: 28,
    baseSpd: 32,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_11",
    starter: false,
    realm: "woods"
  },
  {
    id: "tong_lu_a",
    name: "\u94DC\u7089\u5E7C",
    affinities: [
      "flame"
    ],
    baseHp: 59,
    baseAtk: 19,
    baseDef: 17,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_12",
    evolveTo: "tong_lu_b",
    starter: false,
    realm: "market"
  },
  {
    id: "tong_lu_b",
    name: "\u94DC\u7089\u7CBE",
    affinities: [
      "flame"
    ],
    baseHp: 75,
    baseAtk: 27,
    baseDef: 23,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_12",
    evolveTo: "tong_lu_c",
    starter: false,
    realm: "market"
  },
  {
    id: "tong_lu_c",
    name: "\u94DC\u7089\u541B",
    affinities: [
      "flame"
    ],
    baseHp: 93,
    baseAtk: 35,
    baseDef: 29,
    baseSpd: 33,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_12",
    starter: false,
    realm: "market"
  },
  {
    id: "wan_deng_a",
    name: "\u7897\u706F\u5E7C",
    affinities: [
      "flame"
    ],
    baseHp: 60,
    baseAtk: 20,
    baseDef: 18,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_13",
    evolveTo: "wan_deng_b",
    starter: false,
    realm: "marsh"
  },
  {
    id: "wan_deng_b",
    name: "\u7897\u706F\u7CBE",
    affinities: [
      "flame"
    ],
    baseHp: 76,
    baseAtk: 28,
    baseDef: 24,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_13",
    evolveTo: "wan_deng_c",
    starter: false,
    realm: "marsh"
  },
  {
    id: "wan_deng_c",
    name: "\u7897\u706F\u541B",
    affinities: [
      "flame"
    ],
    baseHp: 94,
    baseAtk: 36,
    baseDef: 30,
    baseSpd: 34,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_13",
    starter: false,
    realm: "marsh"
  },
  {
    id: "qiao_mu_a",
    name: "\u6865\u6728\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 61,
    baseAtk: 21,
    baseDef: 19,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_14",
    evolveTo: "qiao_mu_b",
    starter: false,
    realm: "waste"
  },
  {
    id: "qiao_mu_b",
    name: "\u6865\u6728\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 77,
    baseAtk: 29,
    baseDef: 25,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_14",
    evolveTo: "qiao_mu_c",
    starter: false,
    realm: "waste"
  },
  {
    id: "qiao_mu_c",
    name: "\u6865\u6728\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 95,
    baseAtk: 37,
    baseDef: 31,
    baseSpd: 35,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_14",
    starter: false,
    realm: "waste"
  },
  {
    id: "yu_jian_a",
    name: "\u6E14\u9274\u5E7C",
    affinities: [
      "tide"
    ],
    baseHp: 62,
    baseAtk: 22,
    baseDef: 14,
    baseSpd: 14,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_15",
    evolveTo: "yu_jian_b",
    starter: false,
    realm: "foothill"
  },
  {
    id: "yu_jian_b",
    name: "\u6E14\u9274\u7CBE",
    affinities: [
      "tide"
    ],
    baseHp: 78,
    baseAtk: 30,
    baseDef: 20,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_15",
    evolveTo: "yu_jian_c",
    starter: false,
    realm: "foothill"
  },
  {
    id: "yu_jian_c",
    name: "\u6E14\u9274\u541B",
    affinities: [
      "tide"
    ],
    baseHp: 96,
    baseAtk: 38,
    baseDef: 26,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_15",
    starter: false,
    realm: "foothill"
  },
  {
    id: "bei_hun_a",
    name: "\u7891\u9B42\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 63,
    baseAtk: 23,
    baseDef: 15,
    baseSpd: 15,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_16",
    evolveTo: "bei_hun_b",
    starter: false,
    realm: "shrine"
  },
  {
    id: "bei_hun_b",
    name: "\u7891\u9B42\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 79,
    baseAtk: 31,
    baseDef: 21,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_16",
    evolveTo: "bei_hun_c",
    starter: false,
    realm: "shrine"
  },
  {
    id: "bei_hun_c",
    name: "\u7891\u9B42\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 97,
    baseAtk: 39,
    baseDef: 27,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_16",
    starter: false,
    realm: "shrine"
  },
  {
    id: "jiao_lei_a",
    name: "\u89D2\u96F7\u5E7C",
    affinities: [
      "bolt"
    ],
    baseHp: 64,
    baseAtk: 16,
    baseDef: 16,
    baseSpd: 16,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_17",
    evolveTo: "jiao_lei_b",
    starter: false,
    realm: "cavern"
  },
  {
    id: "jiao_lei_b",
    name: "\u89D2\u96F7\u7CBE",
    affinities: [
      "bolt"
    ],
    baseHp: 80,
    baseAtk: 24,
    baseDef: 22,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_17",
    evolveTo: "jiao_lei_c",
    starter: false,
    realm: "cavern"
  },
  {
    id: "jiao_lei_c",
    name: "\u89D2\u96F7\u541B",
    affinities: [
      "bolt"
    ],
    baseHp: 98,
    baseAtk: 32,
    baseDef: 28,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_17",
    starter: false,
    realm: "cavern"
  },
  {
    id: "bing_si_a",
    name: "\u51B0\u4E1D\u5E7C",
    affinities: [
      "frost"
    ],
    baseHp: 65,
    baseAtk: 17,
    baseDef: 17,
    baseSpd: 17,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_18",
    evolveTo: "bing_si_b",
    starter: false,
    realm: "snow"
  },
  {
    id: "bing_si_b",
    name: "\u51B0\u4E1D\u7CBE",
    affinities: [
      "frost"
    ],
    baseHp: 81,
    baseAtk: 25,
    baseDef: 23,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_18",
    evolveTo: "bing_si_c",
    starter: false,
    realm: "snow"
  },
  {
    id: "bing_si_c",
    name: "\u51B0\u4E1D\u541B",
    affinities: [
      "frost"
    ],
    baseHp: 99,
    baseAtk: 33,
    baseDef: 29,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_18",
    starter: false,
    realm: "snow"
  },
  {
    id: "ye_fan_a",
    name: "\u591C\u5E61\u5E7C",
    affinities: [
      "shade"
    ],
    baseHp: 66,
    baseAtk: 18,
    baseDef: 18,
    baseSpd: 18,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_19",
    evolveTo: "ye_fan_b",
    starter: false,
    realm: "tide"
  },
  {
    id: "ye_fan_b",
    name: "\u591C\u5E61\u7CBE",
    affinities: [
      "shade"
    ],
    baseHp: 82,
    baseAtk: 26,
    baseDef: 24,
    baseSpd: 24,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_19",
    evolveTo: "ye_fan_c",
    starter: false,
    realm: "tide"
  },
  {
    id: "ye_fan_c",
    name: "\u591C\u5E61\u541B",
    affinities: [
      "shade"
    ],
    baseHp: 100,
    baseAtk: 34,
    baseDef: 30,
    baseSpd: 30,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_19",
    starter: false,
    realm: "tide"
  },
  {
    id: "zhao_que_a",
    name: "\u7167\u9619\u5E7C",
    affinities: [
      "light"
    ],
    baseHp: 67,
    baseAtk: 19,
    baseDef: 19,
    baseSpd: 19,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_20",
    evolveTo: "zhao_que_b",
    starter: false,
    realm: "void"
  },
  {
    id: "zhao_que_b",
    name: "\u7167\u9619\u7CBE",
    affinities: [
      "light"
    ],
    baseHp: 83,
    baseAtk: 27,
    baseDef: 25,
    baseSpd: 25,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_20",
    evolveTo: "zhao_que_c",
    starter: false,
    realm: "void"
  },
  {
    id: "zhao_que_c",
    name: "\u7167\u9619\u541B",
    affinities: [
      "light"
    ],
    baseHp: 101,
    baseAtk: 35,
    baseDef: 31,
    baseSpd: 31,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_20",
    starter: false,
    realm: "void"
  },
  {
    id: "yan_wa_a",
    name: "\u6A90\u74E6\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 68,
    baseAtk: 20,
    baseDef: 14,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_21",
    evolveTo: "yan_wa_b",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "yan_wa_b",
    name: "\u6A90\u74E6\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 84,
    baseAtk: 28,
    baseDef: 20,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_21",
    evolveTo: "yan_wa_c",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "yan_wa_c",
    name: "\u6A90\u74E6\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 102,
    baseAtk: 36,
    baseDef: 26,
    baseSpd: 32,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_21",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "lian_zhou_a",
    name: "\u83B2\u821F\u5E7C",
    affinities: [
      "tide"
    ],
    baseHp: 69,
    baseAtk: 21,
    baseDef: 15,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_22",
    evolveTo: "lian_zhou_b",
    starter: false,
    realm: "wilds"
  },
  {
    id: "lian_zhou_b",
    name: "\u83B2\u821F\u7CBE",
    affinities: [
      "tide"
    ],
    baseHp: 85,
    baseAtk: 29,
    baseDef: 21,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_22",
    evolveTo: "lian_zhou_c",
    starter: false,
    realm: "wilds"
  },
  {
    id: "lian_zhou_c",
    name: "\u83B2\u821F\u541B",
    affinities: [
      "tide"
    ],
    baseHp: 103,
    baseAtk: 37,
    baseDef: 27,
    baseSpd: 33,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_22",
    starter: false,
    realm: "wilds"
  },
  {
    id: "sang_gui_a",
    name: "\u6851\u9B3C\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 70,
    baseAtk: 22,
    baseDef: 16,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_23",
    evolveTo: "sang_gui_b",
    starter: false,
    realm: "woods"
  },
  {
    id: "sang_gui_b",
    name: "\u6851\u9B3C\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 86,
    baseAtk: 30,
    baseDef: 22,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_23",
    evolveTo: "sang_gui_c",
    starter: false,
    realm: "woods"
  },
  {
    id: "sang_gui_c",
    name: "\u6851\u9B3C\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 104,
    baseAtk: 38,
    baseDef: 28,
    baseSpd: 34,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_23",
    starter: false,
    realm: "woods"
  },
  {
    id: "huo_que_a",
    name: "\u706B\u9E4A\u5E7C",
    affinities: [
      "flame"
    ],
    baseHp: 71,
    baseAtk: 23,
    baseDef: 17,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_24",
    evolveTo: "huo_que_b",
    starter: false,
    realm: "market"
  },
  {
    id: "huo_que_b",
    name: "\u706B\u9E4A\u7CBE",
    affinities: [
      "flame"
    ],
    baseHp: 87,
    baseAtk: 31,
    baseDef: 23,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_24",
    evolveTo: "huo_que_c",
    starter: false,
    realm: "market"
  },
  {
    id: "huo_que_c",
    name: "\u706B\u9E4A\u541B",
    affinities: [
      "flame"
    ],
    baseHp: 105,
    baseAtk: 39,
    baseDef: 29,
    baseSpd: 35,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_24",
    starter: false,
    realm: "market"
  },
  {
    id: "ta_ling_a",
    name: "\u5854\u94C3\u5E7C",
    affinities: [
      "bolt"
    ],
    baseHp: 72,
    baseAtk: 16,
    baseDef: 18,
    baseSpd: 14,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_25",
    evolveTo: "ta_ling_b",
    starter: false,
    realm: "marsh"
  },
  {
    id: "ta_ling_b",
    name: "\u5854\u94C3\u7CBE",
    affinities: [
      "bolt"
    ],
    baseHp: 88,
    baseAtk: 24,
    baseDef: 24,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_25",
    evolveTo: "ta_ling_c",
    starter: false,
    realm: "marsh"
  },
  {
    id: "ta_ling_c",
    name: "\u5854\u94C3\u541B",
    affinities: [
      "bolt"
    ],
    baseHp: 106,
    baseAtk: 32,
    baseDef: 30,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_25",
    starter: false,
    realm: "marsh"
  },
  {
    id: "xue_deng_a",
    name: "\u96EA\u706F\u5E7C",
    affinities: [
      "frost"
    ],
    baseHp: 73,
    baseAtk: 17,
    baseDef: 19,
    baseSpd: 15,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_26",
    evolveTo: "xue_deng_b",
    starter: false,
    realm: "waste"
  },
  {
    id: "xue_deng_b",
    name: "\u96EA\u706F\u7CBE",
    affinities: [
      "frost"
    ],
    baseHp: 89,
    baseAtk: 25,
    baseDef: 25,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_26",
    evolveTo: "xue_deng_c",
    starter: false,
    realm: "waste"
  },
  {
    id: "xue_deng_c",
    name: "\u96EA\u706F\u541B",
    affinities: [
      "frost"
    ],
    baseHp: 107,
    baseAtk: 33,
    baseDef: 31,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_26",
    starter: false,
    realm: "waste"
  },
  {
    id: "mo_yu_a",
    name: "\u58A8\u9C7C\u5E7C",
    affinities: [
      "shade"
    ],
    baseHp: 74,
    baseAtk: 18,
    baseDef: 14,
    baseSpd: 16,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_27",
    evolveTo: "mo_yu_b",
    starter: false,
    realm: "foothill"
  },
  {
    id: "mo_yu_b",
    name: "\u58A8\u9C7C\u7CBE",
    affinities: [
      "shade"
    ],
    baseHp: 90,
    baseAtk: 26,
    baseDef: 20,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_27",
    evolveTo: "mo_yu_c",
    starter: false,
    realm: "foothill"
  },
  {
    id: "mo_yu_c",
    name: "\u58A8\u9C7C\u541B",
    affinities: [
      "shade"
    ],
    baseHp: 108,
    baseAtk: 34,
    baseDef: 26,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_27",
    starter: false,
    realm: "foothill"
  },
  {
    id: "ri_hua_a",
    name: "\u65E5\u82B1\u5E7C",
    affinities: [
      "light"
    ],
    baseHp: 75,
    baseAtk: 19,
    baseDef: 15,
    baseSpd: 17,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_28",
    evolveTo: "ri_hua_b",
    starter: false,
    realm: "shrine"
  },
  {
    id: "ri_hua_b",
    name: "\u65E5\u82B1\u7CBE",
    affinities: [
      "light"
    ],
    baseHp: 91,
    baseAtk: 27,
    baseDef: 21,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_28",
    evolveTo: "ri_hua_c",
    starter: false,
    realm: "shrine"
  },
  {
    id: "ri_hua_c",
    name: "\u65E5\u82B1\u541B",
    affinities: [
      "light"
    ],
    baseHp: 109,
    baseAtk: 35,
    baseDef: 27,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_28",
    starter: false,
    realm: "shrine"
  },
  {
    id: "sui_shi_a",
    name: "\u71E7\u77F3\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 76,
    baseAtk: 20,
    baseDef: 16,
    baseSpd: 18,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_29",
    evolveTo: "sui_shi_b",
    starter: false,
    realm: "cavern"
  },
  {
    id: "sui_shi_b",
    name: "\u71E7\u77F3\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 92,
    baseAtk: 28,
    baseDef: 22,
    baseSpd: 24,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_29",
    evolveTo: "sui_shi_c",
    starter: false,
    realm: "cavern"
  },
  {
    id: "sui_shi_c",
    name: "\u71E7\u77F3\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 110,
    baseAtk: 36,
    baseDef: 28,
    baseSpd: 30,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_29",
    starter: false,
    realm: "cavern"
  },
  {
    id: "zhu_ying_a",
    name: "\u7AF9\u5F71\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 77,
    baseAtk: 21,
    baseDef: 17,
    baseSpd: 19,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_30",
    evolveTo: "zhu_ying_b",
    starter: false,
    realm: "snow"
  },
  {
    id: "zhu_ying_b",
    name: "\u7AF9\u5F71\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 93,
    baseAtk: 29,
    baseDef: 23,
    baseSpd: 25,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_30",
    evolveTo: "zhu_ying_c",
    starter: false,
    realm: "snow"
  },
  {
    id: "zhu_ying_c",
    name: "\u7AF9\u5F71\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 111,
    baseAtk: 37,
    baseDef: 29,
    baseSpd: 31,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_30",
    starter: false,
    realm: "snow"
  },
  {
    id: "jing_shen_a",
    name: "\u4E95\u795E\u5E7C",
    affinities: [
      "tide"
    ],
    baseHp: 78,
    baseAtk: 22,
    baseDef: 18,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_31",
    evolveTo: "jing_shen_b",
    starter: false,
    realm: "tide"
  },
  {
    id: "jing_shen_b",
    name: "\u4E95\u795E\u7CBE",
    affinities: [
      "tide"
    ],
    baseHp: 94,
    baseAtk: 30,
    baseDef: 24,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_31",
    evolveTo: "jing_shen_c",
    starter: false,
    realm: "tide"
  },
  {
    id: "jing_shen_c",
    name: "\u4E95\u795E\u541B",
    affinities: [
      "tide"
    ],
    baseHp: 112,
    baseAtk: 38,
    baseDef: 30,
    baseSpd: 32,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_31",
    starter: false,
    realm: "tide"
  },
  {
    id: "ya_yun_a",
    name: "\u5D16\u4E91\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 79,
    baseAtk: 23,
    baseDef: 19,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_32",
    evolveTo: "ya_yun_b",
    starter: false,
    realm: "void"
  },
  {
    id: "ya_yun_b",
    name: "\u5D16\u4E91\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 95,
    baseAtk: 31,
    baseDef: 25,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_32",
    evolveTo: "ya_yun_c",
    starter: false,
    realm: "void"
  },
  {
    id: "ya_yun_c",
    name: "\u5D16\u4E91\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 113,
    baseAtk: 39,
    baseDef: 31,
    baseSpd: 33,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_32",
    starter: false,
    realm: "void"
  },
  {
    id: "shuang_ya_a",
    name: "\u971C\u9E26\u5E7C",
    affinities: [
      "frost"
    ],
    baseHp: 80,
    baseAtk: 16,
    baseDef: 14,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_33",
    evolveTo: "shuang_ya_b",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "shuang_ya_b",
    name: "\u971C\u9E26\u7CBE",
    affinities: [
      "frost"
    ],
    baseHp: 96,
    baseAtk: 24,
    baseDef: 20,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_33",
    evolveTo: "shuang_ya_c",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "shuang_ya_c",
    name: "\u971C\u9E26\u541B",
    affinities: [
      "frost"
    ],
    baseHp: 114,
    baseAtk: 32,
    baseDef: 26,
    baseSpd: 34,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_33",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "gui_deng_a",
    name: "\u9B3C\u706F\u5E7C",
    affinities: [
      "shade"
    ],
    baseHp: 81,
    baseAtk: 17,
    baseDef: 15,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_34",
    evolveTo: "gui_deng_b",
    starter: false,
    realm: "wilds"
  },
  {
    id: "gui_deng_b",
    name: "\u9B3C\u706F\u7CBE",
    affinities: [
      "shade"
    ],
    baseHp: 97,
    baseAtk: 25,
    baseDef: 21,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_34",
    evolveTo: "gui_deng_c",
    starter: false,
    realm: "wilds"
  },
  {
    id: "gui_deng_c",
    name: "\u9B3C\u706F\u541B",
    affinities: [
      "shade"
    ],
    baseHp: 115,
    baseAtk: 33,
    baseDef: 27,
    baseSpd: 35,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_34",
    starter: false,
    realm: "wilds"
  },
  {
    id: "xing_shi_a",
    name: "\u661F\u77F3\u5E7C",
    affinities: [
      "light"
    ],
    baseHp: 82,
    baseAtk: 18,
    baseDef: 16,
    baseSpd: 14,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_35",
    evolveTo: "xing_shi_b",
    starter: false,
    realm: "woods"
  },
  {
    id: "xing_shi_b",
    name: "\u661F\u77F3\u7CBE",
    affinities: [
      "light"
    ],
    baseHp: 98,
    baseAtk: 26,
    baseDef: 22,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_35",
    evolveTo: "xing_shi_c",
    starter: false,
    realm: "woods"
  },
  {
    id: "xing_shi_c",
    name: "\u661F\u77F3\u541B",
    affinities: [
      "light"
    ],
    baseHp: 116,
    baseAtk: 34,
    baseDef: 28,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_35",
    starter: false,
    realm: "woods"
  },
  {
    id: "lu_yan_a",
    name: "\u7089\u7130\u5E7C",
    affinities: [
      "flame"
    ],
    baseHp: 83,
    baseAtk: 19,
    baseDef: 17,
    baseSpd: 15,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_36",
    evolveTo: "lu_yan_b",
    starter: false,
    realm: "market"
  },
  {
    id: "lu_yan_b",
    name: "\u7089\u7130\u7CBE",
    affinities: [
      "flame"
    ],
    baseHp: 99,
    baseAtk: 27,
    baseDef: 23,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_36",
    evolveTo: "lu_yan_c",
    starter: false,
    realm: "market"
  },
  {
    id: "lu_yan_c",
    name: "\u7089\u7130\u541B",
    affinities: [
      "flame"
    ],
    baseHp: 117,
    baseAtk: 35,
    baseDef: 29,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_36",
    starter: false,
    realm: "market"
  },
  {
    id: "tong_que_a",
    name: "\u94DC\u96C0\u5E7C",
    affinities: [
      "light"
    ],
    baseHp: 84,
    baseAtk: 20,
    baseDef: 18,
    baseSpd: 16,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_37",
    evolveTo: "tong_que_b",
    starter: false,
    realm: "marsh"
  },
  {
    id: "tong_que_b",
    name: "\u94DC\u96C0\u7CBE",
    affinities: [
      "light"
    ],
    baseHp: 100,
    baseAtk: 28,
    baseDef: 24,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_37",
    evolveTo: "tong_que_c",
    starter: false,
    realm: "marsh"
  },
  {
    id: "tong_que_c",
    name: "\u94DC\u96C0\u541B",
    affinities: [
      "light"
    ],
    baseHp: 118,
    baseAtk: 36,
    baseDef: 30,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_37",
    starter: false,
    realm: "marsh"
  },
  {
    id: "wei_she_a",
    name: "\u82C7\u86C7\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 85,
    baseAtk: 21,
    baseDef: 19,
    baseSpd: 17,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_38",
    evolveTo: "wei_she_b",
    starter: false,
    realm: "waste"
  },
  {
    id: "wei_she_b",
    name: "\u82C7\u86C7\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 101,
    baseAtk: 29,
    baseDef: 25,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_38",
    evolveTo: "wei_she_c",
    starter: false,
    realm: "waste"
  },
  {
    id: "wei_she_c",
    name: "\u82C7\u86C7\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 119,
    baseAtk: 37,
    baseDef: 31,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_38",
    starter: false,
    realm: "waste"
  },
  {
    id: "bo_chen_a",
    name: "\u6CE2\u5C18\u5E7C",
    affinities: [
      "tide"
    ],
    baseHp: 86,
    baseAtk: 22,
    baseDef: 14,
    baseSpd: 18,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_39",
    evolveTo: "bo_chen_b",
    starter: false,
    realm: "foothill"
  },
  {
    id: "bo_chen_b",
    name: "\u6CE2\u5C18\u7CBE",
    affinities: [
      "tide"
    ],
    baseHp: 102,
    baseAtk: 30,
    baseDef: 20,
    baseSpd: 24,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_39",
    evolveTo: "bo_chen_c",
    starter: false,
    realm: "foothill"
  },
  {
    id: "bo_chen_c",
    name: "\u6CE2\u5C18\u541B",
    affinities: [
      "tide"
    ],
    baseHp: 120,
    baseAtk: 38,
    baseDef: 26,
    baseSpd: 30,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_39",
    starter: false,
    realm: "foothill"
  },
  {
    id: "shi_hu_a",
    name: "\u77F3\u864E\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 87,
    baseAtk: 23,
    baseDef: 15,
    baseSpd: 19,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_40",
    evolveTo: "shi_hu_b",
    starter: false,
    realm: "shrine"
  },
  {
    id: "shi_hu_b",
    name: "\u77F3\u864E\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 103,
    baseAtk: 31,
    baseDef: 21,
    baseSpd: 25,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_40",
    evolveTo: "shi_hu_c",
    starter: false,
    realm: "shrine"
  },
  {
    id: "shi_hu_c",
    name: "\u77F3\u864E\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 121,
    baseAtk: 39,
    baseDef: 27,
    baseSpd: 31,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_40",
    starter: false,
    realm: "shrine"
  },
  {
    id: "lei_gu_a",
    name: "\u96F7\u9F13\u5E7C",
    affinities: [
      "bolt"
    ],
    baseHp: 88,
    baseAtk: 16,
    baseDef: 16,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_41",
    evolveTo: "lei_gu_b",
    starter: false,
    realm: "cavern"
  },
  {
    id: "lei_gu_b",
    name: "\u96F7\u9F13\u7CBE",
    affinities: [
      "bolt"
    ],
    baseHp: 104,
    baseAtk: 24,
    baseDef: 22,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_41",
    evolveTo: "lei_gu_c",
    starter: false,
    realm: "cavern"
  },
  {
    id: "lei_gu_c",
    name: "\u96F7\u9F13\u541B",
    affinities: [
      "bolt"
    ],
    baseHp: 122,
    baseAtk: 32,
    baseDef: 28,
    baseSpd: 32,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_41",
    starter: false,
    realm: "cavern"
  },
  {
    id: "han_mei_a",
    name: "\u5BD2\u6885\u5E7C",
    affinities: [
      "frost"
    ],
    baseHp: 89,
    baseAtk: 17,
    baseDef: 17,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_42",
    evolveTo: "han_mei_b",
    starter: false,
    realm: "snow"
  },
  {
    id: "han_mei_b",
    name: "\u5BD2\u6885\u7CBE",
    affinities: [
      "frost"
    ],
    baseHp: 105,
    baseAtk: 25,
    baseDef: 23,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_42",
    evolveTo: "han_mei_c",
    starter: false,
    realm: "snow"
  },
  {
    id: "han_mei_c",
    name: "\u5BD2\u6885\u541B",
    affinities: [
      "frost"
    ],
    baseHp: 123,
    baseAtk: 33,
    baseDef: 29,
    baseSpd: 33,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "rime_needle",
      "chill_dust"
    ],
    pactId: "catalog_pact_42",
    starter: false,
    realm: "snow"
  },
  {
    id: "you_lan_a",
    name: "\u5E7D\u5170\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 90,
    baseAtk: 18,
    baseDef: 18,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_43",
    evolveTo: "you_lan_b",
    starter: false,
    realm: "tide"
  },
  {
    id: "you_lan_b",
    name: "\u5E7D\u5170\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 106,
    baseAtk: 26,
    baseDef: 24,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_43",
    evolveTo: "you_lan_c",
    starter: false,
    realm: "tide"
  },
  {
    id: "you_lan_c",
    name: "\u5E7D\u5170\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 124,
    baseAtk: 34,
    baseDef: 30,
    baseSpd: 34,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_43",
    starter: false,
    realm: "tide"
  },
  {
    id: "hao_zhong_a",
    name: "\u7693\u949F\u5E7C",
    affinities: [
      "light"
    ],
    baseHp: 91,
    baseAtk: 19,
    baseDef: 19,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_44",
    evolveTo: "hao_zhong_b",
    starter: false,
    realm: "void"
  },
  {
    id: "hao_zhong_b",
    name: "\u7693\u949F\u7CBE",
    affinities: [
      "light"
    ],
    baseHp: 107,
    baseAtk: 27,
    baseDef: 25,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_44",
    evolveTo: "hao_zhong_c",
    starter: false,
    realm: "void"
  },
  {
    id: "hao_zhong_c",
    name: "\u7693\u949F\u541B",
    affinities: [
      "light"
    ],
    baseHp: 125,
    baseAtk: 35,
    baseDef: 31,
    baseSpd: 35,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "lamp_dust",
      "halo_cut"
    ],
    pactId: "catalog_pact_44",
    starter: false,
    realm: "void"
  },
  {
    id: "tao_wa_a",
    name: "\u9676\u74E6\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 92,
    baseAtk: 20,
    baseDef: 14,
    baseSpd: 14,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_45",
    evolveTo: "tao_wa_b",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "tao_wa_b",
    name: "\u9676\u74E6\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 108,
    baseAtk: 28,
    baseDef: 20,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_45",
    evolveTo: "tao_wa_c",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "tao_wa_c",
    name: "\u9676\u74E6\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 126,
    baseAtk: 36,
    baseDef: 26,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_45",
    starter: false,
    realm: "town_ruins"
  },
  {
    id: "he_ye_a",
    name: "\u8377\u53F6\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 93,
    baseAtk: 21,
    baseDef: 15,
    baseSpd: 15,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_46",
    evolveTo: "he_ye_b",
    starter: false,
    realm: "wilds"
  },
  {
    id: "he_ye_b",
    name: "\u8377\u53F6\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 109,
    baseAtk: 29,
    baseDef: 21,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_46",
    evolveTo: "he_ye_c",
    starter: false,
    realm: "wilds"
  },
  {
    id: "he_ye_c",
    name: "\u8377\u53F6\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 127,
    baseAtk: 37,
    baseDef: 27,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_46",
    starter: false,
    realm: "wilds"
  },
  {
    id: "song_ta_a",
    name: "\u677E\u5854\u5E7C",
    affinities: [
      "wood"
    ],
    baseHp: 94,
    baseAtk: 22,
    baseDef: 16,
    baseSpd: 16,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_47",
    evolveTo: "song_ta_b",
    starter: false,
    realm: "woods"
  },
  {
    id: "song_ta_b",
    name: "\u677E\u5854\u7CBE",
    affinities: [
      "wood"
    ],
    baseHp: 110,
    baseAtk: 30,
    baseDef: 22,
    baseSpd: 22,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_47",
    evolveTo: "song_ta_c",
    starter: false,
    realm: "woods"
  },
  {
    id: "song_ta_c",
    name: "\u677E\u5854\u541B",
    affinities: [
      "wood"
    ],
    baseHp: 128,
    baseAtk: 38,
    baseDef: 28,
    baseSpd: 28,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "peach_strike",
      "ward_bark"
    ],
    pactId: "catalog_pact_47",
    starter: false,
    realm: "woods"
  },
  {
    id: "jin_lu_a",
    name: "\u70EC\u7089\u5E7C",
    affinities: [
      "flame"
    ],
    baseHp: 95,
    baseAtk: 23,
    baseDef: 17,
    baseSpd: 17,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_48",
    evolveTo: "jin_lu_b",
    starter: false,
    realm: "market"
  },
  {
    id: "jin_lu_b",
    name: "\u70EC\u7089\u7CBE",
    affinities: [
      "flame"
    ],
    baseHp: 111,
    baseAtk: 31,
    baseDef: 23,
    baseSpd: 23,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_48",
    evolveTo: "jin_lu_c",
    starter: false,
    realm: "market"
  },
  {
    id: "jin_lu_c",
    name: "\u70EC\u7089\u541B",
    affinities: [
      "flame"
    ],
    baseHp: 129,
    baseAtk: 39,
    baseDef: 29,
    baseSpd: 29,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "kiln_burst",
      "hearth_spit"
    ],
    pactId: "catalog_pact_48",
    starter: false,
    realm: "market"
  },
  {
    id: "shi_deng_a",
    name: "\u77F3\u706F\u5E7C",
    affinities: [
      "stone"
    ],
    baseHp: 96,
    baseAtk: 16,
    baseDef: 18,
    baseSpd: 18,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_49",
    evolveTo: "shi_deng_b",
    starter: false,
    realm: "marsh"
  },
  {
    id: "shi_deng_b",
    name: "\u77F3\u706F\u7CBE",
    affinities: [
      "stone"
    ],
    baseHp: 112,
    baseAtk: 24,
    baseDef: 24,
    baseSpd: 24,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_49",
    evolveTo: "shi_deng_c",
    starter: false,
    realm: "marsh"
  },
  {
    id: "shi_deng_c",
    name: "\u77F3\u706F\u541B",
    affinities: [
      "stone"
    ],
    baseHp: 130,
    baseAtk: 32,
    baseDef: 30,
    baseSpd: 30,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "pebble_toss",
      "ridge_guard"
    ],
    pactId: "catalog_pact_49",
    starter: false,
    realm: "marsh"
  },
  {
    id: "yu_deng_a",
    name: "\u6E14\u706F\u5E7C",
    affinities: [
      "tide"
    ],
    baseHp: 97,
    baseAtk: 17,
    baseDef: 19,
    baseSpd: 19,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_50",
    evolveTo: "yu_deng_b",
    starter: false,
    realm: "waste"
  },
  {
    id: "yu_deng_b",
    name: "\u6E14\u706F\u7CBE",
    affinities: [
      "tide"
    ],
    baseHp: 113,
    baseAtk: 25,
    baseDef: 25,
    baseSpd: 25,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_50",
    evolveTo: "yu_deng_c",
    starter: false,
    realm: "waste"
  },
  {
    id: "yu_deng_c",
    name: "\u6E14\u706F\u541B",
    affinities: [
      "tide"
    ],
    baseHp: 131,
    baseAtk: 33,
    baseDef: 31,
    baseSpd: 31,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "well_thread",
      "drip_fang"
    ],
    pactId: "catalog_pact_50",
    starter: false,
    realm: "waste"
  },
  {
    id: "feng_duo_a",
    name: "\u98CE\u94CE\u5E7C",
    affinities: [
      "bolt"
    ],
    baseHp: 98,
    baseAtk: 18,
    baseDef: 14,
    baseSpd: 20,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_51",
    evolveTo: "feng_duo_b",
    starter: false,
    realm: "foothill"
  },
  {
    id: "feng_duo_b",
    name: "\u98CE\u94CE\u7CBE",
    affinities: [
      "bolt"
    ],
    baseHp: 114,
    baseAtk: 26,
    baseDef: 20,
    baseSpd: 26,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_51",
    evolveTo: "feng_duo_c",
    starter: false,
    realm: "foothill"
  },
  {
    id: "feng_duo_c",
    name: "\u98CE\u94CE\u541B",
    affinities: [
      "bolt"
    ],
    baseHp: 132,
    baseAtk: 34,
    baseDef: 26,
    baseSpd: 32,
    artIds: [
      "cinder_claw",
      "ash_veil",
      "spark_cut",
      "static_web"
    ],
    pactId: "catalog_pact_51",
    starter: false,
    realm: "foothill"
  },
  {
    id: "mie_zhu_a",
    name: "\u706D\u70DB\u5E7C",
    affinities: [
      "shade"
    ],
    baseHp: 99,
    baseAtk: 19,
    baseDef: 15,
    baseSpd: 21,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_52",
    evolveTo: "mie_zhu_b",
    starter: false,
    realm: "shrine"
  },
  {
    id: "mie_zhu_b",
    name: "\u706D\u70DB\u7CBE",
    affinities: [
      "shade"
    ],
    baseHp: 115,
    baseAtk: 27,
    baseDef: 21,
    baseSpd: 27,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_52",
    evolveTo: "mie_zhu_c",
    starter: false,
    realm: "shrine"
  },
  {
    id: "mie_zhu_c",
    name: "\u706D\u70DB\u541B",
    affinities: [
      "shade"
    ],
    baseHp: 133,
    baseAtk: 35,
    baseDef: 27,
    baseSpd: 33,
    artIds: [
      "ash_veil",
      "cinder_claw",
      "ink_swipe",
      "shade_nudge"
    ],
    pactId: "catalog_pact_52",
    starter: false,
    realm: "shrine"
  }
];

// src/tables/type-chart.json
var type_chart_default = {
  flame: { flame: 1, tide: 0.5, stone: 0.5, wood: 2, bolt: 1, frost: 2, shade: 1, light: 1 },
  tide: { flame: 2, tide: 1, stone: 2, wood: 0.5, bolt: 0.5, frost: 1, shade: 1, light: 1 },
  stone: { flame: 2, tide: 0.5, stone: 1, wood: 0.5, bolt: 2, frost: 1, shade: 1, light: 1 },
  wood: { flame: 0.5, tide: 2, stone: 2, wood: 1, bolt: 1, frost: 0.5, shade: 1, light: 1 },
  bolt: { flame: 1, tide: 2, stone: 0.5, wood: 1, bolt: 1, frost: 1, shade: 2, light: 0.5 },
  frost: { flame: 0.5, tide: 1, stone: 1, wood: 2, bolt: 1, frost: 1, shade: 1, light: 2 },
  shade: { flame: 1, tide: 1, stone: 1, wood: 1, bolt: 0.5, frost: 1, shade: 1, light: 2 },
  light: { flame: 1, tide: 1, stone: 1, wood: 1, bolt: 2, frost: 0.5, shade: 2, light: 1 }
};

// src/tables/load-tables.ts
function loadTables() {
  return {
    spirits: spirits_default,
    arts: arts_default,
    pacts: pacts_default,
    boons: boons_default,
    realms: realms_default,
    typeChart: type_chart_default
  };
}
function getSpirit(id) {
  const row = loadTables().spirits.find((s) => s.id === id);
  if (!row) {
    throw new Error(`unknown spirit: ${id}`);
  }
  return row;
}
function getArt(id) {
  const row = loadTables().arts.find((a) => a.id === id);
  if (!row) {
    throw new Error(`unknown art: ${id}`);
  }
  return row;
}

// src/combat/spirit-entity.ts
function makeSpirit(opts) {
  const row = getSpirit(opts.id);
  const scale = 1 + (opts.level - 1) * 0.08;
  const maxHp = opts.hpOverride ?? Math.round(row.baseHp * scale);
  const focusLeft = {};
  for (const artId of row.artIds) {
    focusLeft[artId] = getArt(artId).focus;
  }
  return {
    instanceId: opts.instanceId ?? `${opts.side}-${opts.id}`,
    id: row.id,
    name: row.name,
    side: opts.side,
    level: opts.level,
    affinities: row.affinities,
    hp: maxHp,
    maxHp,
    atk: opts.atkOverride ?? Math.round(row.baseAtk * scale),
    def: opts.defOverride ?? Math.round(row.baseDef * scale),
    spd: Math.round(row.baseSpd * scale),
    artIds: row.artIds,
    focusLeft,
    stages: { atk: 0, def: 0, spd: 0 },
    ailment: null,
    guarding: false,
    substituteHp: 0,
    pactId: row.pactId,
    hiddenPact: opts.hiddenPact ?? false,
    charms: [],
    form: "none",
    formTurns: 0,
    formBackup: null
  };
}
function isFainted(spirit) {
  return spirit.hp <= 0;
}

// src/rng/rng-stream.ts
function hashSeed(text) {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  h = Math.imul(h ^ h >>> 16, 2246822507);
  h = Math.imul(h ^ h >>> 13, 3266489909);
  return (h ^ h >>> 16) >>> 0;
}
var RngStream = class _RngStream {
  constructor(seed, offset = 0) {
    this.seed = seed;
    this.offset = offset;
    this.state = hashSeed(`${seed}:${offset}`);
  }
  seed;
  offset;
  state;
  child(offset) {
    return new _RngStream(this.seed, this.offset + offset);
  }
  float() {
    this.state = Math.imul(this.state, 1664525) + 1013904223 >>> 0;
    return this.state / 4294967296;
  }
  int(max) {
    if (max <= 0) {
      throw new Error("max must be positive");
    }
    return Math.floor(this.float() * max);
  }
};

// src/combat/field.ts
function emptyField() {
  return {
    omen: "clear",
    ley: "none",
    hazards: { player: [], foe: [] }
  };
}
function omenMul(omen, artAffinity) {
  if (omen === "rain" || omen === "heavy_rain") {
    if (artAffinity === "tide") {
      return 1.5;
    }
    if (artAffinity === "flame") {
      return 0.5;
    }
  }
  if (omen === "sun" || omen === "harsh_sun") {
    if (artAffinity === "flame") {
      return 1.5;
    }
    if (artAffinity === "tide") {
      return 0.5;
    }
  }
  return 1;
}
function leyMul(ley, artAffinity) {
  if (ley === "bolt" && artAffinity === "bolt") {
    return 1.3;
  }
  if (ley === "wood" && artAffinity === "wood") {
    return 1.3;
  }
  return 1;
}
function applyHazards(unit, side, field) {
  const spikes = field.hazards[side].filter((h) => h === "spikes").length;
  if (spikes <= 0 || unit.hp <= 0) {
    return;
  }
  const eighths = Math.min(3, spikes);
  const lost = Math.max(1, Math.floor(unit.maxHp * eighths / 8));
  unit.hp = Math.max(0, unit.hp - lost);
}

// src/combat/pact.ts
var HIDDEN_PACT_BOON = "hidden_pact_charm";
function hiddenPactOn(opts) {
  if (opts.boonIds?.includes(HIDDEN_PACT_BOON)) {
    return true;
  }
  return Boolean(opts.spiritId && opts.secondPact?.includes(opts.spiritId));
}
function hooksFor(pactId, hidden) {
  const pact = loadTables().pacts.find((row) => row.id === pactId);
  if (!pact) {
    return [];
  }
  if (!hidden) {
    return pact.hooks ?? [];
  }
  return [...pact.hooks ?? [], ...pact.hiddenHooks ?? []];
}
function pactDealMul(pactId, artAffinity, hidden = false) {
  return hooksFor(pactId, hidden).reduce((mul, hook) => {
    if (hook.when !== "deal") {
      return mul;
    }
    if (hook.affinity && hook.affinity !== artAffinity) {
      return mul;
    }
    return mul * hook.mul;
  }, 1);
}
function pactTakeMul(pactId, hidden = false) {
  return hooksFor(pactId, hidden).reduce((mul, hook) => hook.when === "take" ? mul * hook.mul : mul, 1);
}
function applyPactSwitch(unit) {
  for (const hook of hooksFor(unit.pactId, unit.hiddenPact)) {
    if (hook.when === "switchIn") {
      unit.stages[hook.stat] = Math.max(-6, Math.min(6, unit.stages[hook.stat] + hook.delta));
    }
  }
}

// src/combat/effects/apply-art.ts
var STRUGGLE_ID = "struggle";
function artToUse(user, requested) {
  const hasFocus = user.artIds.some((id) => (user.focusLeft[id] ?? 0) > 0);
  return hasFocus ? requested : STRUGGLE_ID;
}
function stageMul(stage) {
  const clamped = Math.max(-6, Math.min(6, stage));
  return clamped >= 0 ? (2 + clamped) / 2 : 2 / (2 - clamped);
}
function tickAilments(unit) {
  if (!unit.ailment || isFainted(unit)) {
    return;
  }
  if (unit.ailment.kind === "burn" || unit.ailment.kind === "poison") {
    const lost = Math.max(1, Math.floor(unit.maxHp / 16));
    unit.hp = Math.max(0, unit.hp - lost);
    return;
  }
  if (unit.ailment.kind === "toxic") {
    const lost = Math.max(1, Math.floor(unit.maxHp * unit.ailment.layers / 16));
    unit.hp = Math.max(0, unit.hp - lost);
    unit.ailment.layers = Math.min(15, unit.ailment.layers + 1);
  }
}
function clearGuard(unit) {
  unit.guarding = false;
}
function applyArt(user, target, artId, rng, emit = () => void 0, ctx = {}) {
  if (artId === STRUGGLE_ID) {
    applyStruggle(user, target, rng, emit, ctx);
    return;
  }
  const art = getArt(artId);
  const left = user.focusLeft[artId] ?? 0;
  if (left <= 0) {
    return;
  }
  user.focusLeft[artId] = left - 1;
  emit({
    type: "artPlayed",
    userId: user.instanceId,
    artId,
    targetId: target.instanceId
  });
  for (const effect of art.effects) {
    runBlock(user, target, art.power, art.affinity, effect, rng, emit, ctx);
  }
}
function applyStruggle(user, target, rng, emit, ctx) {
  emit({
    type: "artPlayed",
    userId: user.instanceId,
    artId: STRUGGLE_ID,
    targetId: target.instanceId
  });
  const dealt = dealHits(user, target, 50, "flame", 1, rng, emit, ctx);
  const recoil = Math.max(1, Math.floor(dealt / 4));
  user.hp = Math.max(0, user.hp - recoil);
  emit({ type: "hpChange", targetId: user.instanceId, hp: user.hp, maxHp: user.maxHp });
}
function runBlock(user, target, power, affinity, effect, rng, emit, ctx) {
  if (effect.kind === "heal") {
    user.hp = Math.min(user.maxHp, user.hp + Math.floor(user.maxHp * effect.ratio));
    emit({ type: "hpChange", targetId: user.instanceId, hp: user.hp, maxHp: user.maxHp });
    return;
  }
  if (effect.kind === "guard") {
    user.guarding = true;
    return;
  }
  if (effect.kind === "substitute") {
    if (user.substituteHp > 0 || user.hp <= 1) {
      return;
    }
    const cost = Math.max(1, Math.floor(user.maxHp * 0.25));
    if (user.hp <= cost) {
      return;
    }
    user.hp -= cost;
    user.substituteHp = cost;
    emit({ type: "hpChange", targetId: user.instanceId, hp: user.hp, maxHp: user.maxHp });
    return;
  }
  if (effect.kind === "stage") {
    const who = effect.on === "user" ? user : target;
    if (effect.on === "target" && target.guarding) {
      return;
    }
    who.stages[effect.stat] = Math.max(-6, Math.min(6, who.stages[effect.stat] + effect.delta));
    return;
  }
  if (target.guarding) {
    return;
  }
  if (effect.kind === "status") {
    const chance = effect.chance ?? 1;
    if (rng.float() >= chance || target.ailment) {
      return;
    }
    target.ailment = effect.status === "toxic" ? { kind: "toxic", layers: 1 } : { kind: effect.status };
    return;
  }
  if (effect.kind === "damage" || effect.kind === "drain") {
    const hits = effect.kind === "damage" ? effect.hits ?? 1 : 1;
    const dealt = dealHits(user, target, power, affinity, hits, rng, emit, ctx);
    if (effect.kind === "drain") {
      user.hp = Math.min(user.maxHp, user.hp + Math.floor(dealt * effect.ratio));
      emit({ type: "hpChange", targetId: user.instanceId, hp: user.hp, maxHp: user.maxHp });
    }
  }
}
function dealHits(user, target, power, affinity, hits, rng, emit, ctx) {
  if (power <= 0 || target.guarding) {
    return 0;
  }
  const tables = loadTables();
  let dealt = 0;
  const atk = user.atk * stageMul(user.stages.atk) * (user.ailment?.kind === "burn" ? 0.5 : 1);
  const def = Math.max(1, target.def * stageMul(target.stages.def));
  const field = ctx.field;
  const extra = omenMul(field?.omen ?? "clear", affinity) * leyMul(field?.ley ?? "none", affinity) * pactDealMul(user.pactId, affinity, user.hiddenPact) * pactTakeMul(target.pactId, target.hiddenPact) * (ctx.powerMul ?? 1);
  for (let i = 0; i < hits; i++) {
    if (isFainted(target) && target.substituteHp <= 0) {
      break;
    }
    const dmg = calcDamage({
      power,
      atk,
      def,
      level: user.level,
      affinityMod: clampAffinity(affinityMod(affinity, target.affinities, tables.typeChart), ctx.affinityClamp) * extra,
      boneMod: 1,
      rng
    });
    dealt += absorbDamage(target, dmg, emit);
  }
  return dealt;
}
function absorbDamage(target, dmg, emit) {
  if (target.substituteHp > 0) {
    const taken2 = Math.min(target.substituteHp, dmg);
    target.substituteHp -= taken2;
    return taken2;
  }
  const taken = Math.min(target.hp, dmg);
  target.hp = Math.max(0, target.hp - dmg);
  emit({ type: "hpChange", targetId: target.instanceId, hp: target.hp, maxHp: target.maxHp });
  return taken;
}

// src/flow/flow-director.ts
var FlowDirector = class {
  queued = [];
  interrupts = [];
  push(step) {
    this.queued.push(step);
  }
  interrupt(step) {
    this.interrupts.push(step);
  }
  next() {
    return this.interrupts.shift() ?? this.queued.shift();
  }
  drain() {
    let step = this.next();
    while (step) {
      step.run();
      step = this.next();
    }
  }
};

// src/combat/duel.ts
function startDuel(opts) {
  const rng = new RngStream(opts.seed);
  const director = new FlowDirector();
  const emit = opts.onEvent ?? (() => void 0);
  const player = makeSpirit({
    id: opts.playerId,
    side: "player",
    level: opts.level,
    atkOverride: opts.playerAtkOverride
  });
  const foe = makeSpirit({
    id: opts.foeId,
    side: "foe",
    level: opts.level,
    defOverride: opts.foeDefOverride,
    hpOverride: opts.foeHpOverride
  });
  const duel = {
    player,
    foe,
    waitingFor: null,
    result: null,
    chooseArt(artId) {
      if (duel.waitingFor !== "command") {
        throw new Error("not waiting for command");
      }
      duel.waitingFor = null;
      director.push({
        name: "ArtResolve",
        run: () => resolveTurn(artId)
      });
      director.push({
        name: "FaintCheck",
        run: faintCheck
      });
      director.drain();
      if (!duel.result) {
        director.push({
          name: "CommandPick",
          run: commandPick
        });
        director.drain();
      }
    }
  };
  function commandPick() {
    duel.waitingFor = "command";
    emit({ type: "awaitCommand", actorId: player.instanceId });
  }
  function playArt(user, target, artId) {
    applyArt(user, target, artId, rng, emit);
  }
  function resolveTurn(playerArtId) {
    const foeArtId = foe.artIds[0];
    const order = player.spd >= foe.spd ? [
      () => playArt(player, foe, playerArtId),
      () => playArt(foe, player, foeArtId)
    ] : [
      () => playArt(foe, player, foeArtId),
      () => playArt(player, foe, playerArtId)
    ];
    for (const act of order) {
      act();
      if (isFainted(player) || isFainted(foe)) {
        return;
      }
    }
  }
  function faintCheck() {
    if (isFainted(foe)) {
      emit({ type: "faint", targetId: foe.instanceId });
      duel.result = "win";
      duel.waitingFor = "over";
      emit({ type: "runOver", result: "win" });
      return;
    }
    if (isFainted(player)) {
      emit({ type: "faint", targetId: player.instanceId });
      duel.result = "lose";
      duel.waitingFor = "over";
      emit({ type: "runOver", result: "lose" });
    }
  }
  director.push({
    name: "EncounterStart",
    run: () => {
      emit({ type: "encounterStart", playerId: player.id, foeId: foe.id });
    }
  });
  director.push({
    name: "CommandPick",
    run: commandPick
  });
  director.drain();
  return duel;
}

// src/combat/charm.ts
function tickCharms(unit) {
  if (isFainted(unit) || !unit.charms.includes("meal")) {
    return;
  }
  const heal = Math.max(1, Math.floor(unit.maxHp / 16));
  unit.hp = Math.min(unit.maxHp, unit.hp + heal);
}

// src/combat/trainer-ai.ts
function pickTrainerArt(user, target) {
  const usable = user.artIds.filter((id) => (user.focusLeft[id] ?? 0) > 0);
  if (usable.length === 0) {
    return STRUGGLE_ID;
  }
  const chart = loadTables().typeChart;
  let best = usable[0];
  let bestScore = -Infinity;
  for (const artId of usable) {
    const art = getArt(artId);
    const damaging = art.effects.some((effect) => effect.kind === "damage" || effect.kind === "drain");
    const mul = damaging ? affinityMod(art.affinity, target.affinities, chart) : 0;
    const estimate = art.power * user.atk * (user.level / 50) / Math.max(target.def, 1);
    let score = mul * Math.max(art.power, 1);
    if (damaging && estimate * mul >= target.hp) {
      score += 1e3;
    }
    if (score > bestScore) {
      bestScore = score;
      best = artId;
    }
  }
  return best;
}

// src/combat/boss.ts
function createBoss(shields) {
  return {
    shields,
    maxShields: shields,
    stage: 1,
    dual: false,
    lostSwallow: false
  };
}
function absorbFaint(state, foe) {
  if (state.shields > 0) {
    state.shields -= 1;
    foe.hp = foe.maxHp;
    return "shield";
  }
  if (state.stage === 1) {
    enterSecondStage(state, foe);
    return "phase2";
  }
  return "down";
}
function secondTarget(foe) {
  return makeSpirit({
    id: foe.id,
    side: "foe",
    level: foe.level,
    instanceId: `${foe.instanceId}-b`
  });
}
function enterSecondStage(state, foe) {
  state.stage = 2;
  state.shields = state.maxShields + 1;
  state.dual = true;
  state.lostSwallow = true;
  foe.hp = foe.maxHp;
  foe.ailment = null;
  foe.stages = { atk: 2, def: 0, spd: 0 };
  foe.charms = ["lost_swallow"];
  if (!foe.artIds.includes("void_cannon")) {
    foe.artIds = [...foe.artIds, "void_cannon"];
    foe.focusLeft.void_cannon = getArt("void_cannon").focus;
  }
}

// src/combat/side.ts
var LURE_RATE = {
  lure_fan: 0.1,
  lure_shang: 0.25,
  lure_te: 0.5,
  lure_gold: 1
};
function lureRate(id) {
  return LURE_RATE[id] ?? 0;
}
function addLure(lures, id) {
  const next = lures.filter((row) => row.id !== id);
  next.push({ id, remaining: 10, rate: lureRate(id) });
  return next;
}
function tickLures(lures) {
  return lures.map((row) => ({ ...row, remaining: row.remaining - 1 })).filter((row) => row.remaining > 0);
}
function dualChance(lures, wave = 1) {
  const base = wave <= 20 ? 0.03 : wave <= 180 ? 0.2 : 0.03;
  return Math.min(1, base + lures.reduce((sum, row) => sum + row.rate, 0));
}
function canDual(opts) {
  if (opts.mode === "endless" && opts.boss && opts.wave % 50 === 0) {
    return false;
  }
  if (opts.wave <= 10 && !opts.boss) {
    return false;
  }
  return true;
}
function speedOrder(units) {
  return [...units].filter((unit) => !isFainted(unit)).sort(
    (a, b) => b.spd - a.spd || (a.side === "player" && b.side !== "player" ? -1 : b.side === "player" && a.side !== "player" ? 1 : 0) || a.instanceId.localeCompare(b.instanceId)
  );
}
function pickTarget(foes, targetId) {
  const living = foes.filter((unit) => !isFainted(unit));
  if (living.length === 0) {
    throw new Error("no target");
  }
  return living.find((unit) => unit.instanceId === targetId) ?? living[0];
}

// src/combat/form-change.ts
var FORM_KEY_BOON = {
  sanctify: "sanctify_cuff",
  colossus: "colossus_band"
};
function formKeysFrom(run) {
  const keys = [];
  if (run.boonIds.includes(FORM_KEY_BOON.sanctify)) {
    keys.push("sanctify");
  }
  if (run.boonIds.includes(FORM_KEY_BOON.colossus)) {
    keys.push("colossus");
  }
  if (run.hasApexBand || run.boonIds.includes("apex_vessel")) {
    keys.push("apex");
  }
  return keys;
}
function enterForm(unit, form, apexAffinity) {
  if (unit.form !== "none") {
    revertForm(unit);
  }
  unit.formBackup = {
    atk: unit.atk,
    maxHp: unit.maxHp,
    hp: unit.hp,
    affinities: [...unit.affinities]
  };
  unit.form = form;
  unit.formTurns = form === "apex" ? 99 : 3;
  if (form === "sanctify") {
    unit.atk = Math.round(unit.atk * 1.5);
  }
  if (form === "colossus") {
    unit.maxHp *= 2;
    unit.hp *= 2;
  }
  if (form === "apex" && apexAffinity) {
    unit.affinities = [apexAffinity];
  }
}
function tickForm(unit) {
  if (unit.form === "none") {
    return;
  }
  unit.formTurns -= 1;
  if (unit.formTurns <= 0) {
    revertForm(unit);
  }
}
function revertForm(unit) {
  const backup = unit.formBackup;
  if (!backup) {
    unit.form = "none";
    unit.formTurns = 0;
    return;
  }
  const ratio = unit.maxHp > 0 ? unit.hp / unit.maxHp : 0;
  unit.atk = backup.atk;
  unit.maxHp = backup.maxHp;
  unit.affinities = backup.affinities;
  unit.hp = Math.max(1, Math.min(backup.maxHp, Math.round(backup.maxHp * ratio)));
  if (unit.hp <= 0) {
    unit.hp = 0;
  }
  unit.form = "none";
  unit.formTurns = 0;
  unit.formBackup = null;
}

// src/catch/seal.ts
var SEAL_TIERS = [
  { id: "fan", name: "\u51E1\u9547", mul: 1 },
  { id: "shang", name: "\u4E0A\u9547", mul: 1.5 },
  { id: "te", name: "\u7279\u9547", mul: 2 },
  { id: "qi", name: "\u5947\u9547", mul: 3 },
  { id: "jie", name: "\u52AB\u9547", mul: 255 }
];
function speciesCatchRate(row) {
  return row.evolveTo ? 255 : 45;
}
function catchChance(opts) {
  const hpRatio = Math.min(1, Math.max(0, opts.hpRatio));
  const hpTerm = (3 - 2 * hpRatio) / 3;
  const a = hpTerm * opts.catchRate * opts.sealMul * (1 + opts.catchBoon);
  return Math.min(1, Math.max(0, a / 255));
}
function trySeal(opts) {
  const chance = catchChance(opts);
  return { chance, caught: opts.rng.float() < chance };
}

// src/combat/party-battle.ts
function startPartyBattle(opts) {
  if (opts.partyIds.length === 0 || opts.partyIds.length > 6) {
    throw new Error("party must have 1 to 6 spirits");
  }
  const rng = new RngStream(opts.seed);
  const director = new FlowDirector();
  const emit = opts.onEvent ?? (() => void 0);
  const partyLevel = opts.partyLevel ?? opts.level;
  const party = opts.partyIds.map(
    (id, index) => makeSpirit({
      id,
      side: "player",
      level: opts.partyLevels?.[index] ?? partyLevel,
      instanceId: `player-${index}-${id}`,
      hpOverride: index === 0 ? opts.playerHpOverride : void 0,
      defOverride: index === 0 ? opts.playerDefOverride : void 0,
      hiddenPact: hiddenPactOn({
        boonIds: opts.hiddenPact ? [HIDDEN_PACT_BOON] : [],
        secondPact: opts.secondPact,
        spiritId: id
      })
    })
  );
  const bonus = opts.statBonus ?? { atk: 0, def: 0, spd: 0, hp: 0 };
  for (const [index, unit] of party.entries()) {
    unit.atk += bonus.atk;
    unit.def += bonus.def;
    unit.spd += bonus.spd;
    unit.maxHp += bonus.hp;
    unit.hp += bonus.hp;
    if (opts.hpRatios) {
      const ratio = Math.min(1, Math.max(0, opts.hpRatios[index] ?? 1));
      unit.hp = Math.round(unit.maxHp * ratio);
    }
  }
  const startIndex = Math.max(0, party.findIndex((unit) => !isFainted(unit)));
  const foeIds = opts.foeIds ?? [opts.foeId];
  const foes = foeIds.map(
    (id, index) => makeSpirit({
      id,
      side: "foe",
      level: opts.level,
      instanceId: `foe-${index}-${id}`,
      atkOverride: opts.foeAtkOverride,
      hpOverride: index === 0 ? opts.foeHpOverride : void 0
    })
  );
  const foe = foes[0];
  let pendingArt = null;
  const battle = {
    kind: opts.kind,
    party,
    foe,
    foes,
    boss: opts.legend || (opts.shields ?? 0) > 0 ? createBoss(opts.shields ?? 0) : null,
    activeIndex: startIndex,
    potions: opts.potions ?? 0,
    seals: opts.seals ?? [0, 0, 0, 0, 0],
    formKeys: opts.formKeys ?? [],
    field: emptyField(),
    waitingFor: null,
    result: null,
    caught: false,
    get active() {
      return battle.party[battle.activeIndex];
    },
    choose(command) {
      if (battle.waitingFor === "over") {
        throw new Error("battle is over");
      }
      if (battle.waitingFor === "switch") {
        if (command.type !== "switch") {
          throw new Error("must switch");
        }
        assertSwitch(command.partyIndex);
        battle.waitingFor = null;
        director.push({
          name: "ForcedSwitch",
          run: () => applySwitch(command.partyIndex, false)
        });
        director.drain();
        faintCheck();
        if (!battle.result && battle.waitingFor !== "switch") {
          director.push({
            name: "CommandPick",
            run: commandPick
          });
          director.drain();
        }
        return;
      }
      if (battle.waitingFor === "target") {
        if (command.type !== "target" || !pendingArt) {
          throw new Error("must pick a target");
        }
        const artId = pendingArt;
        pendingArt = null;
        battle.waitingFor = null;
        finishTurn({ type: "art", artId, targetId: command.targetId });
        return;
      }
      if (battle.waitingFor !== "command") {
        throw new Error("not waiting for command");
      }
      if (command.type === "run" && battle.kind === "trainer") {
        throw new Error("cannot run from a trainer");
      }
      if (command.type === "seal") {
        if (battle.kind !== "wild" || !opts.catchable) {
          throw new Error("cannot seal this encounter");
        }
        const count = battle.seals[command.tier] ?? 0;
        if (count <= 0) {
          throw new Error("no seal");
        }
      }
      if (command.type === "bag" && battle.potions <= 0) {
        throw new Error("bag empty");
      }
      if (command.type === "form" && !battle.formKeys.includes(command.form)) {
        throw new Error("form locked");
      }
      if (command.type === "switch") {
        assertSwitch(command.partyIndex);
      }
      if (command.type === "art" && livingFoes().length > 1 && !command.targetId) {
        pendingArt = command.artId;
        battle.waitingFor = "target";
        emit({ type: "awaitTarget" });
        return;
      }
      battle.waitingFor = null;
      finishTurn(command);
    }
  };
  function finishTurn(command) {
    director.push({
      name: "CommandResolve",
      run: () => resolveCommand(command)
    });
    director.push({
      name: "FaintCheck",
      run: faintCheck
    });
    director.drain();
    if (!battle.result && battle.waitingFor !== "switch") {
      for (const unit of fielded()) {
        tickAilments(unit);
        tickCharms(unit);
        tickForm(unit);
        clearGuard(unit);
      }
      faintCheck();
    }
    if (!battle.result && battle.waitingFor !== "switch") {
      director.push({
        name: "CommandPick",
        run: commandPick
      });
      director.drain();
    }
  }
  function commandPick() {
    battle.waitingFor = "command";
    emit({ type: "awaitCommand", actorId: battle.active.instanceId });
  }
  function applyArt2(user, target, artId) {
    const affinity = artId === STRUGGLE_ID ? user.affinities[0] : getArt(artId).affinity;
    applyArt(user, target, artId, rng, emit, {
      field: battle.field,
      affinityClamp: opts.affinityClamp,
      powerMul: affinity ? opts.artMul?.(user, affinity) ?? 1 : 1
    });
  }
  function assertSwitch(partyIndex) {
    if (partyIndex === battle.activeIndex) {
      throw new Error("already active");
    }
    const next = battle.party[partyIndex];
    if (!next || isFainted(next)) {
      throw new Error("cannot switch to that spirit");
    }
  }
  function applySwitch(partyIndex, foeActs) {
    const next = battle.party[partyIndex];
    battle.activeIndex = partyIndex;
    emit({ type: "switchIn", actorId: next.instanceId });
    applyHazards(next, next.side, battle.field);
    applyPactSwitch(next);
    if (foeActs) {
      foeTurn();
    }
  }
  function livingFoes() {
    return battle.foes.filter((unit) => !isFainted(unit));
  }
  function fielded() {
    const ally = battle.foes.length > 1 ? battle.party[1] : void 0;
    const units = [battle.active];
    if (ally && ally !== battle.active) {
      units.push(ally);
    }
    units.push(...battle.foes);
    return units;
  }
  function foeTurn() {
    for (const unit of livingFoes()) {
      if (!isFainted(battle.active)) {
        applyArt2(unit, battle.active, pickTrainerArt(unit, battle.active));
      }
    }
  }
  function resolveCommand(command) {
    if (command.type === "run") {
      battle.result = "fled";
      battle.waitingFor = "over";
      emit({ type: "fled" });
      emit({ type: "runOver", result: "fled" });
      return;
    }
    if (command.type === "seal") {
      battle.seals[command.tier] -= 1;
      const mul = SEAL_TIERS[command.tier]?.mul ?? SEAL_TIERS[0].mul;
      const hpRatio = battle.foe.maxHp <= 0 ? 1 : battle.foe.hp / battle.foe.maxHp;
      const result = trySeal({
        hpRatio,
        sealMul: mul,
        catchRate: speciesCatchRate(getSpirit(battle.foe.id)),
        catchBoon: opts.catchBoon ?? 0,
        rng
      });
      emit({
        type: "sealTried",
        name: battle.foe.name,
        caught: result.caught,
        chance: result.chance
      });
      if (result.caught) {
        battle.caught = true;
        battle.result = "win";
        battle.waitingFor = "over";
        emit({ type: "runOver", result: "win" });
        return;
      }
      foeTurn();
      return;
    }
    if (command.type === "switch") {
      applySwitch(command.partyIndex, true);
      return;
    }
    if (command.type === "bag") {
      battle.potions -= 1;
      const heal = Math.max(20, Math.floor(battle.active.maxHp * 0.1));
      battle.active.hp = Math.min(battle.active.maxHp, battle.active.hp + heal);
      emit({
        type: "hpChange",
        targetId: battle.active.instanceId,
        hp: battle.active.hp,
        maxHp: battle.active.maxHp
      });
      foeTurn();
      return;
    }
    if (command.type === "form") {
      enterForm(battle.active, command.form, command.affinity);
      foeTurn();
      return;
    }
    if (command.type === "target") {
      return;
    }
    const player = battle.active;
    const artId = artToUse(player, command.artId);
    const target = pickTarget(battle.foes, command.targetId);
    for (const unit of speedOrder(fielded())) {
      if (isFainted(player) || livingFoes().length === 0) {
        return;
      }
      if (unit === player) {
        applyArt2(player, target, artId);
        continue;
      }
      if (unit.side === "player") {
        const foe2 = pickTarget(battle.foes);
        applyArt2(unit, foe2, pickTrainerArt(unit, foe2));
        continue;
      }
      if (!isFainted(unit) && !isFainted(player)) {
        applyArt2(unit, player, pickTrainerArt(unit, player));
      }
    }
  }
  function hasBench() {
    return battle.party.some((spirit, index) => index !== battle.activeIndex && !isFainted(spirit));
  }
  function faintCheck() {
    if (battle.result) {
      return;
    }
    const down = battle.foes.filter((unit) => isFainted(unit));
    for (const unit of down) {
      if (unit === battle.foe && battle.boss) {
        emit({ type: "faint", targetId: unit.instanceId });
        const absorbed = absorbFaint(battle.boss, battle.foe);
        if (absorbed !== "down") {
          if (battle.boss.dual && battle.foes.length < 2) {
            battle.foes.push(secondTarget(battle.foe));
          }
          return;
        }
      }
    }
    if (livingFoes().length === 0) {
      emit({ type: "faint", targetId: battle.foe.instanceId });
      battle.result = "win";
      battle.waitingFor = "over";
      emit({ type: "runOver", result: "win" });
      return;
    }
    if (isFainted(battle.active)) {
      emit({ type: "faint", targetId: battle.active.instanceId });
      if (hasBench()) {
        battle.waitingFor = "switch";
        emit({ type: "awaitSwitch" });
        return;
      }
      battle.result = "lose";
      battle.waitingFor = "over";
      emit({ type: "runOver", result: "lose" });
    }
  }
  director.push({
    name: "EncounterStart",
    run: () => {
      emit({ type: "encounterStart", playerId: battle.active.id, foeId: battle.foe.id });
    }
  });
  director.push({
    name: "CommandPick",
    run: commandPick
  });
  director.drain();
  return battle;
}

// src/tables/realm-graph.json
var realm_graph_default = {
  town_ruins: {
    neighbors: [
      { id: "wilds", weight: 1 },
      { id: "market", weight: 1 },
      { id: "marsh", weight: 1 }
    ]
  },
  wilds: {
    neighbors: [
      { id: "town_ruins", weight: 1 },
      { id: "woods", weight: 1 },
      { id: "waste", weight: 1 }
    ]
  },
  woods: {
    neighbors: [
      { id: "wilds", weight: 1 },
      { id: "shrine", weight: 1 },
      { id: "snow", weight: 1 }
    ]
  },
  market: {
    neighbors: [
      { id: "town_ruins", weight: 1 },
      { id: "cavern", weight: 1 },
      { id: "shrine", weight: 1 }
    ]
  },
  marsh: {
    neighbors: [
      { id: "town_ruins", weight: 1 },
      { id: "tide", weight: 1 },
      { id: "market", weight: 1 }
    ]
  },
  waste: {
    neighbors: [
      { id: "wilds", weight: 1 },
      { id: "foothill", weight: 1 },
      { id: "cavern", weight: 1 }
    ]
  },
  foothill: {
    neighbors: [
      { id: "waste", weight: 1 },
      { id: "snow", weight: 1 },
      { id: "shrine", weight: 1 }
    ]
  },
  shrine: {
    neighbors: [
      { id: "woods", weight: 1 },
      { id: "foothill", weight: 1 },
      { id: "market", weight: 1 }
    ]
  },
  cavern: {
    neighbors: [
      { id: "market", weight: 1 },
      { id: "waste", weight: 1 },
      { id: "tide", weight: 1 }
    ]
  },
  snow: {
    neighbors: [
      { id: "woods", weight: 1 },
      { id: "foothill", weight: 1 },
      { id: "tide", weight: 1 }
    ]
  },
  tide: {
    neighbors: [
      { id: "marsh", weight: 1 },
      { id: "cavern", weight: 1 },
      { id: "snow", weight: 1 }
    ]
  },
  void: {
    neighbors: []
  }
};

// src/tables/trainers.json
var trainers_default = [
  {
    id: "disciple",
    name: "\u6E38\u65B9\u5F1F\u5B50"
  },
  {
    id: "rival",
    name: "\u540C\u884C\u8005"
  },
  {
    id: "gym",
    name: "\u57CE\u4E3B"
  },
  {
    id: "grunt",
    name: "\u90AA\u793E\u6742\u5F79"
  },
  {
    id: "admin",
    name: "\u90AA\u793E\u4E3B"
  },
  {
    id: "e4",
    name: "\u56DB\u5EA7"
  },
  {
    id: "champion",
    name: "\u76DF\u4E3B"
  },
  {
    id: "legend",
    name: "\u9547\u4E16\u517D"
  },
  {
    id: "lamp_vendor",
    name: "\u706F\u5E02\u8D29"
  },
  {
    id: "shrine_witch",
    name: "\u793E\u5DEB"
  },
  {
    id: "ferry_pole",
    name: "\u6E21\u53E3\u7BD9\u5DE5"
  },
  {
    id: "kiln_head",
    name: "\u7A91\u5DE5\u5934"
  },
  {
    id: "stele_beggar",
    name: "\u7891\u4E0B\u4E5E"
  },
  {
    id: "reed_fisher",
    name: "\u82A6\u8361\u6E14"
  },
  {
    id: "salt_hand",
    name: "\u76D0\u4E01"
  },
  {
    id: "beacon_watch",
    name: "\u70FD\u5352"
  },
  {
    id: "script_monk",
    name: "\u5199\u7ECF\u50E7"
  },
  {
    id: "loft_bell",
    name: "\u9601\u94C3\u5F79"
  },
  {
    id: "moss_steward",
    name: "\u82D4\u5EAD\u6267\u4E8B"
  },
  {
    id: "cliff_woodcut",
    name: "\u7EDD\u58C1\u6A35"
  },
  {
    id: "fog_guide",
    name: "\u96FE\u5CB8\u5F15\u8DEF"
  },
  {
    id: "well_guard",
    name: "\u6CC9\u773C\u5B88"
  },
  {
    id: "night_broker",
    name: "\u591C\u96C6\u7259\u4EBA"
  },
  {
    id: "ore_hand",
    name: "\u77FF\u8109\u5F79"
  },
  {
    id: "pagoda_ward",
    name: "\u5854\u6797\u62A4"
  },
  {
    id: "isle_helm",
    name: "\u6D77\u5C7F\u8235"
  },
  {
    id: "forge_hand",
    name: "\u5DE5\u574A\u953B"
  },
  {
    id: "grave_watch",
    name: "\u5893\u56ED\u5B88\u591C"
  },
  {
    id: "star_offering",
    name: "\u661F\u6F6D\u796D"
  },
  {
    id: "ford_clerk",
    name: "\u6D25\u6E21\u540F"
  }
];

// src/run/classic-schedule.ts
var LEVEL_CAPS = [
  10,
  16,
  24,
  32,
  38,
  48,
  56,
  64,
  74,
  84,
  94,
  104,
  114,
  126,
  138,
  150,
  162,
  174,
  188,
  200
];
var RIVAL_WAVES = [8, 25, 55, 95, 145, 195];
var GRUNT_WAVES = [35, 62, 64, 66, 112, 114];
var ADMIN_WAVES = [115, 165];
var E4_WAVES = [182, 184, 186, 188];
var REALM_GRAPH = realm_graph_default;
function levelCap(wave) {
  const band = Math.min(LEVEL_CAPS.length, Math.max(1, Math.ceil(wave / 10)));
  return LEVEL_CAPS[band - 1];
}
function encounterLevel(wave) {
  const cap = levelCap(wave);
  const prior = wave <= 10 ? 5 : levelCap(wave - 10);
  const t = (wave - 1) % 10 / 9;
  return Math.round(prior + (cap - prior) * t);
}
function foeEncounterLevel(wave) {
  const level = encounterLevel(wave);
  if (wave <= 10) {
    return Math.max(1, level - 6);
  }
  if (wave <= 20) {
    return Math.max(1, level - 3);
  }
  if (wave <= 180) {
    return level + 9;
  }
  return Math.max(1, level - 12);
}
function earlyAffinityClamp(wave) {
  if (wave <= 10) {
    return { min: 0.9, max: 1.1 };
  }
  if (wave <= 20) {
    return { min: 0.8, max: 1.25 };
  }
  return void 0;
}
function firstGymWave(seed) {
  return new RngStream(seed).child(19).float() < 0.5 ? 20 : 30;
}
function gymWaves(seed) {
  const first = firstGymWave(seed);
  const waves = [];
  for (let wave = first; wave <= 180; wave += 30) {
    waves.push(wave);
  }
  return waves;
}
function describeWave(wave, seed) {
  if (wave === 250 || wave === 1e3) {
    return { kind: "legend", boss: true, finale: false, shields: 2, catchable: false, trainerId: "legend" };
  }
  if (wave === 200) {
    return { kind: "legend", boss: true, finale: true, shields: 2, catchable: false, trainerId: "legend" };
  }
  if (RIVAL_WAVES.includes(wave)) {
    return { kind: "rival", boss: false, finale: false, shields: 0, catchable: false, trainerId: "rival" };
  }
  if (wave >= 191 && wave <= 199) {
    return { kind: "void", boss: true, finale: false, shields: 1, catchable: false };
  }
  if (wave === 190) {
    return { kind: "champion", boss: true, finale: false, shields: 0, catchable: false, trainerId: "champion" };
  }
  if (E4_WAVES.includes(wave)) {
    return { kind: "e4", boss: true, finale: false, shields: 0, catchable: false, trainerId: "e4" };
  }
  if (ADMIN_WAVES.includes(wave)) {
    return { kind: "admin", boss: true, finale: false, shields: 0, catchable: false, trainerId: "admin" };
  }
  if (GRUNT_WAVES.includes(wave)) {
    return { kind: "grunt", boss: false, finale: false, shields: 0, catchable: false, trainerId: "grunt" };
  }
  if (wave === 5) {
    return { kind: "trainer", boss: false, finale: false, shields: 0, catchable: false, trainerId: "disciple" };
  }
  if (gymWaves(seed).includes(wave)) {
    return { kind: "gym", boss: true, finale: false, shields: 0, catchable: false, trainerId: "gym" };
  }
  if (wave % 10 === 0) {
    return { kind: "wild", boss: true, finale: false, shields: wave <= 10 ? 0 : 1, catchable: false };
  }
  return { kind: "wild", boss: false, finale: false, shields: 0, catchable: true };
}
function partyBattleKind(kind) {
  return kind === "wild" ? "wild" : "trainer";
}
function isApexRivalWave(wave) {
  return RIVAL_WAVES.indexOf(wave) === 3;
}
function rivalFightIndex(wave) {
  return RIVAL_WAVES.indexOf(wave);
}
var RIVAL_SLOTS = ["zao_li", "luo_yan_c", "jing_zhong", "huo_de_li", "zhen_yue", "lian_xin"];
function rivalRoster(fightIndex, _seed = "") {
  const count = Math.min(6, Math.max(1, fightIndex + 1));
  return {
    partyIds: RIVAL_SLOTS.slice(0, count),
    sanctify: fightIndex >= 5
  };
}
function realmChoices(realmId, seed, wave) {
  const neighbors = REALM_GRAPH[realmId]?.neighbors ?? [];
  if (neighbors.length <= 3) {
    return neighbors.map((row) => row.id);
  }
  const rng = new RngStream(seed).child(3e3 + wave);
  const pool = [...neighbors];
  const picked = [];
  while (picked.length < 3 && pool.length > 0) {
    const index = rng.int(pool.length);
    picked.push(pool[index].id);
    pool.splice(index, 1);
  }
  return picked;
}
function pickNextRealm(opts) {
  if (opts.hasMap) {
    const choices = realmChoices(opts.realmId, opts.seed, opts.wave);
    return choices[0] ?? opts.realmId;
  }
  const neighbors = REALM_GRAPH[opts.realmId]?.neighbors ?? [];
  if (neighbors.length === 0) {
    return opts.realmId;
  }
  const rng = new RngStream(opts.seed).child(3100 + opts.wave);
  const total = neighbors.reduce((sum, row) => sum + row.weight, 0);
  let ticket = rng.float() * total;
  for (const row of neighbors) {
    ticket -= row.weight;
    if (ticket <= 0) {
      return row.id;
    }
  }
  return neighbors[neighbors.length - 1].id;
}
function trainerName(trainerId) {
  const row = trainers_default.find((item) => item.id === trainerId);
  return row?.name ?? trainerId;
}
function defaultRealmForWave(wave) {
  if (wave >= 191) {
    return "void";
  }
  if (wave <= 10) {
    return "town_ruins";
  }
  return "wilds";
}

// src/meta/settings.ts
var SETTINGS_TABS = ["general", "display", "audio", "play", "controls"];
function defaultSettings() {
  return {
    general: { skipSeenDialog: false },
    display: { showGold: true, showDamage: true },
    audio: { music: 1, sfx: 1 },
    play: { battleSpeed: 1 },
    controls: { layout: "touch" }
  };
}

// src/run/modes/types.ts
var BLANK_PARTY = ["zao_li", "jing_zhu", "tao_geng"];
function costCap(mode) {
  return mode === "endless" || mode === "spliced" ? 15 : 10;
}
function shiftEvery(mode) {
  return mode === "endless" || mode === "spliced" ? 5 : 10;
}
function healOnShift(mode) {
  return mode !== "endless" && mode !== "spliced";
}
function finaleWave(mode, sprint = false) {
  if (sprint) {
    return 20;
  }
  if (mode === "classic" || mode === "challenge") {
    return 200;
  }
  if (mode === "daily") {
    return 50;
  }
  return null;
}
function allowsShopBuy(mode) {
  return mode === "classic" || mode === "challenge";
}
function hasTrainers(mode) {
  return mode === "classic" || mode === "daily" || mode === "challenge";
}

// src/run/modes/daily.ts
function utcDateStamp(at = /* @__PURE__ */ new Date()) {
  return at.toISOString().slice(0, 10);
}
function dailySeed(utcDate, salt = "ley-salt") {
  const rng = new RngStream(`${utcDate}|${salt}|daily`);
  return `daily-${rng.int(1e9)}-${rng.int(1e9)}`;
}

// src/run/modes/challenge.ts
function blankParty() {
  return [...BLANK_PARTY];
}

// src/run/night-marks.ts
var POOL = [
  "wound",
  "ward",
  "breath",
  "cleanse",
  "endure",
  "numb",
  "toxin",
  "scorch",
  "fuse"
];
var STACK_CAP = {
  wound: 999,
  ward: 999,
  breath: 10,
  cleanse: 10,
  endure: 10,
  numb: 10,
  toxin: 10,
  scorch: 10,
  fuse: 10
};
function expectedMarks(wave) {
  return Math.floor(wave / 50);
}
function addNightMark(marks, id) {
  const cap = STACK_CAP[id];
  const found = marks.find((row) => row.id === id);
  if (found) {
    found.stacks = Math.min(cap, found.stacks + 1);
    return marks;
  }
  return [...marks, { id, stacks: 1 }];
}
function grantMarkForWave(marks, wave, seed) {
  const need = expectedMarks(wave);
  const next = [...marks.map((row) => ({ ...row }))];
  let stacks = next.reduce((sum, row) => sum + row.stacks, 0);
  let step = 0;
  while (stacks < need) {
    const rng = new RngStream(seed).child(5e3 + wave * 13 + step);
    const id = POOL[rng.int(POOL.length)];
    const updated = addNightMark(next, id);
    next.splice(0, next.length, ...updated);
    stacks = next.reduce((sum, row) => sum + row.stacks, 0);
    step += 1;
  }
  return next;
}

// src/run/modes/advance.ts
function advanceAfterWin(run) {
  const cleared = run.wave;
  run.wave += 1;
  if (run.mode === "endless" || run.mode === "spliced") {
    run.nightMarks = grantMarkForWave(run.nightMarks, cleared, run.seed);
  }
  const every = shiftEvery(run.mode);
  if (cleared % every !== 0) {
    return { shifted: false, healed: false };
  }
  const healed = healOnShift(run.mode);
  if (healed) {
    run.partyHpRatios = run.partyHpRatios.map(() => 1);
  }
  if (run.mode === "endless" || run.mode === "spliced" || !run.hasMap) {
    run.realmId = pickNextRealm({
      realmId: run.realmId,
      seed: run.seed,
      wave: cleared,
      hasMap: false
    });
  }
  return { shifted: true, healed };
}

// src/tables/relics.json
var relics_default = [
  { id: "ox_mark", name: "\u725B\u8BB0", kind: "def", value: 4, unlock: "start" },
  { id: "spare_gourd", name: "\u5907\u846B", kind: "potion", value: 1, unlock: "start" },
  { id: "lesson_bead", name: "\u8BFE\u73E0", kind: "exp", value: 1, unlock: "start" },
  { id: "kiln_purse", name: "\u7A91\u56CA", kind: "gold", value: 250, unlock: "codex" },
  { id: "first_pouch", name: "\u521D\u56CA", kind: "sealPack", value: 3, unlock: "codex" },
  { id: "iron_mark", name: "\u94C1\u8BB0", kind: "atk", value: 4, unlock: "codex" },
  { id: "swift_mark", name: "\u75BE\u8BB0", kind: "spd", value: 4, unlock: "codex" },
  { id: "gourd_mark", name: "\u547D\u8BB0", kind: "hp", value: 12, unlock: "codex" },
  { id: "binder_mark", name: "\u7F1A\u8BB0", kind: "catch", value: 0.08, unlock: "clear" },
  { id: "mist_fan", name: "\u96FE\u6247", kind: "lure", value: 1, unlock: "clear" },
  { id: "river_chart", name: "\u6CB3\u56FE", kind: "map", value: 1, unlock: "clear" },
  { id: "night_knot", name: "\u591C\u7ED3", kind: "catch", value: 0.12, unlock: "clear" }
];

// src/meta/relics.ts
var RELICS = relics_default;
function listRelics() {
  return RELICS;
}
function starterRelicIds() {
  return RELICS.filter((row) => row.unlock === "start").map((row) => row.id);
}
function getRelic(id) {
  const row = RELICS.find((item) => item.id === id);
  if (!row) {
    throw new Error(`unknown relic: ${id}`);
  }
  return row;
}
function offerRelics(account, seed) {
  const byId = new Map(RELICS.map((row) => [row.id, row]));
  const unlocked = (account.unlockedRelics.length > 0 ? account.unlockedRelics : starterRelicIds()).map((id) => byId.get(id)).filter((row) => Boolean(row));
  if (unlocked.length <= 3) {
    return unlocked.slice(0, 3);
  }
  const rng = new RngStream(seed).child(17);
  const pool = [...unlocked];
  const picked = [];
  while (picked.length < 3 && pool.length > 0) {
    picked.push(pool.splice(rng.int(pool.length), 1)[0]);
  }
  return picked;
}
function pickStartRelic(account, selected, seed) {
  const offers = offerRelics(account, seed);
  if (offers.some((row) => row.id === selected)) {
    return selected;
  }
  return offers[0]?.id ?? starterRelicIds()[0] ?? "";
}
function sumRelicStats(relicIds) {
  const bonus = { atk: 0, def: 0, spd: 0, hp: 0 };
  for (const id of relicIds) {
    const row = RELICS.find((item) => item.id === id);
    if (row?.kind === "atk") {
      bonus.atk += row.value;
    }
    if (row?.kind === "def") {
      bonus.def += row.value;
    }
    if (row?.kind === "spd") {
      bonus.spd += row.value;
    }
    if (row?.kind === "hp") {
      bonus.hp += row.value;
    }
  }
  return bonus;
}
function relicCatchValue(relicIds) {
  return relicIds.reduce((sum, id) => {
    const row = RELICS.find((item) => item.id === id);
    return row?.kind === "catch" ? sum + row.value : sum;
  }, 0);
}

// src/run/fusion.ts
function fuse(primaryId, sacrificeId) {
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
    pactId: primary.pactId
  };
}
function pickFusePartner(starterId, seed) {
  const ids = loadTables().spirits.map((row) => row.id).filter((id) => id !== starterId);
  if (ids.length === 0) {
    throw new Error("need two spirits");
  }
  return ids[new RngStream(seed).child(3).int(ids.length)];
}

// src/run/run-session.ts
function emptyAccount() {
  return {
    revision: 0,
    codex: [],
    seenIds: [],
    settings: defaultSettings(),
    unlockedStarters: [],
    classicCleared: false,
    fusedClear: false,
    candy: {},
    costDown: {},
    boneCap: {},
    secondPact: [],
    vouchers: { fan: 1, shang: 0, te: 0, jin: 0 },
    eggs: [],
    achievements: [],
    ribbons: [],
    carryBaby: false,
    unlockedRelics: starterRelicIds(),
    dailyScores: {},
    tempers: []
  };
}
function realmForWave(wave) {
  return defaultRealmForWave(wave);
}
function createRun(opts) {
  if (opts.sprint && !opts.relicId) {
    throw new Error("sprint needs relic");
  }
  const mode = opts.mode ?? "classic";
  const challenges = opts.challenges ?? [];
  const partyIds = mode === "daily" ? blankParty() : challenges.includes("blank") ? blankParty() : [opts.starterId];
  const run = {
    seed: opts.seed,
    wave: 1,
    realmId: realmForWave(1),
    starterId: opts.starterId,
    partyIds,
    gold: 1e3,
    potions: 3,
    seals: [5, 0, 0, 0, 0],
    goldenSlots: 0,
    hasMap: mode === "daily",
    hasLock: false,
    hasApexBand: false,
    lures: [],
    boonIds: [],
    caughtIds: [],
    mode,
    costCap: costCap(mode),
    challenges,
    nightMarks: [],
    partyHpRatios: partyIds.map(() => 1),
    partyLevels: partyIds.map(() => mode === "daily" ? 20 : encounterLevel(1)),
    luck: 0,
    forceDual: false,
    partyCharms: partyIds.map(() => []),
    relicIds: [],
    sprint: Boolean(opts.sprint),
    fusedIds: mode === "spliced" ? [pickFusePartner(opts.starterId, opts.seed)] : [],
    bag: {},
    warTokens: [],
    spliceCharges: 0,
    unspliceCharges: 0,
    partyExtraArts: partyIds.map(() => []),
    partyTempers: partyIds.map(() => "plain")
  };
  if (opts.relicId) {
    applyRelic(run, opts.relicId);
  }
  return run;
}
function applyRelic(run, relicId) {
  const relic = getRelic(relicId);
  run.relicIds.push(relic.id);
  if (relic.kind === "gold") {
    run.gold += relic.value;
  }
  if (relic.kind === "potion") {
    run.potions += relic.value;
  }
  if (relic.kind === "map") {
    run.hasMap = true;
  }
  if (relic.kind === "lure") {
    run.lures = addLure(run.lures, "lure_fan");
  }
  if (relic.kind === "exp") {
    run.luck += relic.value;
  }
  if (relic.kind === "sealPack") {
    run.seals[0] = (run.seals[0] ?? 0) + relic.value;
  }
}
function nextEncounter(run) {
  if (run.wave >= 191) {
    run.realmId = "void";
  } else if (run.wave <= 10) {
    run.realmId = "town_ruins";
  }
  const tables = loadTables();
  const realm = tables.realms.find((row) => row.id === run.realmId);
  if (!realm) {
    throw new Error(`unknown realm ${run.realmId}`);
  }
  const spec = describeWave(run.wave, run.seed);
  const cap = finaleWave(run.mode, run.sprint);
  const finale = spec.finale || cap !== null && run.wave === cap;
  let kind = spec.kind;
  let trainerId = spec.trainerId;
  let catchable = finale ? false : spec.catchable;
  if (!hasTrainers(run.mode) && kind !== "wild" && kind !== "legend" && kind !== "void") {
    kind = "wild";
    trainerId = void 0;
    catchable = false;
  }
  const raw = spec.boss || spec.kind !== "wild" ? realm.spiritIds.slice(-3) : realm.spiritIds;
  const pool = run.wave <= 20 ? firstStagePool(realm.spiritIds) : raw;
  const rng = new RngStream(run.seed).child(run.wave);
  const foeId = pool[rng.int(pool.length)];
  const allowed = canDual({ mode: run.mode, wave: run.wave, boss: spec.boss });
  const dual = kind === "wild" && !spec.boss && allowed && (run.forceDual || rng.float() < dualChance(run.lures, run.wave));
  if (dual) {
    run.forceDual = false;
  }
  const foeIds = [foeId];
  if (dual) {
    const other = pool.filter((id) => id !== foeId);
    foeIds.push(other.length > 0 ? other[rng.int(other.length)] : foeId);
  }
  let sanctify = false;
  if (kind === "rival") {
    const fight = rivalFightIndex(run.wave);
    if (fight >= 0) {
      const roster = rivalRoster(fight, run.seed);
      foeIds.length = 0;
      foeIds.push(...roster.partyIds);
      sanctify = roster.sanctify;
    }
  }
  return {
    foeId: foeIds[0] ?? foeId,
    foeIds,
    dual,
    realmId: run.realmId,
    ...spec,
    kind,
    trainerId,
    catchable,
    finale,
    sanctify
  };
}
function firstStagePool(ids) {
  const evolved = new Set(loadTables().spirits.map((row) => row.evolveTo).filter((id) => Boolean(id)));
  const babies = ids.filter((id) => !evolved.has(id));
  return babies.length > 0 ? babies : ids;
}
function applyBoon(run, boonId, account) {
  const boon = loadTables().boons.find((row) => row.id === boonId);
  if (!boon) {
    throw new Error(`unknown boon: ${boonId}`);
  }
  run.boonIds.push(boon.id);
  ensureParty(run);
  if (boon.kind === "gold") {
    run.gold += boon.value;
  }
  if (boon.kind === "potion") {
    run.potions += 1;
  }
  if (boon.kind === "map") {
    run.hasMap = true;
  }
  if (boon.kind === "lure") {
    run.lures = addLure(run.lures, boon.id);
  }
  if (boon.kind === "exp") {
    run.luck += 1;
  }
  if (boon.kind === "revive") {
    run.partyHpRatios = run.partyHpRatios.map((ratio) => ratio <= 0 ? 1 : ratio);
  }
  if (boon.kind === "sealPack") {
    const slot = boon.slot ?? 0;
    run.seals[slot] = (run.seals[slot] ?? 0) + boon.value;
  }
  if (boon.kind === "cleanse" || boon.kind === "ether" || boon.kind === "ppUp" || boon.kind === "ppMax" || boon.kind === "formItem") {
    run.bag[boon.id] = (run.bag[boon.id] ?? 0) + 1;
  }
  if (boon.kind === "candy") {
    if (boon.tag === "party") {
      run.partyLevels = run.partyLevels.map((level) => level + 1);
    } else if (boon.tag === "jar" && account) {
      for (const id of run.partyIds) {
        account.candy[id] = (account.candy[id] ?? 0) + 10;
      }
    } else {
      run.partyLevels[0] = (run.partyLevels[0] ?? 1) + 1;
    }
  }
  if (boon.kind === "vitamin") {
    const charms = run.partyCharms[0] ?? (run.partyCharms[0] = []);
    const cap = account?.boneCap[run.partyIds[0] ?? ""] ?? 10;
    if (charms.filter((id) => id === boon.id).length < cap) {
      charms.push(boon.id);
    }
  }
  if (boon.kind === "mint") {
    const next = boon.tag ?? "fierce";
    run.partyTempers[0] = next;
    if (account && !account.tempers.includes(next)) {
      account.tempers.push(next);
    }
  }
  if (boon.kind === "warToken") {
    run.warTokens.push({ id: boon.id, remaining: 5, tag: boon.tag ?? "atk" });
  }
  if (boon.kind === "tm") {
    const known = /* @__PURE__ */ new Set([
      ...getSpirit(run.partyIds[0] ?? run.starterId).artIds,
      ...run.partyExtraArts[0] ?? []
    ]);
    const pick = loadTables().arts.find((row) => !known.has(row.id));
    if (pick) {
      run.partyExtraArts[0] = [...run.partyExtraArts[0] ?? [], pick.id];
    }
  }
  if (boon.kind === "evolve") {
    const current = run.partyIds[0];
    const next = current ? getSpirit(current).evolveTo : void 0;
    if (next) {
      run.partyIds[0] = next;
    }
  }
  if (boon.kind === "splicer") {
    run.spliceCharges += 1;
  }
  if (boon.kind === "unsplice") {
    run.unspliceCharges += 1;
  }
  if (boon.kind === "voucher" && account && boon.tag) {
    const tier = boon.tag;
    account.vouchers[tier] = (account.vouchers[tier] ?? 0) + 1;
  }
  if (boon.kind === "fruit") {
    const charms = run.partyCharms[0] ?? (run.partyCharms[0] = []);
    const cap = boon.value || 2;
    if (charms.filter((id) => id === boon.id).length < cap) {
      charms.push(boon.id);
    }
  }
  if (boon.kind === "charm") {
    const charms = run.partyCharms[0] ?? (run.partyCharms[0] = []);
    charms.push(boon.tag ?? boon.id);
  }
  if (boon.kind === "passive") {
    if (boon.tag === "lock") {
      run.hasLock = true;
    }
    if (boon.tag === "apex") {
      run.hasApexBand = true;
    }
    if (boon.tag === "slot") {
      run.goldenSlots += 1;
    }
    if (boon.tag === "heal") {
      run.potions += 1;
    }
    if (boon.tag === "shiny" || boon.tag === "exp") {
      run.luck += boon.value || 1;
    }
  }
}
function ensureParty(run) {
  while (run.partyCharms.length < run.partyIds.length) {
    run.partyCharms.push([]);
  }
  while (run.partyExtraArts.length < run.partyIds.length) {
    run.partyExtraArts.push([]);
  }
  while (run.partyTempers.length < run.partyIds.length) {
    run.partyTempers.push("plain");
  }
  while (run.partyLevels.length < run.partyIds.length) {
    run.partyLevels.push(5);
  }
  if (!run.bag) {
    run.bag = {};
  }
  if (!run.warTokens) {
    run.warTokens = [];
  }
}
function tickWarTokens(run) {
  run.warTokens = (run.warTokens ?? []).map((row) => ({ ...row, remaining: row.remaining - 1 })).filter((row) => row.remaining > 0);
}
function artPowerMul(run, user, affinity) {
  let mul = 1;
  for (const id of run.boonIds) {
    const row = loadTables().boons.find((boon) => boon.id === id);
    if (row?.kind === "typeBoost" && row.tag === affinity) {
      mul *= 1.2;
    }
    if (row?.kind === "speciesBoost" && row.tag === user.id) {
      mul *= 1.2;
    }
  }
  return mul;
}
function evolveNeed(id) {
  const row = getSpirit(id);
  if (!row.evolveTo) {
    return Number.POSITIVE_INFINITY;
  }
  const next = getSpirit(row.evolveTo);
  return next.evolveTo ? 8 : 16;
}
function grantWaveExp(run, living) {
  const cap = levelCap(run.wave);
  while (run.partyLevels.length < run.partyIds.length) {
    run.partyLevels.push(encounterLevel(run.wave));
  }
  for (let i = 0; i < run.partyIds.length; i++) {
    if (!living[i]) {
      continue;
    }
    run.partyLevels[i] = Math.min(cap, (run.partyLevels[i] ?? encounterLevel(run.wave)) + 1);
    const id = run.partyIds[i];
    const row = getSpirit(id);
    if (row.evolveTo && run.partyLevels[i] >= evolveNeed(id)) {
      run.partyIds[i] = row.evolveTo;
    }
  }
}
function commitParty(run, party, won) {
  run.partyHpRatios = party.map((unit) => {
    if (unit.maxHp <= 0) {
      return 0;
    }
    const ratio = unit.hp / unit.maxHp;
    if (won && unit.hp > 0) {
      if (run.wave <= 10 || run.wave > 180) {
        return 1;
      }
      return Math.min(1, ratio + 0.3);
    }
    return ratio;
  });
  while (run.partyHpRatios.length < run.partyIds.length) {
    run.partyHpRatios.push(1);
  }
  if (won) {
    grantWaveExp(
      run,
      party.map((unit) => unit.hp > 0)
    );
  }
}
function waveGoldReward(wave, trainer) {
  return (8 + wave * 4) * (trainer ? 2 : 1);
}
function catchModifier(run) {
  return catchBoonValue(run) + run.luck * 0.05;
}
function partyLevelBonus(run) {
  return run.luck;
}
function catchBoonValue(run) {
  const tables = loadTables();
  const fromBoons = run.boonIds.reduce((sum, id) => {
    const boon = tables.boons.find((row) => row.id === id);
    return boon?.kind === "catch" ? sum + boon.value : sum;
  }, 0);
  return fromBoons + relicCatchValue(run.relicIds);
}
function sumBoonStats(boonIds) {
  const tables = loadTables();
  const bonus = { atk: 0, def: 0, spd: 0, hp: 0 };
  for (const id of boonIds) {
    const boon = tables.boons.find((row) => row.id === id);
    if (boon?.kind === "atk") {
      bonus.atk += boon.value;
    }
    if (boon?.kind === "def") {
      bonus.def += boon.value;
    }
    if (boon?.kind === "spd") {
      bonus.spd += boon.value;
    }
    if (boon?.kind === "hp") {
      bonus.hp += boon.value;
    }
  }
  return bonus;
}
function sumRunStats(run) {
  const boons = sumBoonStats(run.boonIds);
  const relics = sumRelicStats(run.relicIds);
  return {
    atk: boons.atk + relics.atk,
    def: boons.def + relics.def,
    spd: boons.spd + relics.spd,
    hp: boons.hp + relics.hp
  };
}
function recordSeen(run, spiritId, prev) {
  getSpirit(spiritId);
  const base = prev ?? emptyAccount();
  const seenIds = Array.from(/* @__PURE__ */ new Set([...base.seenIds, run.starterId, spiritId, ...run.caughtIds]));
  const codex = Array.from(/* @__PURE__ */ new Set([...base.codex, run.starterId, ...run.caughtIds]));
  return { ...base, seenIds, codex };
}
function codexStatus(account, spiritId) {
  if (account.codex.includes(spiritId)) {
    return "caught";
  }
  if (account.seenIds.includes(spiritId)) {
    return "seen";
  }
  return "unknown";
}
function recordDailyScore(account, utcDate, wave) {
  const scores = account.dailyScores ?? (account.dailyScores = {});
  const prev = scores[utcDate] ?? 0;
  if (wave > prev) {
    scores[utcDate] = wave;
  }
}
function bestDailyScore(account, utcDate) {
  return account.dailyScores?.[utcDate] ?? 0;
}
function maybeRecordDaily(account, run, utcDate = utcDateStamp()) {
  if (run.mode === "daily") {
    recordDailyScore(account, utcDate, run.wave);
  }
}
function statsLog(account, utcDate = utcDateStamp()) {
  return `\u89C1 ${account.seenIds.length}  \u6536 ${account.codex.length}  \u7F0E ${account.ribbons.length}  \u4ECA\u65E5\u8BD5\u70BC\u6700\u9AD8\u6CE2 ${bestDailyScore(account, utcDate)}`;
}
function recordCatch(run, spiritId, prev) {
  getSpirit(spiritId);
  if (!run.caughtIds.includes(spiritId)) {
    run.caughtIds.push(spiritId);
  }
  const base = recordSeen(run, spiritId, prev);
  const codex = Array.from(/* @__PURE__ */ new Set([...base.codex, run.starterId, ...run.caughtIds]));
  const seenIds = Array.from(/* @__PURE__ */ new Set([...base.seenIds, ...codex]));
  const unlockedStarters = Array.from(
    /* @__PURE__ */ new Set([...base.unlockedStarters, ...codex.filter((id) => getSpirit(id).starter)])
  );
  if (!unlockedStarters.includes(run.starterId)) {
    unlockedStarters.unshift(run.starterId);
  }
  return { ...base, revision: base.revision, codex, seenIds, unlockedStarters };
}

// src/tables/eggs.json
var eggs_default = {
  fan: ["zao_li", "jing_zhu", "tao_geng", "luan_shi", "dian_zhu", "shuang_ming", "mo_mao", "deng_e", "yao_shu", "ping_yu", "zhi_ren", "tong_ling"],
  shang: ["dan_li", "quan_ji", "nuo_mian", "zhang_yan", "pi_li", "bing_can", "ye_ti", "jin_hui", "tao_quan", "he_hun", "jian_ying", "ming_duo"],
  te: ["huo_de_li", "he_bo_cong", "she_mu", "zhen_yue", "lei_ying", "xuan_dong", "wu_mian", "yao_lun"],
  epic: ["dan_zao", "lian_xin", "zang_shu", "jing_zhong"]
};

// src/tables/achievements.json
var achievements_default = [
  {
    id: "clear_classic",
    name: "\u521D\u6E21\u5F52\u589F",
    hidden: false,
    when: {
      type: "victory"
    }
  },
  {
    id: "catch_1",
    name: "\u521D\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 1
    }
  },
  {
    id: "catch_2",
    name: "\u518D\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 2
    }
  },
  {
    id: "catch_3",
    name: "\u4E09\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 3
    }
  },
  {
    id: "catch_5",
    name: "\u4E94\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 5
    }
  },
  {
    id: "catch_8",
    name: "\u516B\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 8
    }
  },
  {
    id: "catch_10",
    name: "\u5341\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 10
    }
  },
  {
    id: "catch_15",
    name: "\u5341\u4E94\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 15
    }
  },
  {
    id: "catch_20",
    name: "\u5EFF\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 20
    }
  },
  {
    id: "catch_25",
    name: "\u5EFF\u4E94\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 25
    }
  },
  {
    id: "catch_30",
    name: "\u4E09\u5341\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 30
    }
  },
  {
    id: "catch_35",
    name: "\u4E09\u5341\u4E94\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 35
    }
  },
  {
    id: "catch_40",
    name: "\u56DB\u5341\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 40
    }
  },
  {
    id: "catch_45",
    name: "\u56DB\u5341\u4E94\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 45
    }
  },
  {
    id: "catch_50",
    name: "\u4E94\u5341\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 50
    }
  },
  {
    id: "catch_60",
    name: "\u516D\u5341\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 60
    }
  },
  {
    id: "catch_70",
    name: "\u4E03\u5341\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 70
    }
  },
  {
    id: "catch_80",
    name: "\u516B\u5341\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 80
    }
  },
  {
    id: "catch_90",
    name: "\u4E5D\u5341\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 90
    }
  },
  {
    id: "catch_100",
    name: "\u767E\u5951",
    hidden: false,
    when: {
      type: "catch",
      count: 100
    }
  },
  {
    id: "catch_120",
    name: "\u6EE1\u5377",
    hidden: false,
    when: {
      type: "catch",
      count: 120
    }
  },
  {
    id: "seen_5",
    name: "\u521D\u89C1\u4E94",
    hidden: false,
    when: {
      type: "seen",
      count: 5
    }
  },
  {
    id: "seen_10",
    name: "\u89C1\u5341",
    hidden: false,
    when: {
      type: "seen",
      count: 10
    }
  },
  {
    id: "seen_15",
    name: "\u89C1\u5341\u4E94",
    hidden: false,
    when: {
      type: "seen",
      count: 15
    }
  },
  {
    id: "seen_20",
    name: "\u89C1\u4E8C\u5341",
    hidden: false,
    when: {
      type: "seen",
      count: 20
    }
  },
  {
    id: "seen_30",
    name: "\u89C1\u4E09\u5341",
    hidden: false,
    when: {
      type: "seen",
      count: 30
    }
  },
  {
    id: "seen_40",
    name: "\u89C1\u56DB\u5341",
    hidden: false,
    when: {
      type: "seen",
      count: 40
    }
  },
  {
    id: "seen_50",
    name: "\u89C1\u4E94\u5341",
    hidden: false,
    when: {
      type: "seen",
      count: 50
    }
  },
  {
    id: "seen_60",
    name: "\u89C1\u516D\u5341",
    hidden: false,
    when: {
      type: "seen",
      count: 60
    }
  },
  {
    id: "seen_80",
    name: "\u89C1\u516B\u5341",
    hidden: false,
    when: {
      type: "seen",
      count: 80
    }
  },
  {
    id: "seen_120",
    name: "\u89C1\u6EE1",
    hidden: false,
    when: {
      type: "seen",
      count: 120
    }
  },
  {
    id: "hatch_1",
    name: "\u5F00\u5375",
    hidden: false,
    when: {
      type: "hatch"
    }
  },
  {
    id: "candy_cost",
    name: "\u964D\u8D39",
    hidden: false,
    when: {
      type: "candy",
      kind: "cost"
    }
  },
  {
    id: "candy_pact",
    name: "\u7B2C\u4E8C\u9B42\u5951",
    hidden: false,
    when: {
      type: "candy",
      kind: "pact"
    }
  },
  {
    id: "candy_egg",
    name: "\u4E13\u5C5E\u5375",
    hidden: false,
    when: {
      type: "candy",
      kind: "egg"
    }
  },
  {
    id: "daily_1",
    name: "\u8BD5\u70BC\u4E00\u6218",
    hidden: false,
    when: {
      type: "daily",
      wave: 1
    }
  },
  {
    id: "daily_5",
    name: "\u8BD5\u70BC\u4E94\u6CE2",
    hidden: false,
    when: {
      type: "daily",
      wave: 5
    }
  },
  {
    id: "daily_10",
    name: "\u8BD5\u70BC\u5341\u6CE2",
    hidden: false,
    when: {
      type: "daily",
      wave: 10
    }
  },
  {
    id: "daily_15",
    name: "\u8BD5\u70BC\u5341\u4E94\u6CE2",
    hidden: false,
    when: {
      type: "daily",
      wave: 15
    }
  },
  {
    id: "daily_20",
    name: "\u8BD5\u70BC\u5EFF\u6CE2",
    hidden: false,
    when: {
      type: "daily",
      wave: 20
    }
  },
  {
    id: "ribbon_1",
    name: "\u7B2C\u4E00\u7F0E",
    hidden: false,
    when: {
      type: "ribbon",
      count: 1
    }
  },
  {
    id: "ribbon_2",
    name: "\u7B2C\u4E8C\u7F0E",
    hidden: false,
    when: {
      type: "ribbon",
      count: 2
    }
  },
  {
    id: "ribbon_3",
    name: "\u4E09\u7F0E",
    hidden: false,
    when: {
      type: "ribbon",
      count: 3
    }
  },
  {
    id: "ribbon_6",
    name: "\u516D\u7F0E",
    hidden: false,
    when: {
      type: "ribbon",
      count: 6
    }
  },
  {
    id: "carry_young",
    name: "\u643A\u5E7C",
    hidden: true,
    when: {
      type: "baby"
    }
  },
  {
    id: "ribbon_full",
    name: "\u5168\u7F0E",
    hidden: true,
    when: {
      type: "ribbon",
      count: 12
    }
  },
  {
    id: "catch_all",
    name: "\u5951\u5F55\u5C3D\u6536",
    hidden: true,
    when: {
      type: "catch",
      count: 120
    }
  },
  {
    id: "seen_all",
    name: "\u5C3D\u89C1\u5C71\u91CE",
    hidden: true,
    when: {
      type: "seen",
      count: 200
    }
  },
  {
    id: "daily_30",
    name: "\u8BD5\u70BC\u4E09\u5341",
    hidden: true,
    when: {
      type: "daily",
      wave: 30
    }
  },
  {
    id: "daily_40",
    name: "\u8BD5\u70BC\u56DB\u5341",
    hidden: true,
    when: {
      type: "daily",
      wave: 40
    }
  },
  {
    id: "hatch_gold",
    name: "\u91D1\u5375\u4E4B\u5146",
    hidden: true,
    when: {
      type: "hatch"
    }
  },
  {
    id: "candy_floor",
    name: "\u8D39\u7528\u89C1\u5E95",
    hidden: true,
    when: {
      type: "candy",
      kind: "cost"
    }
  },
  {
    id: "hidden_pact_all",
    name: "\u9690\u5951\u6697\u5F00",
    hidden: true,
    when: {
      type: "candy",
      kind: "pact"
    }
  },
  {
    id: "species_egg_three",
    name: "\u4E09\u4E13\u5375",
    hidden: true,
    when: {
      type: "candy",
      kind: "egg"
    }
  },
  {
    id: "fuse_clear",
    name: "\u5408\u4F53\u901A\u5173",
    hidden: true,
    when: {
      type: "fuse"
    }
  },
  {
    id: "night_mark",
    name: "\u957F\u591C\u4E00\u5370",
    hidden: true,
    when: {
      type: "endless"
    }
  },
  {
    id: "void_walk",
    name: "\u5F52\u589F\u591C\u884C",
    hidden: true,
    when: {
      type: "victory"
    }
  },
  {
    id: "starter_three",
    name: "\u4E09\u521D\u59CB\u9F50",
    hidden: true,
    when: {
      type: "catch",
      count: 3
    }
  },
  {
    id: "catch_200",
    name: "\u4E8C\u767E\u5951",
    hidden: true,
    when: {
      type: "catch",
      count: 200
    }
  },
  {
    id: "ribbon_9",
    name: "\u4E5D\u7F0E",
    hidden: true,
    when: {
      type: "ribbon",
      count: 9
    }
  },
  {
    id: "daily_50",
    name: "\u8BD5\u70BC\u4E94\u5341",
    hidden: true,
    when: {
      type: "daily",
      wave: 50
    }
  },
  {
    id: "seen_150",
    name: "\u89C1\u767E\u4E94",
    hidden: true,
    when: {
      type: "seen",
      count: 150
    }
  },
  {
    id: "hatch_many",
    name: "\u8FDE\u5F00",
    hidden: true,
    when: {
      type: "hatch"
    }
  },
  {
    id: "candy_pact_2",
    name: "\u518D\u5F00\u9B42\u5951",
    hidden: true,
    when: {
      type: "candy",
      kind: "pact"
    }
  },
  {
    id: "candy_egg_2",
    name: "\u518D\u4E70\u4E13\u5375",
    hidden: true,
    when: {
      type: "candy",
      kind: "egg"
    }
  },
  {
    id: "baby_duo",
    name: "\u53CC\u5E7C\u540C\u884C",
    hidden: true,
    when: {
      type: "baby"
    }
  },
  {
    id: "clear_again",
    name: "\u518D\u6E21",
    hidden: true,
    when: {
      type: "victory"
    }
  },
  {
    id: "ribbon_1_hidden",
    name: "\u6697\u7F0E",
    hidden: true,
    when: {
      type: "ribbon",
      count: 1
    }
  },
  {
    id: "catch_1_hidden",
    name: "\u6697\u5951",
    hidden: true,
    when: {
      type: "catch",
      count: 1
    }
  },
  {
    id: "seen_1_hidden",
    name: "\u6697\u89C1",
    hidden: true,
    when: {
      type: "seen",
      count: 1
    }
  },
  {
    id: "daily_1_hidden",
    name: "\u6697\u8BD5\u70BC",
    hidden: true,
    when: {
      type: "daily",
      wave: 1
    }
  }
];

// src/run/achievements.ts
var ACH_CARRY_YOUNG = "carry_young";
var CATALOG = achievements_default;
function listAchievements(filter) {
  if (filter?.hidden === void 0) {
    return [...CATALOG];
  }
  return CATALOG.filter((row) => row.hidden === filter.hidden);
}
function grantAchievement(account, id) {
  if (account.achievements.includes(id)) {
    return false;
  }
  account.achievements.push(id);
  return true;
}
function partyHasBaby(partyIds) {
  return partyIds.some((id) => Boolean(getSpirit(id).evolveTo));
}
function ribbonRoot(spiritId) {
  const parent = /* @__PURE__ */ new Map();
  for (const row of loadTables().spirits) {
    if (row.evolveTo) {
      parent.set(row.evolveTo, row.id);
    }
  }
  let current = spiritId;
  const seen = /* @__PURE__ */ new Set();
  while (parent.has(current) && !seen.has(current)) {
    seen.add(current);
    current = parent.get(current) ?? current;
  }
  return current;
}
function matches(row, account, event) {
  const when = row.when;
  if (when.type === "victory") {
    return event.type === "victory";
  }
  if (when.type === "baby") {
    return event.type === "victory" && partyHasBaby(event.partyIds);
  }
  if (when.type === "fuse") {
    return event.type === "fuse" || event.type === "victory" && event.mode === "spliced" || account.fusedClear;
  }
  if (when.type === "endless") {
    return event.type === "endless";
  }
  if (when.type === "catch") {
    return (event.type === "catch" || event.type === "hatch" || event.type === "victory") && account.codex.length >= (when.count ?? 1);
  }
  if (when.type === "seen") {
    return (event.type === "catch" || event.type === "hatch" || event.type === "victory" || event.type === "seen") && account.seenIds.length >= (when.count ?? 1);
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
function evaluateAchievements(account, event) {
  const granted = [];
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
function onRunVictory(account, partyIds, mode) {
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

// src/meta/eggs.ts
var VOUCHER_EGGS = {
  fan: 1,
  shang: 5,
  te: 10,
  jin: 25
};
var HATCH_STEPS = {
  fan: 1e3,
  shang: 2e3,
  te: 4e3,
  epic: 6e3
};
var POOLS = eggs_default;
var MACHINE_ENTRIES = ["fan", "shang", "te", "epic"].flatMap(
  (tier) => POOLS[tier].map((spiritId) => ({ spiritId, tier }))
);
function redeemVoucher(account, tier, seed) {
  if ((account.vouchers[tier] ?? 0) <= 0) {
    throw new Error("no voucher");
  }
  account.vouchers[tier] -= 1;
  const count = VOUCHER_EGGS[tier];
  const rng = new RngStream(seed);
  const eggs = [];
  for (let i = 0; i < count; i++) {
    eggs.push(rollEgg(rng, `${seed}-${i}`));
  }
  if (tier === "te" && !eggs.some((egg) => egg.tier === "shang" || egg.tier === "te" || egg.tier === "epic")) {
    eggs[eggs.length - 1] = makeEgg(pickFrom("shang", rng), "shang", `${seed}-pity`);
  }
  if (tier === "jin" && !eggs.some((egg) => egg.tier === "epic")) {
    eggs[eggs.length - 1] = makeEgg(pickFrom("epic", rng), "epic", `${seed}-pity`);
  }
  account.eggs.push(...eggs);
  return eggs;
}
function tickEggs(account, steps) {
  for (const egg of account.eggs) {
    egg.steps = Math.max(0, egg.steps - steps);
  }
}
function skipEggSteps(account) {
  for (const egg of account.eggs) {
    egg.steps = 0;
  }
}
function hatchReady(account) {
  return account.eggs.filter((egg) => egg.steps <= 0);
}
function grantSpeciesEgg(account, spiritId, seed) {
  const egg = makeEgg(spiritId, "fan", seed);
  account.eggs.push(egg);
  return egg;
}
function hatchEgg(account, eggId) {
  const index = account.eggs.findIndex((egg2) => egg2.id === eggId);
  if (index < 0) {
    throw new Error("no egg");
  }
  const egg = account.eggs[index];
  if (egg.steps > 0) {
    throw new Error("not ready");
  }
  account.eggs.splice(index, 1);
  if (!account.codex.includes(egg.spiritId)) {
    account.codex.push(egg.spiritId);
  }
  const bone = account.boneCap[egg.spiritId] ?? 10;
  account.boneCap[egg.spiritId] = Math.min(31, bone + 1);
  evaluateAchievements(account, { type: "hatch" });
  return egg.spiritId;
}
function rollEgg(rng, key) {
  const roll = rng.float();
  const tier = roll < 0.02 ? "epic" : roll < 0.12 ? "te" : roll < 0.4 ? "shang" : "fan";
  return makeEgg(pickFrom(tier, rng), tier, key);
}
function pickFrom(tier, rng) {
  const pool = POOLS[tier];
  return pool[rng.int(pool.length)];
}
function makeEgg(spiritId, tier, key) {
  return {
    id: `egg-${key}-${spiritId}`,
    spiritId,
    tier,
    steps: HATCH_STEPS[tier]
  };
}
function dailyLegendPool(utcDate) {
  const rng = new RngStream(`${utcDate}|legend-eggs`);
  const epic = [...POOLS.epic];
  for (let i = epic.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    const swap = epic[i];
    epic[i] = epic[j];
    epic[j] = swap;
  }
  return epic.slice(0, Math.min(2, epic.length));
}
function machineWeight(kind, spiritId, tier, legends) {
  if (kind === "lineage" && getSpirit(spiritId).affinities.includes("flame")) {
    return 6;
  }
  if (kind === "eggArt" && tier === "te") {
    return 7;
  }
  if (kind === "form" && (tier === "epic" || legends.includes(spiritId))) {
    return 9;
  }
  return 1;
}
function rollMachine(kind, seed, utcDate) {
  const rng = new RngStream(`${seed}|${kind}|${utcDate}`);
  const legends = dailyLegendPool(utcDate);
  const weights = MACHINE_ENTRIES.map((row) => machineWeight(kind, row.spiritId, row.tier, legends));
  const total = weights.reduce((sum, value) => sum + value, 0);
  let ticket = rng.float() * total;
  let picked = MACHINE_ENTRIES[MACHINE_ENTRIES.length - 1];
  for (let i = 0; i < MACHINE_ENTRIES.length; i++) {
    ticket -= weights[i];
    if (ticket <= 0) {
      picked = MACHINE_ENTRIES[i];
      break;
    }
  }
  return makeEgg(picked.spiritId, picked.tier, `${seed}-${kind}`);
}
function useEggMachine(account, kind, seed, utcDate) {
  if ((account.vouchers.fan ?? 0) <= 0) {
    throw new Error("no voucher");
  }
  account.vouchers.fan -= 1;
  const egg = rollMachine(kind, seed, utcDate);
  account.eggs.push(egg);
  return egg;
}

// src/shop/shop.ts
var LOCK_BASE = {
  fan: 50,
  shang: 125,
  te: 300,
  qi: 750,
  jie: 2e3
};
var TIER_ROLL = [
  { tier: "fan", chance: 0.75 },
  { tier: "shang", chance: 0.1904 },
  { tier: "te", chance: 0.0469 },
  { tier: "qi", chance: 0.0117 },
  { tier: "jie", chance: 1e-3 }
];
function potionWeight(hpRatios) {
  let weight = 0;
  for (const ratio of hpRatios) {
    if (ratio <= 0.875) {
      weight += 3;
    }
  }
  return Math.min(9, weight);
}
function forcedTiers(wave) {
  if (wave === 25) {
    return ["te", "shang", "shang"];
  }
  if (wave === 55) {
    return ["te", "te", "shang", "shang"];
  }
  if (wave === 95) {
    return ["te", "te", "te", "te"];
  }
  if (wave === 115) {
    return ["qi", "qi", "te", "te", "te"];
  }
  if (wave === 145) {
    return ["qi", "qi", "qi", "te", "te"];
  }
  if (wave === 165) {
    return ["qi", "qi", "te", "te", "te", "te"];
  }
  if (wave === 195) {
    return ["qi", "qi", "te", "te", "shang", "shang"];
  }
  return null;
}
function rerollCost(wave, rerolls, locked) {
  const band = Math.ceil(wave / 10);
  const growth = 2 ** rerolls;
  if (locked && locked.length > 0) {
    const base = locked.reduce((sum, tier) => sum + LOCK_BASE[tier], 0);
    return base * band * growth;
  }
  return 250 * band * growth;
}
function eligibleShopBoons(opts) {
  const draughtWeight = potionWeight(opts.hpRatios ?? [1]);
  const rerolls = opts.rerolls ?? 0;
  const partyIds = opts.partyIds;
  const keys = opts.boonIds ?? [];
  return loadTables().boons.flatMap((row) => {
    if (row.kind === "map" && opts.wave > 180) {
      return [];
    }
    if ((row.kind === "gold" || row.kind === "exp") && opts.wave === 199) {
      return [];
    }
    if (row.kind === "evolve" && partyIds) {
      const canEvolve = partyIds.some((id) => Boolean(getSpirit(id).evolveTo));
      if (!canEvolve) {
        return [];
      }
    }
    if (row.kind === "formItem") {
      if (row.id === "sanctify_stone" && !keys.includes("sanctify_cuff")) {
        return [];
      }
      if (row.id === "colossus_shroom" && !keys.includes("colossus_band")) {
        return [];
      }
      if (row.id === "apex_crystal" && !opts.hasApexBand && !keys.includes("apex_vessel")) {
        return [];
      }
    }
    if (row.kind === "splicer" && partyIds && partyIds.length < 2) {
      return [];
    }
    if (row.kind === "voucher" && opts.mode === "daily") {
      return [];
    }
    if (row.id === "voucher_te" && opts.mode === "endless") {
      return [];
    }
    if (row.id === "catch_charm") {
      if ((opts.seenCount ?? 0) < 100 || (opts.challenges ?? []).includes("blank")) {
        return [];
      }
    }
    const tier = row.tier ?? "fan";
    let weight = row.weight;
    if (row.kind === "potion") {
      weight = draughtWeight;
    }
    if (row.kind === "evolve") {
      weight = row.weight * Math.max(1, Math.ceil(opts.wave / 25));
    }
    if (row.kind === "voucher") {
      weight = row.weight / 2 ** rerolls;
    }
    return [{ ...row, tier, weight }];
  });
}
function openShop(opts) {
  const goldenSlots = opts.goldenSlots ?? 0;
  const forced = forcedTiers(opts.wave) ?? [];
  const slots = Math.min(6, Math.max(3 + goldenSlots, forced.length));
  const hpRatios = opts.hpRatios ?? [1];
  const rerolls = opts.rerolls ?? 0;
  const rng = new RngStream(opts.seed).child(1e3 + opts.wave + rerolls * 97);
  const offers = rollOffers(rng, slots, {
    wave: opts.wave,
    hpRatios,
    rerolls,
    partyIds: opts.partyIds,
    mode: opts.mode,
    seenCount: opts.seenCount,
    challenges: opts.challenges,
    boonIds: opts.boonIds,
    hasApexBand: opts.hasApexBand,
    fusedIds: opts.fusedIds
  });
  return {
    wave: opts.wave,
    gold: opts.gold,
    rerolls,
    goldenSlots,
    lock: opts.lock ?? opts.wave === 165,
    seed: opts.seed,
    hpRatios,
    offers,
    partyIds: opts.partyIds,
    mode: opts.mode,
    seenCount: opts.seenCount,
    challenges: opts.challenges,
    boonIds: opts.boonIds,
    hasApexBand: opts.hasApexBand,
    fusedIds: opts.fusedIds
  };
}
function rerollShop(shop, seed = shop.seed) {
  const locked = shop.lock ? shop.offers.map((row) => row.tier) : void 0;
  const cost = rerollCost(shop.wave, shop.rerolls, locked);
  if (shop.gold < cost) {
    throw new Error("not enough gold");
  }
  return openShop({
    wave: shop.wave,
    seed,
    gold: shop.gold - cost,
    goldenSlots: shop.goldenSlots,
    hpRatios: shop.hpRatios,
    lock: shop.lock,
    rerolls: shop.rerolls + 1,
    partyIds: shop.partyIds,
    mode: shop.mode,
    seenCount: shop.seenCount,
    challenges: shop.challenges,
    boonIds: shop.boonIds,
    hasApexBand: shop.hasApexBand,
    fusedIds: shop.fusedIds
  });
}
function rollOffers(rng, slots, filter) {
  const forced = forcedTiers(filter.wave) ?? [];
  const pool = eligibleShopBoons(filter);
  const offers = [];
  for (let i = 0; i < slots; i++) {
    const tier = forced[i] ?? rollTier(rng);
    const picked = takeFromTier(rng, pool, tier);
    offers.push(picked);
  }
  return offers;
}
function rollTier(rng) {
  let ticket = rng.float();
  for (const row of TIER_ROLL) {
    ticket -= row.chance;
    if (ticket <= 0) {
      return row.tier;
    }
  }
  return "fan";
}
function takeFromTier(rng, pool, want) {
  const candidates = pool.filter((row) => row.tier === want && row.weight > 0);
  const fallback = candidates.length > 0 ? candidates : pool.filter((row) => row.weight > 0);
  const source = fallback.length > 0 ? fallback : pool;
  const total = source.reduce((sum, row) => sum + Math.max(row.weight, 1), 0);
  let ticket = rng.float() * total;
  let picked = source[source.length - 1];
  for (const row of source) {
    ticket -= Math.max(row.weight, 1);
    if (ticket <= 0) {
      picked = row;
      break;
    }
  }
  const index = pool.findIndex((row) => row.id === picked.id);
  if (index >= 0) {
    pool.splice(index, 1);
  }
  return picked;
}
function stockForWave(wave) {
  const stock = [
    { id: "small_draught", name: "\u5C0F\u836F", cost: 100 * Math.ceil(wave / 10) },
    { id: "soul_return", name: "\u8FD8\u9B42", cost: 150 * Math.ceil(wave / 10) },
    { id: "ether_dew", name: "\u7075\u9732", cost: 120 * Math.ceil(wave / 10) }
  ];
  if (wave >= 21) {
    stock.push({ id: "cleanse_talisman", name: "\u51C0\u4F53", cost: 200 * Math.ceil(wave / 10) });
  }
  return stock;
}

// src/tables/omens.json
var omens_default = [
  {
    id: "inn_rest",
    kind: "heal",
    name: "\u8352\u5E97\u4E00\u5BBF",
    body: "\u5E97\u4E3B\u6DFB\u4E86\u706F\u6CB9\uFF0C\u95EE\u4F60\u53EF\u4F4F\u4E00\u665A\u3002",
    options: [
      {
        label: "\u4F4F\u4E0B",
        heal: true
      },
      {
        label: "\u8D76\u8DEF"
      }
    ]
  },
  {
    id: "well_bone",
    kind: "bone",
    name: "\u53E4\u4E95\u8D4C\u9AA8",
    body: "\u4E95\u5E95\u6709\u4EBA\u4F4E\u8BED\uFF0C\u8981\u62FF\u9AA8\u76F8\u6765\u6362\u3002",
    options: [
      {
        label: "\u4F38\u624B",
        bone: 1
      },
      {
        label: "\u9000\u5F00"
      }
    ]
  },
  {
    id: "opera_fight",
    kind: "battle",
    name: "\u793E\u620F\u5F00\u6218",
    body: "\u620F\u53F0\u4E0A\u8DF3\u4E0B\u4E00\u540D\u82B1\u8138\uFF0C\u8981\u4E0E\u4F60\u6BD4\u8BD5\u3002",
    options: [
      {
        label: "\u5E94\u6218",
        battle: true
      },
      {
        label: "\u79BB\u5E2D"
      }
    ]
  },
  {
    id: "stele_pact",
    kind: "pact",
    name: "\u7891\u523B\u6539\u5951",
    body: "\u6B8B\u7891\u4E0A\u7684\u5951\u6587\u672A\u5E72\u3002",
    options: [
      {
        label: "\u6539\u5951",
        pact: true
      },
      {
        label: "\u4E0D\u78B0"
      }
    ]
  },
  {
    id: "lamp_egg",
    kind: "egg",
    name: "\u6E14\u706F\u5F97\u5375",
    body: "\u6CB3\u4E0A\u6E14\u706F\u7167\u51FA\u4E00\u679A\u6E29\u5375\u3002",
    options: [
      {
        label: "\u6536\u4E0B",
        voucher: "fan"
      },
      {
        label: "\u653E\u56DE"
      }
    ]
  },
  {
    id: "paper_fuse",
    kind: "fuse",
    name: "\u7EB8\u9A6C\u5408\u4F53",
    body: "\u7EB8\u9A6C\u8981\u4E0E\u961F\u4E2D\u7CBE\u602A\u53E0\u6210\u4E00\u8EAB\u3002",
    options: [
      {
        label: "\u5141\u4E86",
        fuse: true
      },
      {
        label: "\u6495\u5F00"
      }
    ]
  },
  {
    id: "bell_swap",
    kind: "swap",
    name: "\u94DC\u949F\u6362\u4EBA",
    body: "\u949F\u54CD\u4E00\u6B21\uFF0C\u961F\u4E2D\u9996\u4F4D\u4E0E\u672B\u4F4D\u5BF9\u8C03\u3002",
    options: [
      {
        label: "\u6572\u949F",
        swap: true
      },
      {
        label: "\u6342\u8033"
      }
    ]
  },
  {
    id: "lost_charm",
    kind: "lost",
    name: "\u8352\u9A7F\u5931\u7269",
    body: "\u5305\u88B1\u5C11\u4E86\u4E00\u4EF6\u673A\u7F18\u3002",
    options: [
      {
        label: "\u8BA4\u4E86",
        lost: true
      },
      {
        label: "\u7FFB\u627E"
      }
    ]
  },
  {
    id: "night_market",
    kind: "shop",
    name: "\u591C\u5E02\u5546\u5E97",
    body: "\u644A\u4E3B\u53EA\u6536\u591C\u95F4\u6765\u5BA2\u3002",
    options: [
      {
        label: "\u901B\u644A",
        shop: true
      },
      {
        label: "\u8D70\u8FC7"
      }
    ]
  },
  {
    id: "grave_offer",
    kind: "offer",
    name: "\u5893\u6811\u732E\u796D",
    body: "\u6811\u6839\u8981\u4E00\u53E3\u7CBE\u8840\u3002",
    options: [
      {
        label: "\u732E\u8840",
        hp: -0.2,
        gold: 40
      },
      {
        label: "\u7ED5\u5F00"
      }
    ]
  },
  {
    id: "gamble_luck",
    kind: "luck",
    name: "\u8D4C\u547D\u52A0\u8FD0",
    body: "\u9AB0\u5B50\u505C\u5728\u4F60\u638C\u5FC3\u3002",
    options: [
      {
        label: "\u63B7",
        luck: 1
      },
      {
        label: "\u4E0D\u8D4C"
      }
    ]
  },
  {
    id: "release_carp",
    kind: "gold",
    name: "\u653E\u751F\u5F97\u94B1",
    body: "\u7BEE\u91CC\u7684\u6CB3\u9C7C\u8FD8\u60F3\u56DE\u6C34\u91CC\u3002",
    options: [
      {
        label: "\u653E\u751F",
        gold: 80
      },
      {
        label: "\u4E0D\u653E"
      }
    ]
  },
  {
    id: "tutor_scroll",
    kind: "exp",
    name: "\u91CE\u9986\u5B66\u672F",
    body: "\u5148\u751F\u613F\u6559\u4E00\u8BFE\u3002",
    options: [
      {
        label: "\u542C\u8BB2",
        exp: 1
      },
      {
        label: "\u544A\u8F9E"
      }
    ]
  },
  {
    id: "lock_omen",
    kind: "omen",
    name: "\u5929\u65F6\u9501",
    body: "\u4E91\u5C42\u88AB\u7B26\u7EB8\u9489\u4F4F\u3002",
    options: [
      {
        label: "\u843D\u7B26",
        lockOmen: true
      },
      {
        label: "\u4E0D\u7BA1"
      }
    ]
  },
  {
    id: "force_pair",
    kind: "dual",
    name: "\u53CC\u4EBA\u5F3A\u5236",
    body: "\u5C71\u8DEF\u53EA\u5BB9\u4E24\u4EBA\u5E76\u80A9\u3002",
    options: [
      {
        label: "\u5E76\u8D70",
        dual: true
      },
      {
        label: "\u5355\u884C"
      }
    ]
  },
  {
    id: "temp_ban",
    kind: "illegal",
    name: "\u975E\u6CD5\u4F53\u6682\u7528",
    body: "\u5323\u4E2D\u7CBE\u602A\u6682\u53EF\u4E0A\u573A\u4E00\u6218\u3002",
    options: [
      {
        label: "\u542F\u7528",
        temp: true
      },
      {
        label: "\u5C01\u5323"
      }
    ]
  },
  {
    id: "inn_rest_2",
    kind: "heal",
    name: "\u793E\u4ED3\u6B47\u811A",
    body: "\u4ED3\u91CC\u6709\u4F59\u7CAE\u3002",
    options: [
      {
        label: "\u5403\u9971",
        heal: true
      },
      {
        label: "\u4E0D\u5403"
      }
    ]
  },
  {
    id: "well_bone_2",
    kind: "bone",
    name: "\u77F3\u69FD\u95EE\u9AA8",
    body: "\u69FD\u6C34\u6620\u51FA\u9AA8\u7EB9\u3002",
    options: [
      {
        label: "\u63A2\u6C34",
        bone: 1
      },
      {
        label: "\u8D70\u5F00"
      }
    ]
  },
  {
    id: "opera_fight_2",
    kind: "battle",
    name: "\u50A9\u961F\u62E6\u8DEF",
    body: "\u50A9\u9762\u8981\u4F60\u6BD4\u6B66\u3002",
    options: [
      {
        label: "\u6BD4\u6B66",
        battle: true
      },
      {
        label: "\u8BA9\u8DEF"
      }
    ]
  },
  {
    id: "lamp_egg_2",
    kind: "egg",
    name: "\u82A6\u82B1\u62FE\u5375",
    body: "\u82A6\u4E1B\u91CC\u6E29\u7740\u4E00\u5375\u3002",
    options: [
      {
        label: "\u62FE\u8D77",
        voucher: "fan"
      },
      {
        label: "\u7559\u4E0B"
      }
    ]
  },
  {
    id: "release_carp_2",
    kind: "gold",
    name: "\u6865\u4E0B\u94DC\u94B1",
    body: "\u6709\u4EBA\u628A\u94B1\u6295\u5165\u6865\u6D1E\u3002",
    options: [
      {
        label: "\u4E5F\u6295",
        gold: 50
      },
      {
        label: "\u4E0D\u6295"
      }
    ]
  },
  {
    id: "night_market_2",
    kind: "shop",
    name: "\u706F\u4F1A\u591C\u644A",
    body: "\u706F\u4F1A\u91CC\u8FD8\u80FD\u4E70\u5230\u8D27\u3002",
    options: [
      {
        label: "\u4E70",
        shop: true
      },
      {
        label: "\u901B\u8FC7"
      }
    ]
  },
  {
    id: "gamble_luck_2",
    kind: "luck",
    name: "\u9999\u6848\u6C42\u7B7E",
    body: "\u7B7E\u7B52\u8F7B\u8F7B\u4E00\u98A4\u3002",
    options: [
      {
        label: "\u6C42\u7B7E",
        luck: 1
      },
      {
        label: "\u4E0D\u6C42"
      }
    ]
  },
  {
    id: "force_pair_2",
    kind: "dual",
    name: "\u53CC\u6865\u5E76\u6E21",
    body: "\u4E24\u6865\u5FC5\u987B\u540C\u65F6\u8FC7\u3002",
    options: [
      {
        label: "\u5E76\u6E21",
        dual: true
      },
      {
        label: "\u5355\u6865"
      }
    ]
  },
  {
    id: "shrine_oil",
    kind: "heal",
    name: "\u793E\u6CB9\u6DFB\u706F",
    body: "\u793E\u516C\u706F\u76CF\u5C06\u5C3D\uFF0C\u95EE\u4F60\u53EF\u6DFB\u4E00\u52FA\u6CB9\u3002",
    options: [
      {
        label: "\u6DFB\u6CB9",
        heal: true
      },
      {
        label: "\u4E0D\u6DFB"
      }
    ]
  },
  {
    id: "mill_tax",
    kind: "gold",
    name: "\u78BE\u623F\u62BD\u7A0E",
    body: "\u77F3\u78BE\u65C1\u5750\u7740\u6536\u7A0E\u7684\u7EB8\u4EBA\u3002",
    options: [
      {
        label: "\u4EA4\u7A0E",
        gold: -20
      },
      {
        label: "\u786C\u95EF",
        gold: 30
      }
    ]
  },
  {
    id: "ferry_bell",
    kind: "luck",
    name: "\u6E21\u53E3\u95EE\u949F",
    body: "\u6E21\u8239\u94C1\u949F\u53EA\u54CD\u534A\u58F0\u3002",
    options: [
      {
        label: "\u518D\u6572",
        luck: 1
      },
      {
        label: "\u4E0A\u8239"
      }
    ]
  },
  {
    id: "kiln_ash",
    kind: "bone",
    name: "\u7A91\u7070\u6696\u9AA8",
    body: "\u51B7\u7A91\u91CC\u8FD8\u5269\u4E00\u628A\u6E29\u7070\u3002",
    options: [
      {
        label: "\u57CB\u9AA8",
        bone: 1
      },
      {
        label: "\u4E0D\u78B0"
      }
    ]
  },
  {
    id: "fox_lantern",
    kind: "shop",
    name: "\u72D0\u706B\u591C\u5E02",
    body: "\u6797\u95F4\u4E00\u4E32\u72D0\u706B\u6392\u6210\u644A\u4F4D\u3002",
    options: [
      {
        label: "\u8DDF\u53BB",
        shop: true
      },
      {
        label: "\u4E0D\u8DDF"
      }
    ]
  },
  {
    id: "reed_nest",
    kind: "egg",
    name: "\u82A6\u7A9D\u6E29\u5375",
    body: "\u82A6\u82B1\u5806\u91CC\u6709\u4E00\u679A\u672A\u51B7\u7684\u5375\u3002",
    options: [
      {
        label: "\u63E3\u8D70",
        voucher: "fan"
      },
      {
        label: "\u76D6\u597D"
      }
    ]
  },
  {
    id: "drum_duel",
    kind: "battle",
    name: "\u793E\u9F13\u7EA6\u6218",
    body: "\u9F13\u624B\u8981\u4F60\u6309\u8282\u62CD\u51FA\u624B\u3002",
    options: [
      {
        label: "\u5E94\u9F13",
        battle: true
      },
      {
        label: "\u9000\u573A"
      }
    ]
  },
  {
    id: "vine_twin",
    kind: "dual",
    name: "\u85E4\u6865\u5E76\u8D70",
    body: "\u6865\u7D22\u53EA\u5BB9\u4E24\u4EBA\u540C\u8E0F\u3002",
    options: [
      {
        label: "\u5E76\u8D70",
        dual: true
      },
      {
        label: "\u7B49\u4E00\u7B49"
      }
    ]
  },
  {
    id: "stele_lesson",
    kind: "exp",
    name: "\u6B8B\u7891\u591C\u8BFE",
    body: "\u7891\u9634\u6709\u4EBA\u7528\u70AD\u7B14\u6559\u5B57\u3002",
    options: [
      {
        label: "\u8DDF\u7740\u5FF5",
        exp: 1
      },
      {
        label: "\u4E0D\u5B66"
      }
    ]
  },
  {
    id: "grave_wine",
    kind: "offer",
    name: "\u5893\u9152\u6362\u8840",
    body: "\u575F\u524D\u4E00\u7897\u6D4A\u9152\uFF0C\u8981\u4E00\u53E3\u7CBE\u8840\u3002",
    options: [
      {
        label: "\u996E\u4E86",
        hp: -0.2,
        gold: 45
      },
      {
        label: "\u4E0D\u996E"
      }
    ]
  },
  {
    id: "paper_shift",
    kind: "swap",
    name: "\u7EB8\u9A6C\u6362\u4F4D",
    body: "\u7EB8\u9A6C\u7ED5\u573A\u4E00\u5468\uFF0C\u961F\u9996\u961F\u5C3E\u5BF9\u8C03\u3002",
    options: [
      {
        label: "\u5141\u4E86",
        swap: true
      },
      {
        label: "\u6495\u9A6C"
      }
    ]
  },
  {
    id: "nail_cloud",
    kind: "omen",
    name: "\u7B26\u9489\u5C42\u4E91",
    body: "\u6709\u4EBA\u8981\u628A\u5929\u65F6\u9489\u6B7B\u5728\u8FD9\u4E00\u5C42\u3002",
    options: [
      {
        label: "\u843D\u9489",
        lockOmen: true
      },
      {
        label: "\u4E0D\u7BA1"
      }
    ]
  },
  {
    id: "cinnabar_pact",
    kind: "pact",
    name: "\u4E39\u4E66\u6539\u5951",
    body: "\u4E39\u7802\u672A\u5E72\uFF0C\u5951\u6587\u53EF\u6539\u534A\u884C\u3002",
    options: [
      {
        label: "\u6539\u5951",
        pact: true
      },
      {
        label: "\u76D6\u5370"
      }
    ]
  },
  {
    id: "shadow_fold",
    kind: "fuse",
    name: "\u5F71\u53E0\u4E00\u4F53",
    body: "\u4E24\u9053\u5F71\u5B50\u8981\u53E0\u6210\u4E00\u6761\u3002",
    options: [
      {
        label: "\u53E0\u5F71",
        fuse: true
      },
      {
        label: "\u5206\u5F00"
      }
    ]
  },
  {
    id: "night_pouch",
    kind: "lost",
    name: "\u591C\u8DEF\u4E22\u56CA",
    body: "\u5C71\u98CE\u6380\u5F00\u5305\u88B1\uFF0C\u5C11\u4E86\u4E00\u4EF6\u673A\u7F18\u3002",
    options: [
      {
        label: "\u8BA4\u4E86",
        lost: true
      },
      {
        label: "\u6CBF\u8DEF\u627E"
      }
    ]
  },
  {
    id: "mask_borrow",
    kind: "illegal",
    name: "\u50A9\u9762\u6682\u501F",
    body: "\u5323\u4E2D\u50A9\u9762\u8BF4\u53EF\u66FF\u4F60\u6253\u4E00\u4ED7\u3002",
    options: [
      {
        label: "\u6234\u4E0A",
        temp: true
      },
      {
        label: "\u5C01\u5323"
      }
    ]
  }
];

// src/run/omen-event.ts
var ROWS = omens_default;
function listOmens() {
  return ROWS;
}
function getOmen(id) {
  const row = ROWS.find((item) => item.id === id);
  if (!row) {
    throw new Error(`unknown omen ${id}`);
  }
  return row;
}
function applyOmenOption(run, account, omenId, optionIndex) {
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

// src/run/classic-slice.ts
var ClassicSlice = class _ClassicSlice {
  run;
  account;
  phase = "battle";
  encounter = null;
  boonChoices = [];
  realmChoices = [];
  shop = null;
  omen = null;
  fusion = null;
  constructor(opts) {
    this.run = createRun(opts);
    this.account = recordCatch(this.run, opts.starterId, opts.account);
  }
  /** 从已解码的存档状态重建（不重新掷种、不重复记录初始收契）。 */
  static fromState(run, account) {
    const slice = new _ClassicSlice({
      seed: run.seed,
      starterId: run.starterId,
      mode: run.mode,
      account
    });
    slice.run = run;
    slice.account = account;
    slice.phase = "battle";
    slice.encounter = null;
    slice.boonChoices = [];
    slice.realmChoices = [];
    slice.shop = null;
    slice.omen = null;
    slice.fusion = null;
    return slice;
  }
  beginWave() {
    this.run.lures = tickLures(this.run.lures);
    tickWarTokens(this.run);
    tickEggs(this.account, 1);
    this.encounter = nextEncounter(this.run);
    for (const id of this.encounter.foeIds) {
      this.account = recordSeen(this.run, id, this.account);
    }
    this.phase = "battle";
    this.boonChoices = [];
    this.realmChoices = [];
    this.shop = null;
    this.omen = null;
    return this.encounter;
  }
  skipToWave(wave) {
    const cap = finaleWave(this.run.mode, this.run.sprint) ?? 9999;
    this.run.wave = Math.min(cap, Math.max(1, wave));
    if (this.run.wave >= 191) {
      this.run.realmId = "void";
    } else if (this.run.wave > 10 && this.run.realmId === "town_ruins") {
      this.run.realmId = pickNextRealm({
        realmId: "town_ruins",
        seed: this.run.seed,
        wave: 10,
        hasMap: false
      });
    }
    return this.beginWave();
  }
  noteWin() {
    if (!this.encounter) {
      throw new Error("no encounter");
    }
    if (this.encounter.finale) {
      maybeRecordDaily(this.account, this.run);
      if (this.run.mode === "daily") {
        evaluateAchievements(this.account, { type: "daily", wave: this.run.wave });
      }
      onRunVictory(this.account, this.run.partyIds, this.run.mode);
      this.phase = "victory";
      return;
    }
    if (isApexRivalWave(this.run.wave)) {
      this.run.hasApexBand = true;
    }
    this.run.gold += waveGoldReward(this.run.wave, this.encounter.kind !== "wild");
    this.phase = this.encounter.catchable ? "catch" : "boon";
    if (this.phase === "boon") {
      this.openBoon();
    }
  }
  noteLoss() {
    maybeRecordDaily(this.account, this.run);
    if (this.run.mode === "daily") {
      evaluateAchievements(this.account, { type: "daily", wave: this.run.wave });
    }
    this.phase = "defeat";
  }
  skipCatch() {
    this.openBoon();
  }
  resolveCatch(caught) {
    const foeId = this.encounter?.foeId;
    if (caught && foeId) {
      this.account = recordCatch(this.run, foeId, this.account);
      evaluateAchievements(this.account, { type: "catch" });
      if (this.run.partyIds.length < 6 && !this.run.partyIds.includes(foeId)) {
        this.run.partyIds.push(foeId);
        this.run.partyHpRatios.push(1);
        this.run.partyLevels.push(encounterLevel(this.run.wave));
        this.run.partyCharms.push([]);
      }
    }
    this.openBoon();
  }
  attemptCatch(hpRatio = 0) {
    const rng = new RngStream(this.run.seed).child(2e3 + this.run.wave);
    const foeId = this.encounter?.foeId;
    const result = trySeal({
      hpRatio,
      sealMul: SEAL_TIERS[1].mul,
      catchRate: foeId ? speciesCatchRate(getSpirit(foeId)) : 255,
      catchBoon: catchModifier(this.run),
      rng
    });
    this.resolveCatch(result.caught);
    return result;
  }
  takeBoon(boonId) {
    applyBoon(this.run, boonId, this.account);
    const cleared = this.run.wave;
    this.boonChoices = [];
    this.shop = null;
    const result = advanceAfterWin(this.run);
    if ((this.run.mode === "classic" || this.run.mode === "challenge") && this.run.wave >= 191) {
      this.run.realmId = "void";
      this.phase = "battle";
      return;
    }
    if (result.shifted && this.run.hasMap && healOnShift(this.run.mode)) {
      this.phase = "map";
      this.realmChoices = realmChoices(this.run.realmId, this.run.seed, cleared);
      return;
    }
    this.phase = "battle";
  }
  pickRealm(realmId) {
    this.run.realmId = realmId;
    this.realmChoices = [];
    this.phase = "battle";
  }
  rerollShop() {
    if (!this.shop) {
      throw new Error("no shop");
    }
    this.shop = rerollShop(this.shop, this.run.seed);
    this.run.gold = this.shop.gold;
    this.boonChoices = this.shop.offers;
  }
  buyStock(id) {
    if (!allowsShopBuy(this.run.mode)) {
      throw new Error("no shop buy");
    }
    const item = stockForWave(this.run.wave).find((row) => row.id === id);
    if (!item) {
      throw new Error("not in stock");
    }
    if (this.run.gold < item.cost) {
      throw new Error("not enough gold");
    }
    this.run.gold -= item.cost;
    applyBoon(this.run, id, this.account);
    if (this.shop) {
      this.shop.gold = this.run.gold;
    }
  }
  advanceRealm(cleared) {
    if (this.run.hasMap) {
      this.phase = "map";
      this.realmChoices = realmChoices(this.run.realmId, this.run.seed, cleared);
      return;
    }
    this.run.realmId = pickNextRealm({
      realmId: this.run.realmId,
      seed: this.run.seed,
      wave: cleared,
      hasMap: false
    });
    this.phase = "battle";
  }
  openBoon() {
    this.phase = "boon";
    if (this.run.wave === 165) {
      this.run.hasLock = true;
    }
    this.shop = openShop({
      wave: this.run.wave,
      seed: this.run.seed,
      gold: this.run.gold,
      goldenSlots: this.run.goldenSlots,
      lock: this.run.hasLock,
      hpRatios: this.run.partyHpRatios,
      partyIds: this.run.partyIds,
      mode: this.run.mode,
      seenCount: this.account.seenIds.length,
      challenges: this.run.challenges,
      boonIds: this.run.boonIds,
      hasApexBand: this.run.hasApexBand,
      fusedIds: this.run.fusedIds
    });
    this.boonChoices = this.shop.offers;
  }
  openOmen(id) {
    this.omen = getOmen(id);
    this.phase = "omen";
  }
  pickOmen(optionIndex) {
    if (!this.omen) {
      throw new Error("no omen");
    }
    applyOmenOption(this.run, this.account, this.omen.id, optionIndex);
    this.omen = null;
    this.openBoon();
  }
  fuseParty(primaryIndex, sacrificeIndex) {
    const primaryId = this.run.partyIds[primaryIndex];
    const sacrificeId = this.run.partyIds[sacrificeIndex];
    if (!primaryId || !sacrificeId) {
      throw new Error("need two spirits");
    }
    this.fusion = fuse(primaryId, sacrificeId);
    this.run.partyIds.splice(sacrificeIndex, 1);
    this.account.fusedClear = true;
    evaluateAchievements(this.account, { type: "fuse" });
    return this.fusion;
  }
};

// src/meta/candy.ts
var BASE_COST = {
  zao_li: 3,
  jing_zhu: 3,
  tao_geng: 3
};
var CANDY_PRICE = 20;
function baseCost(spiritId) {
  return BASE_COST[spiritId] ?? 5;
}
function currentCost(spiritId, account) {
  const down = account.costDown[spiritId] ?? 0;
  return Math.max(1, baseCost(spiritId) - down);
}
function spendCandy(account, spiritId, kind) {
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
function addCandy(account, spiritId, amount) {
  account.candy[spiritId] = (account.candy[spiritId] ?? 0) + amount;
}

// src/meta/miasma.ts
function dailyMiasma(utcDate, caughtIds) {
  const unique = Array.from(new Set(caughtIds));
  if (unique.length === 0) {
    return [];
  }
  const rng = new RngStream(`${utcDate}|miasma`);
  const picked = [];
  const used = /* @__PURE__ */ new Set();
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

// src/save/codec.ts
function encodeRun(run) {
  const save = { v: 1, ...run };
  return JSON.stringify(save);
}
function decodeRun(raw) {
  const save = JSON.parse(raw);
  if (save.v !== 1) {
    throw new Error("unsupported run save");
  }
  return {
    seed: save.seed,
    wave: save.wave,
    realmId: save.realmId,
    starterId: save.starterId,
    partyIds: save.partyIds,
    gold: save.gold,
    potions: save.potions ?? 0,
    seals: save.seals ?? [0, 0, 0, 0, 0],
    goldenSlots: save.goldenSlots ?? 0,
    hasMap: save.hasMap ?? false,
    hasLock: save.hasLock ?? false,
    hasApexBand: save.hasApexBand ?? false,
    lures: save.lures ?? [],
    boonIds: save.boonIds,
    caughtIds: save.caughtIds,
    mode: save.mode ?? "classic",
    costCap: save.costCap ?? 10,
    challenges: save.challenges ?? [],
    nightMarks: save.nightMarks ?? [],
    partyHpRatios: save.partyHpRatios ?? save.partyIds.map(() => 1),
    partyLevels: save.partyLevels ?? save.partyIds.map(() => 5),
    luck: save.luck ?? 0,
    forceDual: save.forceDual ?? false,
    partyCharms: save.partyCharms ?? save.partyIds.map(() => []),
    relicIds: save.relicIds ?? [],
    sprint: save.sprint ?? false,
    fusedIds: save.fusedIds ?? [],
    bag: save.bag ?? {},
    warTokens: save.warTokens ?? [],
    spliceCharges: save.spliceCharges ?? 0,
    unspliceCharges: save.unspliceCharges ?? 0,
    partyExtraArts: save.partyExtraArts ?? save.partyIds.map(() => []),
    partyTempers: save.partyTempers ?? save.partyIds.map(() => "plain")
  };
}
function encodeAccount(account) {
  const save = { v: 1, ...account };
  return JSON.stringify(save);
}
function decodeAccount(raw) {
  const save = JSON.parse(raw);
  if (save.v !== 1) {
    throw new Error("unsupported account save");
  }
  return {
    revision: save.revision,
    codex: save.codex,
    seenIds: save.seenIds ?? [...save.codex],
    settings: save.settings ?? emptyAccount().settings,
    unlockedStarters: save.unlockedStarters,
    classicCleared: save.classicCleared ?? false,
    fusedClear: save.fusedClear ?? false,
    candy: save.candy ?? {},
    costDown: save.costDown ?? {},
    boneCap: save.boneCap ?? {},
    secondPact: save.secondPact ?? [],
    vouchers: save.vouchers ?? { fan: 0, shang: 0, te: 0, jin: 0 },
    eggs: save.eggs ?? [],
    achievements: save.achievements ?? [],
    ribbons: save.ribbons ?? [],
    carryBaby: save.carryBaby ?? false,
    unlockedRelics: save.unlockedRelics ?? emptyAccount().unlockedRelics,
    dailyScores: save.dailyScores ?? {},
    tempers: save.tempers ?? []
  };
}

// src/save/local-store.ts
function assertSlot(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot > 4) {
    throw new Error("slot must be 0-4");
  }
}
async function saveRunLocal(store, slot, run) {
  assertSlot(slot);
  await store.set(`run:${slot}`, encodeRun(run));
}
async function loadRunLocal(store, slot) {
  assertSlot(slot);
  const raw = await store.get(`run:${slot}`);
  return raw ? decodeRun(raw) : null;
}
async function saveAccountLocal(store, account) {
  await store.set("account", encodeAccount(account));
}
async function loadAccountLocal(store) {
  const raw = await store.get("account");
  return raw ? decodeAccount(raw) : null;
}

// src/ui/screens.ts
var LOBBY_SCREENS = [
  "title",
  "mode",
  "settings",
  "codex",
  "eggs",
  "achievements",
  "stats",
  "slots"
];
var RUN_SCREENS = [
  "starter",
  "battle",
  "summary",
  "party",
  "bag",
  "shop",
  "map",
  "omen",
  "defeat",
  "victory",
  "hatch"
];
var START_PATH = ["title", "mode", "starter"];

// src/ui/layout.ts
var VIEW = { width: 750, height: 1334 };
var HIT_MIN = 44;
var BATTLE = {
  foe: { x: 130, y: 40, width: 168, height: 220 },
  player: { x: -150, y: -10, width: 176, height: 230 },
  commandsY: -423,
  commandsX: [-84, 84, -84],
  commandW: 156,
  commandH: 58,
  logY: -600
};
var HUD = {
  foePlate: { x: -170, y: 458, width: 330, height: 96 },
  playerPlate: { x: -190, y: -186, width: 330, height: 104 },
  partyTray: { x: -190, y: -252 },
  message: { y: -600, width: 710, height: 128 },
  topBar: { y: 612, width: 710, height: 52 }
};
var ART_SLIP = { x: 126, width: 156, height: 58, gap: 12 };
function artSlipPos(index) {
  return commandCell(0, -423, 168, 70, index);
}
function screenLayout(width, height) {
  return height >= width ? portraitLayout() : landscapeLayout();
}
function codexCell(ui, index) {
  const grid = ui.codex;
  const col = index % grid.cols;
  const row = Math.floor(index / grid.cols);
  return {
    x: (col - (grid.cols - 1) / 2) * grid.dx,
    y: grid.y0 - row * grid.dy
  };
}
function commandCell(cx, cy, dx, dy, index) {
  return {
    x: cx + (index % 2 - 0.5) * dx,
    y: cy - Math.floor(index / 2) * dy
  };
}
function portraitLayout() {
  const cx = 0;
  const cy = -423;
  const dx = 168;
  const dy = 70;
  const commandPos = (index) => commandCell(cx, cy, dx, dy, index);
  const cell0 = commandPos(0);
  return {
    kind: "portrait",
    view: { width: VIEW.width, height: VIEW.height },
    horizonY: 120,
    battle: {
      foe: { ...BATTLE.foe },
      player: { ...BATTLE.player },
      commandsY: cy,
      commandsX: [commandPos(0).x, commandPos(1).x, commandPos(2).x],
      commandW: BATTLE.commandW,
      commandH: BATTLE.commandH,
      logY: HUD.message.y,
      skip: { x: 300, y: HUD.topBar.y },
      help: { x: -336, y: HUD.topBar.y },
      quit: { x: -258, y: HUD.topBar.y },
      tools: [
        { x: -258, y: cy },
        { x: 258, y: cy },
        { x: 258, y: cy - dy }
      ],
      back: { x: cx, y: cy + dy },
      menuY0: -302,
      menuGap: 66,
      menuDx: 168
    },
    hud: {
      foePlate: { ...HUD.foePlate },
      playerPlate: { ...HUD.playerPlate },
      partyTray: { ...HUD.partyTray },
      message: { ...HUD.message },
      topBar: { ...HUD.topBar },
      log: { x: 0, y: HUD.message.y, width: 680, height: 100 }
    },
    artSlip: { x: cell0.x, width: BATTLE.commandW, height: BATTLE.commandH, gap: 12 },
    artSlipPos: commandPos,
    commandPos,
    lobby: {
      splashY: 490,
      menu: { x: 0, y: 40, width: 660, height: 620 },
      itemDx: 268,
      itemY0: 208,
      itemGap: 112,
      buttonW: 220,
      buttonH: 64,
      tabW: 112,
      tabDx: 118,
      help: { x: 336, y: HUD.topBar.y },
      glossary: { x: 0, y: 40, width: 700, height: 560 },
      glossaryBodyY: -146,
      glossaryItemY0: 240,
      glossaryGap: 68,
      glossaryItemDx: 220,
      glossaryCols: 3,
      glossaryBackY: -360,
      panel: { y: 40, width: 620, height: 520 },
      backY: -186,
      starterRelicY: 268,
      starterCandyY: 168,
      starterBackY: -300,
      starterCard: { y: -70, width: 210, height: 260 },
      slotDx: 136,
      slotW: 120,
      shopDx: 236,
      modeCols: 2
    },
    codex: {
      cols: 4,
      rows: 4,
      y0: 420,
      dx: 176,
      dy: 212,
      cellW: 164,
      cellH: 196,
      navY: -460,
      entryY: 250,
      entryW: 280,
      entryH: 340,
      sheetY: -140,
      sheetW: 640,
      sheetH: 220
    }
  };
}
function landscapeLayout() {
  const cx = 400;
  const cy = -175;
  const dx = 176;
  const dy = 62;
  const commandPos = (index) => commandCell(cx, cy, dx, dy, index);
  const cell0 = commandPos(0);
  return {
    kind: "landscape",
    view: { width: 1334, height: 750 },
    horizonY: 40,
    battle: {
      foe: { x: 80, y: 80, width: 150, height: 170 },
      player: { x: -80, y: 0, width: 160, height: 180 },
      commandsY: cy,
      commandsX: [commandPos(0).x, commandPos(1).x, commandPos(2).x],
      commandW: 164,
      commandH: 54,
      logY: -316,
      skip: { x: 600, y: 332 },
      help: { x: -620, y: 332 },
      quit: { x: -545, y: 332 },
      tools: [
        { x: cx - 180, y: cy + dy + 40 },
        { x: cx, y: cy + dy + 40 },
        { x: cx + 180, y: cy + dy + 40 }
      ],
      back: { x: cx, y: cy + dy },
      menuY0: -70,
      menuGap: 56,
      menuDx: 176
    },
    hud: {
      foePlate: { x: -480, y: 250, width: 280, height: 68 },
      playerPlate: { x: -480, y: -200, width: 280, height: 72 },
      partyTray: { x: -480, y: -252 },
      message: { y: -316, width: 1280, height: 84 },
      topBar: { y: 332, width: 1280, height: 44 },
      log: { x: 0, y: -316, width: 1240, height: 72 }
    },
    artSlip: { x: cell0.x, width: 164, height: 54, gap: 8 },
    artSlipPos: commandPos,
    commandPos,
    lobby: {
      splashY: 215,
      menu: { x: 0, y: -2, width: 980, height: 320 },
      itemDx: 196,
      itemY0: 76,
      itemGap: 68,
      buttonW: 176,
      buttonH: 48,
      tabW: 100,
      tabDx: 108,
      help: { x: 620, y: 332 },
      glossary: { x: 0, y: 8, width: 1180, height: 380 },
      glossaryBodyY: -94,
      glossaryItemY0: 120,
      glossaryGap: 48,
      glossaryItemDx: 220,
      glossaryCols: 5,
      glossaryBackY: -240,
      panel: { y: 8, width: 980, height: 340 },
      backY: -120,
      starterRelicY: 220,
      starterCandyY: 160,
      starterBackY: -220,
      starterCard: { y: -20, width: 186, height: 180 },
      slotDx: 160,
      slotW: 148,
      shopDx: 196,
      modeCols: 2
    },
    codex: {
      cols: 4,
      rows: 4,
      y0: 200,
      dx: 160,
      dy: 112,
      cellW: 148,
      cellH: 100,
      navY: -250,
      entryY: 140,
      entryW: 180,
      entryH: 160,
      sheetY: -40,
      sheetW: 980,
      sheetH: 120
    }
  };
}
var INK = {
  flame: { r: 196, g: 72, b: 48 },
  tide: { r: 48, g: 112, b: 168 },
  stone: { r: 140, g: 108, b: 72 },
  wood: { r: 56, g: 132, b: 72 },
  bolt: { r: 196, g: 164, b: 48 },
  frost: { r: 120, g: 176, b: 196 },
  shade: { r: 32, g: 28, b: 40 },
  light: { r: 212, g: 168, b: 96 }
};
var AFFINITY_CN = {
  flame: "\u708E",
  tide: "\u6F6E",
  stone: "\u5CA9",
  wood: "\u6728",
  bolt: "\u9706",
  frost: "\u971C",
  shade: "\u5F71",
  light: "\u5149"
};
function affinityInk(affinity) {
  return INK[affinity];
}
function formatHpText(hp, maxHp) {
  return `${hp}/${maxHp}`;
}
function formatTopBar(wave, realm, mark, gold) {
  const tail = gold === void 0 ? "" : `  \u91D1${gold}`;
  return `\u7B2C${wave}\u6CE2  ${realm}  ${mark}${tail}`;
}
function formatArtSlip(name, affinity, left, max) {
  return { title: name, meta: `${AFFINITY_CN[affinity]}  ${left}/${max}` };
}
function nameplateSlots(width, height) {
  const pad = Math.min(16, Math.max(10, width * 0.05));
  const affW = 32;
  const lvW = 52;
  const hpW = 84;
  const rowH = 32;
  const barH = 14;
  const gap = 8;
  const topY = height / 2 - 16;
  const aff = { x: -width / 2 + pad + affW / 2, y: topY, w: affW, h: rowH };
  const lv = { x: width / 2 - pad - lvW / 2, y: topY, w: lvW, h: rowH };
  const nameLeft = aff.x + affW / 2 + gap;
  const nameRight = lv.x - lvW / 2 - gap;
  const name = {
    x: (nameLeft + nameRight) / 2,
    y: topY,
    w: nameRight - nameLeft,
    h: rowH
  };
  const botY = -height / 2 + 18;
  const barW = width - pad * 2 - hpW - gap;
  const bar = { x: -width / 2 + pad + barW / 2, y: botY, w: barW, h: barH };
  const hp = { x: width / 2 - pad - hpW / 2, y: botY, w: hpW, h: rowH };
  return { aff, name, lv, bar, hp };
}
function cardCaptionSlots(height) {
  const titleH = 32;
  const hintH = 24;
  const pad = 12;
  const hint = { x: 0, y: -height / 2 + pad + hintH / 2, w: 0, h: hintH };
  const title = {
    x: 0,
    y: hint.y + hintH / 2 + 8 + titleH / 2,
    w: 0,
    h: titleH
  };
  return { title, hint };
}
function codexThumbCaption(cellH) {
  const h = 30;
  return { y: -cellH / 2 + 4 + h / 2, h };
}

// src/assets/manifest.ts
function bundleForRealm(realmId) {
  if (realmId === "wilds") {
    return "bundle-realm-wilds";
  }
  if (realmId === "woods") {
    return "bundle-realm-woods";
  }
  return "main";
}
var FIRST_PORTRAITS = /* @__PURE__ */ new Set([
  "zao_li",
  "dan_li",
  "jing_zhu",
  "quan_ji",
  "tao_geng",
  "nuo_mian",
  "mo_mao",
  "deng_e",
  "yao_shu"
]);
var SECOND_PORTRAITS = /* @__PURE__ */ new Set([
  "huo_de_li",
  "he_bo_cong",
  "she_mu",
  "luan_shi",
  "dian_zhu",
  "ye_ti",
  "tao_quan",
  "zhi_ren",
  "tong_ling"
]);
var THIRD_PORTRAITS = /* @__PURE__ */ new Set([
  "zhang_yan",
  "pi_li",
  "lei_ying",
  "shuang_ming",
  "bing_can",
  "jin_hui",
  "ping_yu",
  "he_hun",
  "ming_duo"
]);
var CARTOON_PORTRAIT_IDS = /* @__PURE__ */ new Set([
  "zao_li",
  "jing_zhu",
  "tao_geng",
  "dan_li",
  "quan_ji",
  "nuo_mian",
  "mo_mao",
  "deng_e",
  "yao_shu",
  "huo_de_li",
  "he_bo_cong",
  "she_mu",
  "luan_shi",
  "dian_zhu",
  "ye_ti",
  "tao_quan",
  "zhi_ren",
  "tong_ling",
  "zhang_yan",
  "pi_li",
  "lei_ying",
  "shuang_ming",
  "bing_can",
  "jin_hui",
  "ping_yu",
  "he_hun",
  "ming_duo"
]);
var PORTRAIT_IDS = /* @__PURE__ */ new Set([
  ...Array.from(FIRST_PORTRAITS),
  ...Array.from(SECOND_PORTRAITS),
  ...Array.from(THIRD_PORTRAITS)
]);
var PORTRAIT_BUNDLE = "portraits";
function hasPortrait(id) {
  return PORTRAIT_IDS.has(id);
}
function hasCartoonPortrait(id) {
  return CARTOON_PORTRAIT_IDS.has(id);
}
function portraitPath(id, style = "play") {
  if (style === "folk" && CARTOON_PORTRAIT_IDS.has(id)) {
    return `spirits-folk/${id}.png`;
  }
  return `spirits/${id}.png`;
}
function portraitTexturePath(id, style = "play") {
  if (style === "folk" && CARTOON_PORTRAIT_IDS.has(id)) {
    return `spirits-folk/${id}/texture`;
  }
  return `spirits/${id}/texture`;
}
function remoteManifest(baseUrl) {
  const tables = loadTables();
  return {
    version: "0.1.0",
    baseUrl,
    assets: tables.spirits.map((spirit) => ({
      id: spirit.id,
      path: portraitPath(spirit.id),
      bundle: bundleForRealm(spirit.realm)
    }))
  };
}

// src/ui/copy.ts
var STATUS_CN = {
  burn: "\u707C",
  poison: "\u6BD2",
  toxic: "\u5267\u6BD2",
  paralyze: "\u9EBB"
};
var STAT_CN = {
  atk: "\u653B",
  def: "\u5B88",
  spd: "\u8FC5"
};
function formatArtHint(effects, power) {
  const parts = effects.map((effect) => {
    if (effect.kind === "damage") {
      const hits = effect.hits && effect.hits > 1 ? `\xD7${effect.hits}` : "";
      return `\u4F24${power}${hits}`;
    }
    if (effect.kind === "heal") {
      return `\u6108${Math.round(effect.ratio * 100)}%`;
    }
    if (effect.kind === "drain") {
      return `\u6C72${Math.round(effect.ratio * 100)}%`;
    }
    if (effect.kind === "status") {
      return `\u53EF${STATUS_CN[effect.status] ?? effect.status}`;
    }
    if (effect.kind === "stage") {
      const arrow = effect.delta > 0 ? "\u2191" : "\u2193";
      const who = effect.on === "user" ? "\u5DF1" : "\u654C";
      return `${who}${STAT_CN[effect.stat] ?? effect.stat}${arrow}`;
    }
    if (effect.kind === "guard") {
      return "\u5B88";
    }
    return "\u62A4\u7B26";
  });
  return parts.join(" \xB7 ") || "\u672F";
}
function formatArtPlay(userName, art) {
  if (!art) {
    return `${userName} \u7AED\u529B\u4E00\u51FB\u3002\u65E0\u7075\u529B\u65F6\u7684\u6323\u624E\u3002`;
  }
  return `${userName} \u4F7F\u51FA ${art.name}\u3002${AFFINITY_CN[art.affinity]} \xB7 ${formatArtHint(art.effects, art.power)}`;
}
function formatSealResult(name, caught, chance) {
  const pct = Math.round(chance * 100);
  return caught ? `${name} \u6536\u5951\u6210\u529F\uFF08${pct}%\uFF09` : `${name} \u6323\u8131\u4E86\uFF08${pct}%\uFF09`;
}
function formatNextHint(kind) {
  if (kind === "arts") {
    return "\u70B9\u672F\u7B7E\u4F7F\u51FA\uFF0C\u6216\u70B9\u300C\u8FD4\u56DE\u300D\u3002";
  }
  if (kind === "switch") {
    return "\u70B9\u540D\u5B57\u6362\u4E0A\u573A\uFF0C\u6216\u70B9\u300C\u8FD4\u56DE\u300D\u3002";
  }
  if (kind === "bag") {
    return "\u70B9\u5C0F\u836F\u56DE\u8840\uFF0C\u6216\u70B9\u9547\u7269\u6536\u5951\uFF0C\u6216\u70B9\u300C\u8FD4\u56DE\u300D\u3002";
  }
  if (kind === "catch") {
    return "\u70B9\u300C\u9547\u7269\u300D\u6536\u5951\uFF0C\u6216\u70B9\u300C\u653E\u8FC7\u300D\u3002";
  }
  if (kind === "target") {
    return "\u70B9\u8981\u6253\u7684\u90A3\u53EA\u7CBE\u602A\u3002";
  }
  if (kind === "shop") {
    return "\u70B9\u673A\u7F18\u5E26\u8D70\uFF0C\u6216\u518D\u62E9\u3002";
  }
  if (kind === "map") {
    return "\u70B9\u4E0B\u4E00\u5883\u57DF\u3002";
  }
  if (kind === "omen") {
    return "\u70B9\u4E00\u4E2A\u9009\u9879\u3002";
  }
  return "\u70B9\u300C\u672F\u300D\u51FA\u7B2C\u4E00\u5F20\u3002\u672F\u7B7E\u9009\u522B\u7684\u672F\u3002";
}
function formatMiss(waitingFor) {
  if (waitingFor === "command") {
    return "\u70B9\u7A7A\u5904\u65E0\u4E8B\u3002\u8BF7\u70B9\u300C\u672F\u300D\u3002";
  }
  if (waitingFor === "switch") {
    return "\u70B9\u7A7A\u5904\u65E0\u4E8B\u3002\u8BF7\u70B9\u540D\u5B57\u6362\u4E0A\u573A\u3002";
  }
  if (waitingFor === "arts") {
    return "\u70B9\u7A7A\u5904\u65E0\u4E8B\u3002\u8BF7\u70B9\u672F\u7B7E\u3002";
  }
  return "\u70B9\u7A7A\u5904\u65E0\u4E8B\u3002\u8BF7\u70B9\u9AD8\u4EAE\u7684\u6307\u4EE4\u3002";
}
function formatSpentArt(name) {
  return `${name} \u7075\u529B\u5DF2\u5C3D\u3002\u6362\u4E00\u5F20\uFF0C\u6216\u70B9\u300C\u672F\u300D\u7AED\u529B\u4E00\u51FB\u3002`;
}
function formatBattleNudge(opts) {
  const chart = loadTables().typeChart;
  const best = (arts) => Math.max(0, ...arts.map((art) => affinityMod(art, opts.foeAffinities, chart)));
  const active = best(opts.activeArts);
  const bench = Math.max(0, ...opts.benchArts.map((arts) => best(arts)));
  const parts = [];
  if (active < 1 && bench > active) {
    parts.push("\u6362\u4EBA");
  }
  if (opts.hpRatio <= 0.4 && opts.potions > 0) {
    parts.push("\u56CA");
  }
  if (parts.length === 0) {
    return "";
  }
  return `\u53EF\u70B9\u300C${parts.join("\u300D\u6216\u300C")}\u300D\u3002`;
}
function formatBoonHint(kind, value) {
  if (kind === "atk") {
    return `\u672C\u5C40\u5168\u961F\u653B+${value}`;
  }
  if (kind === "def") {
    return `\u672C\u5C40\u5168\u961F\u5B88+${value}`;
  }
  if (kind === "spd") {
    return `\u672C\u5C40\u5168\u961F\u8FC5+${value}`;
  }
  if (kind === "hp") {
    return `\u672C\u5C40\u5168\u961F\u4F53+${value}`;
  }
  if (kind === "catch") {
    return `\u6536\u5951\u7387+${Math.round(value * 100)}%`;
  }
  if (kind === "gold") {
    return `\u7ACB\u523B\u5F97\u91D1${value}`;
  }
  if (kind === "exp") {
    return `\u7ECF\u9A8C+${Math.round(value * 100)}%`;
  }
  if (kind === "potion") {
    return `\u56CA\u4E2D\u5C0F\u836F+1`;
  }
  if (kind === "map") {
    return `\u6253\u5F00\u5C71\u6CB3\u56FE\uFF0C\u53EF\u62E9\u5883\u57DF`;
  }
  if (kind === "lure") {
    return `\u63D0\u9AD8\u53CC\u4EBA\u91CE\u9047`;
  }
  if (kind === "revive") {
    return `\u6551\u56DE\u6FD2\u6B7B\u961F\u53CB`;
  }
  if (kind === "sealPack") {
    return `\u51E1\u9547+${value}`;
  }
  if (kind === "evolve") {
    return `\u961F\u5185\u53EF\u8FDB\u5316\u5219\u8FDB\u5316`;
  }
  if (kind === "form") {
    return `\u6218\u6597\u4E2D\u53EF\u5F00\u5BF9\u5E94\u5F62\u6001`;
  }
  if (kind === "hiddenPact") {
    return `\u89E3\u9501\u9690\u5951`;
  }
  return "\u672C\u5C40\u673A\u7F18";
}
function formatBoonTaken(name, hint) {
  return `\u5E26\u8D70${name}\u3002${hint}`;
}
function formatRunHarvest(opts) {
  const parts = [`\u89C1 ${opts.seen}`, `\u6536 ${opts.caught}`];
  if (opts.candy > 0) {
    parts.push(`\u7075\u7CD6 ${opts.candy}`);
  }
  if (opts.unlocked) {
    parts.push("\u65B0\u89E3\u9501");
  }
  return parts.join("  ");
}
function formatRunSummary(opts) {
  const tables = loadTables();
  const names = opts.partyIds.map((id) => {
    try {
      return getSpirit(id).name;
    } catch {
      return id;
    }
  });
  const boons = opts.boonIds.map((id) => {
    const row = tables.boons.find((boon) => boon.id === id);
    if (!row) {
      return id;
    }
    return `${row.name}\uFF08${formatBoonHint(row.kind, row.value)}\uFF09`;
  });
  const boonText = boons.length > 0 ? boons.join("\uFF1B") : "\u5C1A\u65E0\u673A\u7F18";
  return `\u91D1 ${opts.gold}  \u5C0F\u836F ${opts.potions}  \u51E1\u9547 ${opts.seals[0] ?? 0}
\u961F\u4F0D ${names.join("\u3001")}
\u673A\u7F18 ${boonText}`;
}
var CODEX_PAGE_SIZE = 16;
function listCodexSpirits() {
  const all = loadTables().spirits;
  const withArt = all.filter((row) => PORTRAIT_IDS.has(row.id));
  const rest = all.filter((row) => !PORTRAIT_IDS.has(row.id));
  return [...withArt, ...rest];
}
function formatCodexSheet(id) {
  const tables = loadTables();
  const spirit = getSpirit(id);
  const pact = tables.pacts.find((row) => row.id === spirit.pactId);
  const realm = tables.realms.find((row) => row.id === spirit.realm);
  const aff = spirit.affinities.map((row) => AFFINITY_CN[row]).join("\xB7");
  const arts = spirit.artIds.map((artId) => tables.arts.find((row) => row.id === artId)?.name ?? artId);
  let evo = "";
  if (spirit.evolveTo) {
    try {
      evo = `\u53EF\u8715\u4E3A${getSpirit(spirit.evolveTo).name}\u3002`;
    } catch {
      evo = "";
    }
  }
  return {
    headline: `${spirit.name}  ${aff}  ${realm?.name ?? spirit.realm}`,
    stats: `\u4F53${spirit.baseHp}  \u653B${spirit.baseAtk}  \u5B88${spirit.baseDef}  \u8FC5${spirit.baseSpd}`,
    pact: `\u9B42\u5951\u300C${pact?.name ?? spirit.pactId}\u300D\uFF1A${pact?.description ?? ""}`,
    arts: `\u672F ${arts.join("\u3001")}`,
    evo
  };
}
function formatCodexEntry(id) {
  const sheet = formatCodexSheet(id);
  return [sheet.headline, sheet.stats, sheet.pact, sheet.arts, sheet.evo].filter((line) => line.length > 0).join("\n");
}
function formatCodexLog(id, art) {
  const entry = formatCodexEntry(id);
  if (!art || !PORTRAIT_IDS.has(id)) {
    return entry;
  }
  return `${entry}
\u7ACB\u7ED8\xB7${art === "cartoon" ? "\u5361\u901A" : "\u5E74\u753B"}`;
}
var GLOSSARY = [
  { term: "\u7CBE\u602A", body: "\u9699\u4E2D\u7684\u751F\u7075\u3002\u5BF9\u6218\u3001\u6536\u5951\u3001\u7F16\u961F\u7684\u5BF9\u8C61\u3002" },
  { term: "\u5951\u5F55", body: "\u7CBE\u602A\u540D\u518C\u3002\u5927\u5385\u53EF\u7FFB\u5168\u90E8\uFF0C\u70B9\u5F00\u770B\u6570\u503C\u4E0E\u9B42\u5951\uFF1B\u6709\u7ACB\u7ED8\u7684\u53EF\u5BF9\u7167\u5E74\u753B\u4E0E\u5361\u901A\uFF0C\u65E0\u7ACB\u7ED8\u7684\u53EA\u770B\u526A\u5F71\u3002" },
  { term: "\u7075\u6027", body: "\u708E\u6F6E\u5CA9\u6728\u9706\u971C\u5F71\u5149\u516B\u6027\u3002\u76F8\u514B\u4F1A\u6539\u53D8\u672F\u6CD5\u4F24\u5BB3\u3002" },
  { term: "\u672F\u6CD5", body: "\u6218\u6597\u4E2D\u5148\u70B9\u300C\u672F\u300D\uFF0C\u518D\u70B9\u672F\u7B7E\u4F7F\u51FA\u3002\u6BCF\u5F20\u6709\u7075\u529B\u6B21\u6570\u3002" },
  { term: "\u7075\u529B", body: "\u8FD9\u5C40\u8FD8\u80FD\u4F7F\u51FA\u8BE5\u672F\u6CD5\u7684\u6B21\u6570\uFF0C\u7528\u5B8C\u4F1A\u7AED\u529B\u4E00\u51FB\u3002" },
  { term: "\u9547\u7269", body: "\u6218\u540E\u6536\u5951\u7CBE\u602A\u7684\u5668\u5177\u3002\u6210\u5219\u5165\u5951\u5F55\u3002" },
  { term: "\u673A\u7F18", body: "\u574A\u5E02\u4E09\u9009\u4E00\u7684\u52A0\u6210\uFF0C\u53EA\u5728\u672C\u5C40\u957F\u5F81\u6709\u6548\u3002" },
  { term: "\u4F69\u9970", body: "\u7CBE\u602A\u643A\u5E26\u7684\u5C0F\u7269\uFF0C\u53EF\u5728\u6458\u8981\u91CC\u79FB\u4F69\u3002" },
  { term: "\u5883\u57DF", body: "\u5730\u56FE\u4E0A\u7684\u4E0B\u4E00\u7AD9\uFF0C\u51B3\u5B9A\u4F1A\u9047\u5230\u8C01\u3002" },
  { term: "\u5375\u623F", body: "\u5B75\u5375\u5904\u3002\u5B75\u5238\u5151\u5375\uFF0C\u6B65\u6570\u8D70\u5B8C\u6216\u8DF3\u8FC7\u540E\u53EF\u5F00\u3002" },
  { term: "\u5951\u5370", body: "\u5F00\u5C40\u4E09\u9009\u4E00\u7684\u672C\u5C40\u4FE1\u7269\uFF0C\u8D26\u53F7\u89E3\u9501\u540E\u624D\u4F1A\u51FA\u73B0\u3002" },
  { term: "\u77ED\u5F81", body: "\u4E8C\u5341\u6CE2\u77ED\u9014\u3002\u5FC5\u987B\u5E26\u4E00\u679A\u5951\u5370\uFF0C\u6253\u5B8C\u7B2C\u4E8C\u5341\u6CE2\u5373\u7ED3\u675F\u3002" },
  { term: "\u9B42\u5951", body: "\u7CBE\u602A\u81EA\u5E26\u7684\u7279\u6027\uFF0C\u5F71\u54CD\u8F93\u51FA\u6216\u627F\u4F24\u3002" },
  { term: "\u56CA", body: "\u6218\u6597\u4E2D\u559D\u4E39\u836F\u7ED9\u5F53\u524D\u7CBE\u602A\u56DE\u8840\u3002" },
  { term: "\u8D70", body: "\u4ECE\u91CE\u9047\u9003\u79BB\u3002\u884C\u8005\u6218\u4E0D\u80FD\u8D70\u3002" },
  { term: "\u961F\u4F0D", body: "\u6362\u4E00\u53EA\u672A\u5012\u4E0B\u7684\u7CBE\u602A\u4E0A\u573A\u3002" }
];

// src/sim/observe.ts
function artsOf(unit) {
  return unit.artIds.map((id) => {
    const art = getArt(id);
    return {
      id,
      name: art.name,
      affinity: art.affinity,
      power: art.power,
      focus: unit.focusLeft[id] ?? 0
    };
  });
}
function observeBattle(slice, battle) {
  const shop = slice.shop;
  return {
    phase: battle?.waitingFor === "switch" ? "switch" : battle?.waitingFor === "target" ? "target" : slice.phase,
    wave: slice.run.wave,
    gold: slice.run.gold,
    potions: battle?.potions ?? slice.run.potions,
    seals: battle?.seals ?? slice.run.seals,
    waitingFor: battle?.waitingFor ?? null,
    party: (battle?.party ?? []).map((unit) => ({
      id: unit.id,
      instanceId: unit.instanceId,
      name: unit.name,
      hp: unit.hp,
      maxHp: unit.maxHp,
      affinities: unit.affinities,
      arts: artsOf(unit),
      fainted: isFainted(unit)
    })),
    foes: (battle?.foes ?? []).filter((unit) => !isFainted(unit)).map((unit) => ({
      id: unit.id,
      instanceId: unit.instanceId,
      name: unit.name,
      hp: unit.hp,
      maxHp: unit.maxHp,
      affinities: unit.affinities
    })),
    offers: (slice.boonChoices ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      kind: row.kind,
      hint: formatBoonHint(row.kind, row.value)
    })),
    rerollCost: shop ? rerollCost(shop.wave, shop.rerolls, shop.lock ? shop.offers.map((row) => row.tier) : void 0) : 0,
    catchable: Boolean(slice.encounter?.catchable && battle?.kind === "wild"),
    kind: battle?.kind ?? (slice.encounter && slice.encounter.kind !== "wild" ? "trainer" : "wild"),
    activeIndex: battle?.activeIndex ?? 0,
    realmChoices: slice.realmChoices
  };
}

// src/sim/policies.ts
var BOON_SCORE = {
  atk: 5,
  hp: 4,
  potion: 4,
  def: 3,
  spd: 3,
  exp: 6,
  map: 5,
  catch: 3,
  gold: 2,
  lure: 1
};
function bestArt(obs, partyIndex, foeIndex = 0) {
  const unit = obs.party[partyIndex];
  const foe = obs.foes[foeIndex] ?? obs.foes[0];
  const fallback = unit?.arts[0]?.id;
  if (!unit || !fallback) {
    return "cinder_claw";
  }
  const chart = loadTables().typeChart;
  let best = fallback;
  let score = -Infinity;
  for (const art of unit.arts) {
    if (art.focus <= 0) {
      continue;
    }
    const mul = foe ? affinityMod(art.affinity, foe.affinities, chart) : 1;
    const value = art.power * mul;
    if (value > score) {
      score = value;
      best = art.id;
    }
  }
  return best;
}
function firstLivingBench(obs) {
  return obs.party.findIndex((row, index) => index !== obs.activeIndex && !row.fainted);
}
function pickBoon(obs, preferExp) {
  const ranked = [...obs.offers].sort((a, b) => {
    const extra = (kind) => preferExp && (kind === "exp" || kind === "map") ? 4 : 0;
    return (BOON_SCORE[b.kind] ?? 0) + extra(b.kind) - ((BOON_SCORE[a.kind] ?? 0) + extra(a.kind));
  });
  return ranked[0]?.id ?? obs.offers[0]?.id ?? "";
}
function low(obs) {
  if (obs.phase === "catch") {
    return { type: "catch", attempt: false };
  }
  if (obs.phase === "boon") {
    return { type: "boon", id: obs.offers[0]?.id ?? "" };
  }
  if (obs.phase === "map") {
    return { type: "map", realmId: obs.realmChoices[0] ?? "" };
  }
  if (obs.phase === "omen") {
    return { type: "omen", optionIndex: 0 };
  }
  if (obs.waitingFor === "switch") {
    const bench = firstLivingBench(obs);
    if (bench < 0) {
      return { type: "battle", command: { type: "art", artId: obs.party[obs.activeIndex]?.arts[0]?.id ?? "cinder_claw" } };
    }
    return { type: "battle", command: { type: "switch", partyIndex: bench } };
  }
  if (obs.waitingFor === "target") {
    return { type: "battle", command: { type: "target", targetId: obs.foes[0]?.instanceId ?? "" } };
  }
  const artId = obs.party[obs.activeIndex]?.arts[0]?.id;
  return { type: "battle", command: { type: "art", artId: artId ?? "cinder_claw" } };
}
function mid(obs, high) {
  if (obs.phase === "catch") {
    const common = obs.seals[0] > 0 || obs.seals[1] > 0;
    return { type: "catch", attempt: common };
  }
  if (obs.phase === "boon") {
    if (high && obs.gold >= obs.rerollCost && obs.rerollCost > 0) {
      const best = Math.max(...obs.offers.map((row) => BOON_SCORE[row.kind] ?? 0));
      if (best < 4) {
        return { type: "boon", id: obs.offers[0]?.id ?? "", reroll: true };
      }
    }
    return { type: "boon", id: pickBoon(obs, high) };
  }
  if (obs.phase === "map") {
    return { type: "map", realmId: obs.realmChoices[0] ?? "" };
  }
  if (obs.phase === "omen") {
    return { type: "omen", optionIndex: 0 };
  }
  const active = obs.party[obs.activeIndex];
  const foe = obs.foes[0];
  if (obs.waitingFor === "switch") {
    const bench2 = firstLivingBench(obs);
    if (bench2 < 0) {
      return { type: "battle", command: { type: "art", artId: active?.arts[0]?.id ?? "cinder_claw" } };
    }
    return { type: "battle", command: { type: "switch", partyIndex: bench2 } };
  }
  if (obs.waitingFor === "target") {
    const weakest = [...obs.foes].sort((a, b) => a.hp - b.hp)[0];
    return { type: "battle", command: { type: "target", targetId: weakest?.instanceId ?? foe?.instanceId ?? "" } };
  }
  if (active && active.hp / Math.max(1, active.maxHp) <= 0.4 && obs.potions > 0) {
    return { type: "battle", command: { type: "bag" } };
  }
  if (high && obs.kind === "wild" && obs.catchable && foe && foe.hp / Math.max(1, foe.maxHp) <= 0.35 && obs.seals[0] > 0) {
    return { type: "battle", command: { type: "seal", tier: 0 } };
  }
  const bench = firstLivingBench(obs);
  if (bench >= 0 && foe && active) {
    const chart = loadTables().typeChart;
    const mine = Math.max(...active.arts.map((art) => affinityMod(art.affinity, foe.affinities, chart)));
    const theirs = Math.max(
      ...obs.party[bench].arts.map((art) => affinityMod(art.affinity, foe.affinities, chart))
    );
    if (theirs > mine && mine < 1) {
      return { type: "battle", command: { type: "switch", partyIndex: bench } };
    }
  }
  const artId = bestArt(obs, obs.activeIndex);
  if (obs.foes.length > 1) {
    const weakest = [...obs.foes].sort((a, b) => a.hp - b.hp)[0];
    return {
      type: "battle",
      command: { type: "art", artId, targetId: weakest?.instanceId }
    };
  }
  return { type: "battle", command: { type: "art", artId } };
}
function decide(obs, tier) {
  if (tier === "low") {
    return low(obs);
  }
  if (tier === "guide") {
    return guide(obs);
  }
  return mid(obs, tier === "high");
}
function guide(obs) {
  if (obs.phase === "catch") {
    return { type: "catch", attempt: false };
  }
  if (obs.phase === "boon") {
    return { type: "boon", id: obs.offers[0]?.id ?? "" };
  }
  if (obs.phase === "map") {
    return { type: "map", realmId: obs.realmChoices[0] ?? "" };
  }
  if (obs.phase === "omen") {
    return { type: "omen", optionIndex: 0 };
  }
  if (obs.waitingFor === "switch") {
    const bench = firstLivingBench(obs);
    if (bench < 0) {
      return { type: "battle", command: { type: "art", artId: obs.party[obs.activeIndex]?.arts[0]?.id ?? "cinder_claw" } };
    }
    return { type: "battle", command: { type: "switch", partyIndex: bench } };
  }
  if (obs.waitingFor === "target") {
    return { type: "battle", command: { type: "target", targetId: obs.foes[0]?.instanceId ?? "" } };
  }
  const active = obs.party[obs.activeIndex];
  if (active && active.hp / Math.max(1, active.maxHp) <= 0.5 && obs.potions > 0) {
    return { type: "battle", command: { type: "bag" } };
  }
  const artId = active?.arts[0]?.id;
  return { type: "battle", command: { type: "art", artId: artId ?? "cinder_claw" } };
}

// src/sim/run-sim.ts
function openBattle(slice) {
  const encounter = slice.encounter ?? slice.beginWave();
  if (!slice.run.seals || slice.run.seals.length < 5) {
    slice.run.seals = [5, 0, 0, 0, 0];
  }
  const level = foeEncounterLevel(slice.run.wave);
  const battle = startPartyBattle({
    partyIds: slice.run.partyIds,
    foeId: encounter.foeId,
    foeIds: encounter.kind === "rival" ? [encounter.foeId] : encounter.foeIds,
    level,
    partyLevel: Math.min(levelCap(slice.run.wave), (slice.run.partyLevels[0] ?? encounterLevel(slice.run.wave)) + slice.run.luck),
    partyLevels: slice.run.partyLevels.map((value) => Math.min(levelCap(slice.run.wave), value + slice.run.luck)),
    hpRatios: slice.run.partyHpRatios,
    seed: `${slice.run.seed}-w${slice.run.wave}`,
    kind: partyBattleKind(encounter.kind),
    potions: slice.run.potions,
    seals: slice.run.seals,
    catchable: encounter.catchable,
    catchBoon: catchModifier(slice.run),
    statBonus: sumRunStats(slice.run),
    shields: encounter.shields,
    legend: encounter.kind === "legend",
    affinityClamp: earlyAffinityClamp(slice.run.wave),
    formKeys: formKeysFrom(slice.run),
    hiddenPact: hiddenPactOn({ boonIds: slice.run.boonIds }),
    secondPact: slice.account.secondPact,
    artMul: (user, affinity) => artPowerMul(slice.run, user, affinity)
  });
  if (encounter.sanctify) {
    enterForm(battle.foe, "sanctify");
  }
  return battle;
}
function syncBag(slice, battle) {
  slice.run.potions = battle.potions;
  slice.run.seals = [...battle.seals];
}
function applyBattleEnd(slice, battle) {
  syncBag(slice, battle);
  commitParty(
    slice.run,
    battle.party.map((unit) => ({ hp: unit.hp, maxHp: unit.maxHp })),
    battle.result === "win"
  );
  if (battle.result === "win") {
    if (battle.caught) {
      slice.resolveCatch(true);
    } else {
      slice.noteWin();
    }
    return;
  }
  if (battle.result === "fled") {
    slice.skipCatch();
    return;
  }
  slice.noteLoss();
}
function finish(opts, slice, reason, maxWaves) {
  return {
    seed: opts.seed,
    tier: opts.tier,
    wave: reason === "cap" ? maxWaves : slice.run.wave,
    gold: slice.run.gold,
    caught: Math.max(0, slice.run.caughtIds.length - 1),
    reason
  };
}
function runSim(opts) {
  const maxWaves = opts.maxWaves ?? 200;
  const maxActions = opts.maxActions ?? 4e3;
  const slice = new ClassicSlice({
    seed: opts.seed,
    starterId: opts.starterId ?? "zao_li",
    relicId: opts.tier === "guide" ? starterRelicIds()[0] : void 0
  });
  slice.beginWave();
  let battle = openBattle(slice);
  let actions = 0;
  let lastKey = "";
  let stall = 0;
  while (actions < maxActions) {
    if (slice.phase === "victory") {
      return finish(opts, slice, "victory", maxWaves);
    }
    if (slice.phase === "defeat") {
      return finish(opts, slice, "defeat", maxWaves);
    }
    if (slice.phase === "battle" && !battle) {
      if (slice.run.wave > maxWaves) {
        return finish(opts, slice, "cap", maxWaves);
      }
      slice.beginWave();
      battle = openBattle(slice);
    }
    const obs = observeBattle(slice, battle);
    const key = `${slice.phase}|${slice.run.wave}|${battle?.waitingFor}|${obs.party.map((row) => row.hp).join(",")}|${obs.foes.map((row) => row.hp).join(",")}|${obs.offers.map((row) => row.id).join(",")}`;
    if (key === lastKey) {
      stall += 1;
      if (stall > 8) {
        return finish(opts, slice, "stall", maxWaves);
      }
    } else {
      stall = 0;
      lastKey = key;
    }
    const action = decide(obs, opts.tier);
    actions += 1;
    try {
      if (action.type === "battle" && battle) {
        battle.choose(action.command);
        if (battle.result) {
          applyBattleEnd(slice, battle);
          battle = null;
        }
      } else if (action.type === "catch") {
        if (action.attempt) {
          slice.attemptCatch(0);
        } else {
          slice.skipCatch();
        }
      } else if (action.type === "boon") {
        if (action.reroll) {
          slice.rerollShop();
        } else if (action.id) {
          slice.takeBoon(action.id);
          battle = null;
        } else {
          return finish(opts, slice, "stall", maxWaves);
        }
      } else if (action.type === "map" && action.realmId) {
        slice.pickRealm(action.realmId);
        battle = null;
      } else if (action.type === "omen") {
        slice.pickOmen(action.optionIndex);
      }
    } catch {
      if (battle?.waitingFor === "command") {
        const artId = obs.party[obs.activeIndex]?.arts[0]?.id;
        if (artId) {
          battle.choose({ type: "art", artId });
          if (battle.result) {
            applyBattleEnd(slice, battle);
            battle = null;
          }
        }
      } else if (slice.phase === "boon" && slice.boonChoices[0]) {
        slice.takeBoon(slice.boonChoices[0].id);
        battle = null;
      } else if (slice.phase === "catch") {
        slice.skipCatch();
      } else {
        return finish(opts, slice, "stall", maxWaves);
      }
    }
  }
  return finish(opts, slice, "stall", maxWaves);
}

// src/ui/preview-app.ts
var MACHINE_BUTTONS = [
  { kind: "lineage", label: "\u79CD\u65CF\u673A" },
  { kind: "eggArt", label: "\u5375\u672F\u673A" },
  { kind: "form", label: "\u5F02\u76F8\u673A" }
];
var FORM_BAG = [
  { form: "sanctify", label: "\u663E\u5723" },
  { form: "colossus", label: "\u5DE8\u7075" },
  { form: "apex", label: "\u7075\u6781" }
];
var MODE_NAME = {
  classic: "\u7ECF\u5178",
  daily: "\u4ECA\u65E5\u8BD5\u70BC",
  endless: "\u65E0\u5C3D\u957F\u591C",
  spliced: "\u957F\u591C\xB7\u5408\u4F53",
  challenge: "\u82DB\u4EE4"
};
var TAB_NAME = {
  general: "\u901A\u7528",
  display: "\u663E\u793A",
  audio: "\u97F3\u9891",
  play: "\u73A9\u6CD5",
  controls: "\u89E6\u63A7"
};
var PreviewApp = class {
  screen = "title";
  title = "\u5951\u7075\u5FD7\u602A";
  log = "\u70B9\u300C\u540D\u8BCD\u300D\u770B\u4E13\u6709\u8BCD\u3002\u62E9\u4E00\u5951\u7075\uFF0C\u5165\u4E16\u5386\u52AB\u3002";
  mode = "classic";
  sprint = false;
  relicId = "";
  settingsTab = SETTINGS_TABS[0];
  slot = 0;
  account;
  slice = null;
  battle = null;
  codexPage = 0;
  codexId = null;
  codexArt = "cartoon";
  glossaryBack = "title";
  seed;
  constructor(opts) {
    this.seed = opts?.seed ?? "preview";
    this.account = opts?.account ?? emptyAccount();
  }
  tap(label) {
    const hit = this.controls().find((row) => row.label === label);
    if (!hit) {
      throw new Error(`no control ${label} on ${this.screen}`);
    }
    hit.run();
  }
  labels() {
    return this.controls().map((row) => row.label);
  }
  setScreen(screen, title, log) {
    this.screen = screen;
    this.title = title;
    this.log = log;
  }
  controls() {
    if (this.screen === "title") {
      return [
        { label: "\u65B0\u7684\u65C5\u9014", run: () => this.setScreen("mode", "\u9009\u6A21\u5F0F", "\u70B9\u6A21\u5F0F\u5F00\u5C40\u3002") },
        { label: "\u8BBE\u7F6E", run: () => this.openSettings() },
        { label: "\u5951\u5F55", run: () => this.openCodex() },
        { label: "\u5375\u623F", run: () => this.openEggs() },
        { label: "\u6210\u5C31", run: () => this.setScreen("achievements", "\u6210\u5C31", this.account.achievements[0] ?? "\u5C1A\u65E0\u6210\u5C31\u3002") },
        { label: "\u7EDF\u8BA1", run: () => this.setScreen("stats", "\u7EDF\u8BA1", statsLog(this.account)) },
        { label: "\u5B58\u6863", run: () => this.openSlots() },
        { label: "\u540D\u8BCD", run: () => this.openGlossary("title") }
      ];
    }
    if (this.screen === "mode") {
      return [
        { label: "\u77ED\u5F81", run: () => this.openStarter("classic", true) },
        ...["classic", "daily", "endless", "spliced", "challenge"].map((mode) => ({
          label: MODE_NAME[mode],
          run: () => this.openStarter(mode, false)
        })),
        { label: "\u8FD4\u56DE", run: () => this.openTitle() }
      ];
    }
    if (this.screen === "starter") {
      const offers = offerRelics(this.account, `${this.seed}-relic`);
      return [
        ...offers.map((row) => ({
          label: `${row.name}${row.id === this.relicId ? "\xB7\u9009" : ""}`,
          run: () => {
            this.relicId = row.id;
            this.log = `\u5DF2\u9009 ${row.name}`;
          }
        })),
        { label: "\u7075\u7CD6\xB7\u964D\u8D39", run: () => this.spendStarterCandy("cost") },
        { label: "\u7075\u7CD6\xB7\u9B42\u5951", run: () => this.spendStarterCandy("pact") },
        { label: "\u7075\u7CD6\xB7\u4E13\u5375", run: () => this.spendStarterCandy("egg") },
        ...["zao_li", "jing_zhu", "tao_geng"].map((id) => ({
          label: getSpirit(id).name,
          run: () => this.startRun(id)
        })),
        { label: "\u8FD4\u56DE", run: () => this.setScreen("mode", "\u9009\u6A21\u5F0F", "\u70B9\u6A21\u5F0F\u5F00\u5C40\u3002") }
      ];
    }
    if (this.screen === "settings") {
      const settings = this.account.settings;
      const rows = SETTINGS_TABS.map((tab) => ({
        label: TAB_NAME[tab],
        run: () => {
          this.settingsTab = tab;
          this.openSettings();
        }
      }));
      if (this.settingsTab === "general") {
        rows.push({
          label: settings.general.skipSeenDialog ? "\u8DF3\u8FC7\u5DF2\u89C1\xB7\u5F00" : "\u8DF3\u8FC7\u5DF2\u89C1\xB7\u5173",
          run: () => {
            settings.general.skipSeenDialog = !settings.general.skipSeenDialog;
            this.openSettings();
          }
        });
      }
      if (this.settingsTab === "display") {
        rows.push({
          label: settings.display.showGold ? "\u91D1\u94B1\xB7\u5F00" : "\u91D1\u94B1\xB7\u5173",
          run: () => {
            settings.display.showGold = !settings.display.showGold;
            this.openSettings();
          }
        });
        rows.push({
          label: settings.display.showDamage ? "\u4F24\u5BB3\u6570\u5B57\xB7\u5F00" : "\u4F24\u5BB3\u6570\u5B57\xB7\u5173",
          run: () => {
            settings.display.showDamage = !settings.display.showDamage;
            this.openSettings();
          }
        });
      }
      if (this.settingsTab === "play") {
        rows.push({
          label: `\u500D\u901F ${settings.play.battleSpeed}`,
          run: () => {
            settings.play.battleSpeed = settings.play.battleSpeed % 3 + 1;
            this.openSettings();
          }
        });
      }
      if (this.settingsTab === "controls") {
        rows.push({
          label: settings.controls.layout === "touch" ? "\u5E03\u5C40\xB7\u89E6\u63A7" : "\u5E03\u5C40\xB7\u952E\u4F4D",
          run: () => {
            settings.controls.layout = settings.controls.layout === "touch" ? "keys" : "touch";
            this.openSettings();
          }
        });
      }
      rows.push({ label: "\u8FD4\u56DE", run: () => this.openTitle() });
      return rows;
    }
    if (this.screen === "codex") {
      return this.codexControls();
    }
    if (this.screen === "eggs") {
      return [
        {
          label: "\u5151\u5B75\u5238",
          run: () => {
            const tier = ["fan", "shang", "te", "jin"].find((id) => (this.account.vouchers[id] ?? 0) > 0);
            if (!tier) {
              this.log = "\u65E0\u5B75\u5238";
              return;
            }
            redeemVoucher(this.account, tier, `${this.seed}-egg`);
            this.openEggs();
          }
        },
        ...MACHINE_BUTTONS.map((row) => ({
          label: row.label,
          run: () => this.useMachine(row.kind)
        })),
        {
          label: "\u8DF3\u8FC7\u5E76\u5F00",
          run: () => {
            skipEggSteps(this.account);
            const first = hatchReady(this.account)[0];
            if (!first) {
              this.log = "\u6CA1\u6709\u53EF\u5F00\u7684\u5375";
              this.openEggs();
              return;
            }
            const name = getSpirit(hatchEgg(this.account, first.id)).name;
            this.setScreen("hatch", "\u5F00\u5375", `\u5F00\u5375 ${name}`);
          }
        },
        { label: "\u8FD4\u56DE", run: () => this.openTitle() }
      ];
    }
    if (this.screen === "achievements" || this.screen === "stats") {
      return [{ label: "\u8FD4\u56DE", run: () => this.openTitle() }];
    }
    if (this.screen === "slots") {
      return [
        ...[0, 1, 2, 3, 4].map((slot) => ({
          label: `\u69FD${slot + 1}`,
          run: () => {
            this.slot = slot;
            this.log = `\u8BFB\u69FD ${slot + 1}`;
            this.openSlots();
          }
        })),
        { label: "\u8FD4\u56DE", run: () => this.openTitle() }
      ];
    }
    if (this.screen === "glossary") {
      return [
        ...GLOSSARY.map((row) => ({
          label: row.term,
          run: () => {
            this.log = `${row.term}\uFF1A${row.body}`;
          }
        })),
        { label: "\u8FD4\u56DE", run: () => this.restoreGlossaryBack() }
      ];
    }
    if (this.screen === "hatch") {
      return [{ label: "\u8FD4\u56DE", run: () => this.openEggs() }];
    }
    if (this.screen === "arts") {
      const battle = this.battle;
      if (!battle) {
        return [];
      }
      return [
        ...battle.active.artIds.map((artId) => ({
          label: getArt(artId).name,
          run: () => this.playArt(artId, true)
        })),
        { label: "\u8FD4\u56DE", run: () => this.showBattle(formatNextHint("command")) },
        this.missControl()
      ];
    }
    if (this.screen === "switch") {
      const battle = this.battle;
      if (!battle) {
        return [];
      }
      return [
        ...battle.party.flatMap(
          (spirit, index) => index === battle.activeIndex || spirit.hp <= 0 ? [] : [{ label: spirit.name, run: () => this.chooseSwitch(index) }]
        ),
        { label: "\u8FD4\u56DE", run: () => this.showBattle(formatNextHint("command")) },
        this.missControl()
      ];
    }
    if (this.screen === "bag") {
      const battle = this.battle;
      if (!battle) {
        return [];
      }
      return [
        { label: `\u5C0F\u836F ${battle.potions}`, run: () => this.usePotion() },
        ...FORM_BAG.filter((row) => battle.formKeys.includes(row.form)).map((row) => ({
          label: row.label,
          run: () => this.useForm(row.form)
        })),
        ...SEAL_TIERS.map((tier, index) => ({
          label: `${tier.name} ${battle.seals[index] ?? 0}`,
          run: () => this.useSeal(index)
        })),
        { label: "\u8FD4\u56DE", run: () => this.showBattle(formatNextHint("command")) },
        this.missControl()
      ];
    }
    if (this.screen === "catch") {
      return [
        { label: "\u9547\u7269", run: () => this.throwSeal() },
        { label: "\u653E\u8FC7", run: () => this.skipCatch() },
        this.leaveRunControl(),
        this.missControl()
      ];
    }
    if (this.screen === "shop") {
      const slice = this.slice;
      if (!slice) {
        return [];
      }
      return [
        ...slice.boonChoices.map((boon) => ({
          label: boon.name,
          run: () => this.takeBoon(boon.id)
        })),
        {
          label: "\u518D\u62E9",
          run: () => {
            try {
              slice.rerollShop();
              this.showSlicePhase();
            } catch {
              this.log = "\u91D1\u4E0D\u591F\u518D\u62E9";
            }
          }
        },
        {
          label: "\u5C0F\u836F",
          run: () => {
            try {
              slice.buyStock("small_draught");
              this.log = `\u4E70\u4E0B\u5C0F\u836F  \u91D1 ${slice.run.gold}`;
              this.showSlicePhase();
            } catch {
              this.log = "\u4E70\u4E0D\u8D77\u6216\u65E0\u8D27";
            }
          }
        },
        { label: "\u6458\u8981", run: () => this.openSummary() },
        {
          label: "\u5947\u9047",
          run: () => {
            slice.openOmen("release_carp");
            this.showSlicePhase();
          }
        },
        ...slice.run.partyIds.length >= 2 ? [
          {
            label: "\u5408\u4F53",
            run: () => {
              try {
                const fused = slice.fuseParty(0, 1);
                this.log = `\u5408\u4F53 ${getSpirit(fused.primaryId).name}`;
                this.showSlicePhase();
              } catch {
                this.log = "\u65E0\u6CD5\u5408\u4F53";
              }
            }
          }
        ] : [],
        this.leaveRunControl(),
        this.missControl()
      ];
    }
    if (this.screen === "map") {
      const slice = this.slice;
      if (!slice) {
        return [];
      }
      return [
        ...slice.realmChoices.map((realmId) => ({
          label: loadTables().realms.find((row) => row.id === realmId)?.name ?? realmId,
          run: () => {
            slice.pickRealm(realmId);
            slice.beginWave();
            this.battle = openBattle(slice);
            this.showSlicePhase();
          }
        })),
        this.leaveRunControl(),
        this.missControl()
      ];
    }
    if (this.screen === "omen") {
      const slice = this.slice;
      if (!slice?.omen) {
        return [];
      }
      return [
        ...slice.omen.options.map((option, index) => ({
          label: option.label,
          run: () => {
            slice.pickOmen(index);
            this.showSlicePhase();
          }
        })),
        this.leaveRunControl(),
        this.missControl()
      ];
    }
    if (this.screen === "summary") {
      return [
        { label: "\u8FD4\u56DE", run: () => this.showSlicePhase() },
        this.leaveRunControl()
      ];
    }
    if (this.screen === "target") {
      const battle = this.battle;
      if (!battle) {
        return [];
      }
      return [
        ...battle.foes.filter((foe) => foe.hp > 0).map((foe) => ({
          label: foe.name,
          run: () => {
            battle.choose({ type: "target", targetId: foe.instanceId });
            this.showSlicePhase();
          }
        })),
        this.missControl()
      ];
    }
    if (this.screen === "defeat" || this.screen === "victory") {
      return [{ label: "\u518D\u6765\u4E00\u5C40", run: () => this.openTitle() }];
    }
    if (this.screen === "battle") {
      const wave = this.slice?.run.wave ?? 1;
      return [
        { label: "\u672F", run: () => this.playArt(this.battle?.active.artIds[0] ?? "", false) },
        { label: "\u961F\u4F0D", run: () => this.setScreen("switch", this.title, formatNextHint("switch")) },
        { label: "\u56CA", run: () => this.setScreen("bag", this.title, formatNextHint("bag")) },
        { label: "\u8D70", run: () => this.tryRun() },
        { label: "\u672F\u7B7E", run: () => this.setScreen("arts", this.title, formatNextHint("arts")) },
        ...wave > 10 ? [{ label: "\u8DF310\u6CE2", run: () => this.skipTo((this.slice?.run.wave ?? 1) + 10) }] : [],
        this.leaveRunControl(),
        this.missControl()
      ];
    }
    return [];
  }
  leaveRunControl() {
    return { label: "\u56DE\u5385", run: () => this.leaveRun() };
  }
  missControl() {
    return {
      label: "\u7A7A\u5730",
      run: () => {
        const waiting = this.screen === "battle" ? "command" : this.screen === "switch" ? "switch" : this.screen === "arts" ? "arts" : void 0;
        this.log = formatMiss(waiting);
      }
    };
  }
  battleNudge() {
    const battle = this.battle;
    if (!battle) {
      return "";
    }
    return formatBattleNudge({
      foeAffinities: battle.foe.affinities,
      activeArts: battle.active.artIds.map((id) => getArt(id).affinity),
      benchArts: battle.party.filter((_, index) => index !== battle.activeIndex).filter((spirit) => spirit.hp > 0).map((spirit) => spirit.artIds.map((id) => getArt(id).affinity)),
      hpRatio: battle.active.maxHp > 0 ? battle.active.hp / battle.active.maxHp : 0,
      potions: battle.potions
    });
  }
  leaveRun() {
    this.slice = null;
    this.battle = null;
    this.openTitle();
  }
  openTitle() {
    this.slice = null;
    this.battle = null;
    this.setScreen("title", "\u5951\u7075\u5FD7\u602A", "\u70B9\u300C\u540D\u8BCD\u300D\u770B\u4E13\u6709\u8BCD\u3002\u62E9\u4E00\u5951\u7075\uFF0C\u5165\u4E16\u5386\u52AB\u3002");
  }
  openSettings() {
    this.setScreen("settings", "\u8BBE\u7F6E", `\u8BBE\u7F6E \xB7 ${TAB_NAME[this.settingsTab]}`);
  }
  openCodex() {
    this.codexId = null;
    this.setScreen("codex", "\u5951\u5F55", "\u70B9\u7CBE\u602A\u770B\u6570\u503C\u3001\u9B42\u5951\u4E0E\u7ACB\u7ED8\u3002\u65E0\u7ACB\u7ED8\u7684\u53EA\u770B\u526A\u5F71\u3002");
  }
  showCodexEntry(id) {
    this.codexId = id;
    this.codexArt = hasCartoonPortrait(id) ? "cartoon" : "folk";
    this.screen = "codex";
    this.title = getSpirit(id).name;
    this.log = formatCodexLog(id);
  }
  setCodexArt(style) {
    this.codexArt = style;
    this.log = formatCodexLog(this.codexId ?? "", style);
  }
  codexControls() {
    if (this.codexId) {
      const rows2 = [];
      if (hasCartoonPortrait(this.codexId)) {
        rows2.push({ label: "\u5361\u901A", run: () => this.setCodexArt("cartoon") });
      }
      if (hasPortrait(this.codexId)) {
        rows2.push({ label: "\u5E74\u753B", run: () => this.setCodexArt("folk") });
      }
      rows2.push({ label: "\u8FD4\u56DE", run: () => this.openCodex() });
      return rows2;
    }
    const all = listCodexSpirits();
    const start = this.codexPage * CODEX_PAGE_SIZE;
    const page = all.slice(start, start + CODEX_PAGE_SIZE);
    const rows = page.map((row) => ({
      label: row.name,
      run: () => this.showCodexEntry(row.id)
    }));
    if (this.codexPage > 0) {
      rows.push({
        label: "\u4E0A\u4E00\u9875",
        run: () => {
          this.codexPage -= 1;
          this.openCodex();
        }
      });
    }
    if (start + CODEX_PAGE_SIZE < all.length) {
      rows.push({
        label: "\u4E0B\u4E00\u9875",
        run: () => {
          this.codexPage += 1;
          this.openCodex();
        }
      });
    }
    rows.push({ label: "\u8FD4\u56DE", run: () => this.openTitle() });
    return rows;
  }
  openEggs() {
    this.setScreen(
      "eggs",
      "\u5375\u623F",
      `\u5B75\u5375\u5904\u3002\u5375 ${this.account.eggs.length}  \u51E1\u5238 ${this.account.vouchers.fan}`
    );
  }
  useMachine(kind) {
    try {
      const egg = useEggMachine(this.account, kind, `${this.seed}-${kind}`, utcDateStamp());
      this.openEggs();
      this.log = `\u4E09\u673A\u5F97\u5375 ${getSpirit(egg.spiritId).name}`;
    } catch {
      this.log = "\u65E0\u5B75\u5238";
    }
  }
  openSlots() {
    this.setScreen("slots", "\u5B58\u6863", `\u5F53\u524D\u69FD ${this.slot + 1}\u3002`);
  }
  openGlossary(back) {
    this.glossaryBack = back;
    this.setScreen("glossary", "\u540D\u8BCD", "\u70B9\u8BCD\u6761\uFF0C\u8BF4\u660E\u51FA\u73B0\u5728\u4E0B\u65B9\u3002");
  }
  restoreGlossaryBack() {
    if (this.glossaryBack === "settings") {
      this.openSettings();
      return;
    }
    this.openTitle();
  }
  openStarter(mode, sprint) {
    this.mode = mode;
    this.sprint = sprint;
    const offers = offerRelics(this.account, `${this.seed}-relic`);
    if (!offers.some((row) => row.id === this.relicId)) {
      this.relicId = pickStartRelic(this.account, this.relicId, `${this.seed}-relic`);
    }
    this.setScreen(sprint ? "starter" : "starter", sprint ? "\u77ED\u5F81" : MODE_NAME[mode], "\u70B9\u9009\u4E00\u53EA\u521D\u59CB\u7CBE\u602A\u3002\u7075\u7CD6\u53EF\u964D\u8D39\u3001\u5F00\u7B2C\u4E8C\u9B42\u5951\u3001\u4E70\u4E13\u5C5E\u5375\u3002");
  }
  spendStarterCandy(kind) {
    const id = "zao_li";
    const name = getSpirit(id).name;
    try {
      spendCandy(this.account, id, kind);
      if (kind === "cost") {
        this.log = `${name}\u8D39\u7528 ${currentCost(id, this.account)}`;
      } else if (kind === "pact") {
        this.log = "\u5DF2\u89E3\u9501\u7B2C\u4E8C\u9B42\u5951\u3002";
      } else {
        this.log = `\u5DF2\u8D2D${name}\u4E13\u5C5E\u5375\u3002`;
      }
    } catch (err) {
      this.log = err instanceof Error ? err.message : "\u7075\u7CD6\u4E0D\u8DB3\u3002";
    }
  }
  startRun(starterId) {
    const relicId = pickStartRelic(this.account, this.relicId, `${this.seed}-relic`);
    this.relicId = relicId;
    this.slice = new ClassicSlice({
      seed: this.seed,
      starterId,
      mode: this.mode,
      sprint: this.sprint,
      relicId: this.sprint ? relicId : relicId || void 0,
      account: this.account
    });
    this.slice.beginWave();
    this.battle = openBattle(this.slice);
    this.account = this.slice.account;
    this.showBattle(`${this.battle.foe.name} \u51FA\u73B0\u4E86\u3002${formatNextHint("command")}`);
  }
  showBattle(log) {
    this.screen = "battle";
    this.title = this.sprint ? "\u77ED\u5F81" : MODE_NAME[this.mode];
    const nudge = this.battleNudge();
    this.log = nudge && !log.includes(nudge) ? `${log} ${nudge}` : log;
  }
  skipTo(wave) {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    slice.skipToWave(wave);
    this.battle = openBattle(slice);
    this.showSlicePhase();
  }
  refresh() {
    this.showSlicePhase();
  }
  harvestLog(prefix) {
    const account = this.slice?.account ?? this.account;
    const candy = Object.values(account.candy).reduce((sum, n) => sum + n, 0);
    return `${prefix} \xB7 ${formatRunHarvest({
      seen: account.seenIds.length,
      caught: account.codex.length,
      candy,
      unlocked: account.unlockedStarters.length > 0
    })}`;
  }
  showSlicePhase() {
    const slice = this.slice;
    if (!slice) {
      this.openTitle();
      return;
    }
    if (slice.phase === "catch") {
      const name = slice.encounter ? getSpirit(slice.encounter.foeId).name : "\u7CBE\u602A";
      this.setScreen("catch", this.sprint ? "\u77ED\u5F81" : MODE_NAME[this.mode], `\u8981\u6536\u5951 ${name} \u5417\uFF1F`);
      return;
    }
    if (slice.phase === "boon") {
      this.setScreen("shop", "\u574A\u5E02", `\u574A\u5E02  \u91D1 ${slice.run.gold}`);
      return;
    }
    if (slice.phase === "map") {
      this.setScreen("map", "\u62E9\u5883", "\u62E9\u4E0B\u4E00\u5883\u57DF\u3002");
      return;
    }
    if (slice.phase === "omen") {
      this.setScreen("omen", slice.omen?.name ?? "\u5947\u9047", slice.omen?.body ?? "");
      return;
    }
    if (slice.phase === "victory") {
      this.setScreen("victory", "\u901A\u5173\u7ED3\u7B97", this.harvestLog("\u901A\u5173"));
      return;
    }
    if (slice.phase === "defeat") {
      this.setScreen("defeat", "\u8D25\u5317\u7ED3\u7B97", this.harvestLog("\u6E83\u8D25"));
      return;
    }
    if (!this.battle || this.battle.result) {
      this.battle = openBattle(slice);
    }
    if (this.battle.waitingFor === "switch") {
      this.setScreen("switch", this.sprint ? "\u77ED\u5F81" : MODE_NAME[this.mode], "\u9009\u4E00\u53EA\u4E0A\u573A");
      return;
    }
    if (this.battle.waitingFor === "target") {
      this.setScreen("target", this.sprint ? "\u77ED\u5F81" : MODE_NAME[this.mode], "\u70B9\u9009\u76EE\u6807");
      return;
    }
    this.showBattle(this.log.includes("\u51FA\u73B0\u4E86") ? this.log : `${this.battle.foe.name} \u51FA\u73B0\u4E86\u3002${formatNextHint("command")}`);
  }
  openSummary() {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    this.setScreen(
      "summary",
      "\u6458\u8981",
      formatRunSummary({
        gold: slice.run.gold,
        potions: slice.run.potions,
        seals: slice.run.seals,
        partyIds: slice.run.partyIds,
        boonIds: slice.run.boonIds
      })
    );
  }
  continueAfterShop() {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    if (slice.phase === "map") {
      this.showSlicePhase();
      return;
    }
    slice.beginWave();
    this.battle = openBattle(slice);
    this.showSlicePhase();
  }
  takeBoon(boonId) {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    const boon = slice.boonChoices.find((row) => row.id === boonId);
    if (boon) {
      this.log = formatBoonTaken(boon.name, formatBoonHint(boon.kind, boon.value));
    }
    slice.takeBoon(boonId);
    this.continueAfterShop();
  }
  skipCatch() {
    this.slice?.skipCatch();
    this.showSlicePhase();
  }
  throwSeal() {
    const slice = this.slice;
    if (!slice?.encounter) {
      return;
    }
    const name = getSpirit(slice.encounter.foeId).name;
    const result = slice.attemptCatch(0);
    this.log = result.caught ? `\u6536\u5951\u6210\u529F ${name}` : `${name} \u6323\u8131\u4E86`;
    this.showSlicePhase();
  }
  useSeal(tier) {
    const battle = this.battle;
    const slice = this.slice;
    if (!battle || !slice) {
      return;
    }
    if (battle.waitingFor !== "command") {
      this.log = "\u73B0\u5728\u4E0D\u80FD\u6536\u5951\u3002";
      return;
    }
    try {
      battle.choose({ type: "seal", tier });
      slice.run.seals = [...battle.seals];
      if (battle.result) {
        this.syncBattle();
        return;
      }
      this.showSlicePhase();
    } catch {
      this.log = battle.kind !== "wild" ? "\u6B64\u6218\u4E0D\u80FD\u6536\u5951" : "\u6CA1\u6709\u8FD9\u79CD\u9547\u7269";
    }
  }
  syncBattle() {
    const slice = this.slice;
    const battle = this.battle;
    if (!slice || !battle) {
      return;
    }
    if (!battle.result) {
      this.showSlicePhase();
      return;
    }
    applyBattleEnd(slice, battle);
    this.account = slice.account;
    this.battle = null;
    this.showSlicePhase();
  }
  playArt(artId, fromSlip = false) {
    const battle = this.battle;
    if (!battle || battle.waitingFor !== "command" || !artId) {
      this.log = "\u73B0\u5728\u4E0D\u80FD\u51FA\u672F\u3002";
      return;
    }
    if (fromSlip && (battle.active.focusLeft[artId] ?? 0) <= 0) {
      this.log = formatSpentArt(getArt(artId).name);
      return;
    }
    let art = null;
    try {
      art = getArt(artId);
    } catch {
      art = null;
    }
    battle.choose({ type: "art", artId });
    this.log = formatArtPlay(battle.active.name, art);
    this.syncBattle();
  }
  chooseSwitch(index) {
    const battle = this.battle;
    if (!battle) {
      return;
    }
    battle.choose({ type: "switch", partyIndex: index });
    this.showBattle(`${battle.active.name} \u4E0A\u573A`);
  }
  usePotion() {
    const battle = this.battle;
    if (!battle || battle.waitingFor !== "command") {
      this.log = "\u73B0\u5728\u4E0D\u80FD\u7528\u836F\u3002";
      return;
    }
    try {
      battle.choose({ type: "bag" });
      this.showBattle(`${battle.active.name} \u559D\u4E86\u5C0F\u836F\u3002`);
    } catch {
      this.log = "\u56CA\u4E2D\u65E0\u836F";
    }
  }
  useForm(form) {
    const battle = this.battle;
    if (!battle || battle.waitingFor !== "command") {
      this.log = "\u73B0\u5728\u4E0D\u80FD\u53D8\u8EAB\u3002";
      return;
    }
    try {
      battle.choose({
        type: "form",
        form,
        affinity: form === "apex" ? battle.foe.affinities[0] ?? "tide" : void 0
      });
      this.showBattle(`${battle.active.name} \u8FDB\u5165\u5F62\u6001\u3002`);
    } catch {
      this.log = "\u7F3A\u5C11\u5F00\u542F\u5668\u3002";
    }
  }
  tryRun() {
    const battle = this.battle;
    if (!battle || battle.waitingFor !== "command") {
      this.log = "\u73B0\u5728\u4E0D\u80FD\u8D70\u3002";
      return;
    }
    if (battle.kind !== "wild") {
      this.log = "\u884C\u8005\u6218\u4E0D\u80FD\u8D70\u3002";
      return;
    }
    battle.choose({ type: "run" });
    this.log = "\u9003\u8D70\u4E86\u3002";
    this.syncBattle();
  }
};
function beginUiRun(opts) {
  const app = new PreviewApp({ seed: opts.seed, account: opts.account });
  app.mode = opts.mode ?? "classic";
  app.sprint = Boolean(opts.sprint);
  app.relicId = opts.relicId ?? "";
  app.startRun(opts.starterId);
  if (!app.slice) {
    throw new Error("run did not start");
  }
  return app.slice;
}
function playableFingerprint(app) {
  return JSON.stringify({
    screen: app.screen,
    log: app.log,
    waiting: app.battle?.waitingFor ?? null,
    wave: app.slice?.run.wave ?? 0,
    gold: app.slice?.run.gold ?? 0,
    hp: app.battle?.party.map((unit) => unit.hp) ?? [],
    foeHp: app.battle?.foes.map((unit) => unit.hp) ?? []
  });
}
function tapPlayable(app, label, acc) {
  acc.screens.add(app.screen);
  const before = playableFingerprint(app);
  app.tap(label);
  acc.taps.push(label);
  acc.screens.add(app.screen);
  if (playableFingerprint(app) === before) {
    acc.dead += 1;
  }
}
function runUiSmoke(seed) {
  const acc = { screens: /* @__PURE__ */ new Set(), taps: [], dead: 0 };
  const tap = (app, label) => {
    tapPlayable(app, label, acc);
  };
  const lobby = new PreviewApp({ seed: `${seed}-lobby` });
  tap(lobby, "\u8BBE\u7F6E");
  tap(lobby, "\u8DF3\u8FC7\u5DF2\u89C1\xB7\u5173");
  tap(lobby, "\u663E\u793A");
  tap(lobby, "\u91D1\u94B1\xB7\u5F00");
  tap(lobby, "\u4F24\u5BB3\u6570\u5B57\xB7\u5F00");
  tap(lobby, "\u97F3\u9891");
  tap(lobby, "\u73A9\u6CD5");
  tap(lobby, "\u500D\u901F 1");
  tap(lobby, "\u89E6\u63A7");
  tap(lobby, "\u5E03\u5C40\xB7\u89E6\u63A7");
  tap(lobby, "\u8FD4\u56DE");
  tap(lobby, "\u5951\u5F55");
  tap(lobby, "\u8FD4\u56DE");
  tap(lobby, "\u5375\u623F");
  tap(lobby, "\u5151\u5B75\u5238");
  tap(lobby, "\u8DF3\u8FC7\u5E76\u5F00");
  tap(lobby, "\u8FD4\u56DE");
  tap(lobby, "\u8FD4\u56DE");
  tap(lobby, "\u6210\u5C31");
  tap(lobby, "\u8FD4\u56DE");
  tap(lobby, "\u7EDF\u8BA1");
  tap(lobby, "\u8FD4\u56DE");
  tap(lobby, "\u5B58\u6863");
  tap(lobby, "\u69FD2");
  tap(lobby, "\u8FD4\u56DE");
  tap(lobby, "\u540D\u8BCD");
  tap(lobby, GLOSSARY[0]?.term ?? "\u7CBE\u602A");
  tap(lobby, "\u8FD4\u56DE");
  for (const mode of ["\u77ED\u5F81", "\u7ECF\u5178", "\u4ECA\u65E5\u8BD5\u70BC", "\u65E0\u5C3D\u957F\u591C", "\u957F\u591C\xB7\u5408\u4F53", "\u82DB\u4EE4"]) {
    const app = new PreviewApp({ seed: `${seed}-${mode}` });
    tap(app, "\u65B0\u7684\u65C5\u9014");
    tap(app, mode);
    tap(app, getSpirit("zao_li").name);
    tap(app, "\u672F\u7B7E");
    tap(app, "\u8FD4\u56DE");
    tap(app, "\u961F\u4F0D");
    tap(app, "\u8FD4\u56DE");
    tap(app, "\u56CA");
    tap(app, "\u8FD4\u56DE");
  }
  const caught = new PreviewApp({ seed: `${seed}-catch` });
  tap(caught, "\u65B0\u7684\u65C5\u9014");
  tap(caught, "\u7ECF\u5178");
  tap(caught, getSpirit("zao_li").name);
  if (caught.battle) {
    for (const foe of caught.battle.foes) {
      foe.hp = 1;
    }
  }
  for (let i = 0; i < 8 && caught.screen === "battle"; i += 1) {
    tap(caught, "\u672F");
  }
  if (caught.screen === "catch") {
    tap(caught, "\u9547\u7269");
  }
  const shop = new PreviewApp({ seed: `${seed}-shop` });
  tap(shop, "\u65B0\u7684\u65C5\u9014");
  tap(shop, "\u7ECF\u5178");
  tap(shop, getSpirit("zao_li").name);
  tap(shop, "\u8D70");
  if (shop.screen === "catch") {
    tap(shop, "\u653E\u8FC7");
  }
  if (shop.screen === "shop") {
    tap(shop, "\u518D\u62E9");
    tap(shop, "\u5C0F\u836F");
    tap(shop, "\u6458\u8981");
    tap(shop, "\u8FD4\u56DE");
    tap(shop, "\u5947\u9047");
  }
  if (shop.screen === "omen") {
    const option = shop.labels()[0];
    if (option) {
      tap(shop, option);
    }
  }
  if (shop.screen === "shop") {
    const boon = shop.labels().find((label) => !["\u518D\u62E9", "\u5C0F\u836F", "\u6458\u8981", "\u5947\u9047", "\u5408\u4F53", "\u7A7A\u5730", "\u56DE\u5385"].includes(label));
    if (boon) {
      tap(shop, boon);
    }
  }
  if (shop.screen === "catch") {
    tap(shop, "\u9547\u7269");
  }
  const mapped = new PreviewApp({ seed: `${seed}-map` });
  tap(mapped, "\u65B0\u7684\u65C5\u9014");
  tap(mapped, "\u7ECF\u5178");
  tap(mapped, getSpirit("jing_zhu").name);
  if (mapped.slice) {
    mapped.slice.run.hasMap = true;
  }
  mapped.skipTo(10);
  for (let i = 0; i < 8 && mapped.screen === "battle"; i += 1) {
    tap(mapped, "\u8D70");
    if (mapped.screen === "catch") {
      tap(mapped, "\u653E\u8FC7");
    }
    if (mapped.screen === "shop") {
      const boon = mapped.labels().find((label) => !["\u518D\u62E9", "\u5C0F\u836F", "\u6458\u8981", "\u5947\u9047", "\u5408\u4F53", "\u7A7A\u5730", "\u56DE\u5385"].includes(label));
      if (boon) {
        tap(mapped, boon);
      }
    }
  }
  if (mapped.screen === "map") {
    const realm = mapped.labels()[0];
    if (realm) {
      tap(mapped, realm);
    }
  }
  const dead = new PreviewApp({ seed: `${seed}-defeat` });
  tap(dead, "\u65B0\u7684\u65C5\u9014");
  tap(dead, "\u7ECF\u5178");
  tap(dead, getSpirit("tao_geng").name);
  if (dead.battle) {
    for (const unit of dead.battle.party) {
      unit.hp = 1;
      unit.atk = 1;
    }
    for (const foe of dead.battle.foes) {
      foe.hp = Math.max(foe.hp, 80);
    }
  }
  for (let i = 0; i < 12 && dead.screen !== "defeat"; i += 1) {
    if (dead.screen === "battle") {
      tap(dead, "\u672F");
      continue;
    }
    if (dead.screen === "switch") {
      const name = dead.labels().find((label) => label !== "\u8FD4\u56DE");
      tap(dead, name ?? "\u8FD4\u56DE");
      continue;
    }
    if (dead.screen === "target") {
      tap(dead, dead.labels()[0] ?? "\u672F");
    }
  }
  if (dead.screen !== "defeat" && dead.slice) {
    dead.slice.noteLoss();
    dead.refresh();
  }
  if (dead.screen === "defeat") {
    tap(dead, "\u518D\u6765\u4E00\u5C40");
  }
  const win = new PreviewApp({ seed: `${seed}-win` });
  tap(win, "\u65B0\u7684\u65C5\u9014");
  tap(win, "\u77ED\u5F81");
  tap(win, getSpirit("zao_li").name);
  win.skipTo(20);
  if (win.battle) {
    for (const foe of win.battle.foes) {
      foe.hp = 1;
    }
  }
  for (let i = 0; i < 12 && win.screen !== "victory"; i += 1) {
    if (win.screen === "battle") {
      tap(win, "\u672F");
      continue;
    }
    if (win.screen === "target") {
      tap(win, win.labels()[0] ?? "\u672F");
      continue;
    }
    if (win.screen === "catch") {
      tap(win, "\u653E\u8FC7");
      continue;
    }
    if (win.screen === "shop") {
      const boon = win.labels().find((label) => !["\u518D\u62E9", "\u5C0F\u836F", "\u6458\u8981", "\u5947\u9047", "\u5408\u4F53", "\u7A7A\u5730", "\u56DE\u5385"].includes(label));
      if (boon) {
        tap(win, boon);
      }
    }
  }
  if (win.screen !== "victory" && win.slice) {
    win.slice.noteWin();
    win.refresh();
  }
  if (win.screen === "victory") {
    tap(win, "\u518D\u6765\u4E00\u5C40");
  }
  return { screens: [...acc.screens], taps: acc.taps, dead: acc.dead };
}
var STARTER_IDS = ["zao_li", "jing_zhu", "tao_geng"];
var MODE_LABELS = ["\u77ED\u5F81", "\u7ECF\u5178", "\u4ECA\u65E5\u8BD5\u70BC", "\u65E0\u5C3D\u957F\u591C", "\u957F\u591C\xB7\u5408\u4F53", "\u82DB\u4EE4"];
function walkPlayableUi(seed) {
  const acc = { screens: /* @__PURE__ */ new Set(), taps: [], dead: 0 };
  let battles = 0;
  const tap = (app, label) => {
    tapPlayable(app, label, acc);
  };
  for (const mode of MODE_LABELS) {
    for (const id of STARTER_IDS) {
      const app = new PreviewApp({ seed: `${seed}-${mode}-${id}` });
      tap(app, "\u65B0\u7684\u65C5\u9014");
      tap(app, mode);
      tap(app, getSpirit(id).name);
      if (app.screen !== "battle") {
        throw new Error(`${mode}/${id} stayed on ${app.screen}: ${app.log}`);
      }
      battles += 1;
      tap(app, "\u672F\u7B7E");
      tap(app, "\u8FD4\u56DE");
      tap(app, "\u961F\u4F0D");
      tap(app, "\u8FD4\u56DE");
      tap(app, "\u56CA");
      tap(app, "\u8FD4\u56DE");
      if (mode === "\u77ED\u5F81" && id === "zao_li") {
        tap(app, "\u672F");
      }
    }
  }
  const smoke = runUiSmoke(`${seed}-smoke`);
  for (const screen of smoke.screens) {
    acc.screens.add(screen);
  }
  acc.taps.push(...smoke.taps);
  acc.dead += smoke.dead ?? 0;
  return { screens: [...acc.screens], taps: acc.taps, battles, dead: acc.dead ?? 0 };
}

// src/ui/catch-fx.ts
var CATCH_FX = {
  throwEnd: 0.32,
  wobbleEnd: 0.96,
  settleEnd: 1.28
};
function catchFxPhase(t, caught) {
  if (t < CATCH_FX.throwEnd) {
    return "throw";
  }
  if (t < CATCH_FX.wobbleEnd) {
    return "wobble";
  }
  return caught ? "caught" : "broke";
}
function catchFxDuration() {
  return CATCH_FX.settleEnd;
}

// src/ui/hit-fx.ts
var HIT_FX = {
  flashDim: 0.08,
  flashEnd: 0.26,
  lungeOut: 0.12,
  lungeBack: 0.16
};
function hitFxDuration() {
  return HIT_FX.flashEnd;
}

// src/ui/portrait-fit.ts
function portraitFit(boxW, boxH, imgW, imgH) {
  if (boxW <= 0 || boxH <= 0 || imgW <= 0 || imgH <= 0) {
    return { width: Math.max(0, boxW), height: Math.max(0, boxH) };
  }
  const scale = Math.min(boxW / imgW, boxH / imgH);
  return { width: imgW * scale, height: imgH * scale };
}

// src/ui/selectors.ts
function freeze(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => freeze(item));
    return Object.freeze(value);
  }
  for (const child of Object.values(value)) {
    freeze(child);
  }
  return Object.freeze(value);
}
function selectSettings(account) {
  return freeze({
    tabs: Array.from(SETTINGS_TABS),
    values: { ...account.settings }
  });
}
function selectCodexList(account) {
  const spirits = loadTables().spirits;
  const rows = spirits.map((row) => {
    const status = codexStatus(account, row.id);
    return { id: row.id, name: status === "unknown" ? "\u672A\u77E5" : row.name, status };
  });
  const caught = rows.filter((row) => row.status === "caught").length;
  const seen = rows.filter((row) => row.status !== "unknown").length;
  return freeze({ total: rows.length, caught, seen, isEmpty: caught === 0, rows });
}
function selectCodexEntry(account, spiritId) {
  const row = getSpirit(spiritId);
  const status = codexStatus(account, spiritId);
  if (status === "unknown") {
    return freeze({
      id: spiritId,
      name: "\u672A\u77E5",
      status,
      affinities: [],
      evolveTo: null,
      lockedReason: "\u5C1A\u672A\u89C1\u8FC7\u8FD9\u53EA\u7CBE\u602A"
    });
  }
  return freeze({
    id: spiritId,
    name: row.name,
    status,
    affinities: Array.from(row.affinities),
    evolveTo: row.evolveTo ?? null,
    lockedReason: null
  });
}
function selectEggs(account) {
  const slots = account.eggs.map((egg) => ({
    id: egg.id,
    spiritId: egg.spiritId,
    tier: String(egg.tier),
    steps: egg.steps
  }));
  return freeze({
    slots,
    vouchers: { ...account.vouchers },
    isEmpty: slots.length === 0
  });
}
function selectAchievements(account) {
  const got = new Set(account.achievements);
  const pub = listAchievements({ hidden: false }).map((row) => ({
    id: row.id,
    name: row.name,
    hidden: false,
    earned: got.has(row.id)
  }));
  const hidden = listAchievements({ hidden: true }).map((row) => ({
    id: row.id,
    name: got.has(row.id) ? row.name : "\u672A\u516C\u5F00",
    hidden: true,
    earned: got.has(row.id)
  }));
  const rows = [...pub, ...hidden];
  const earned = rows.filter((row) => row.earned).length;
  return freeze({ total: pub.length, earned, rows, isEmpty: earned === 0 });
}
function selectStats(account, utcDate) {
  const bestDaily = bestDailyScore(account, utcDate);
  return freeze({
    seen: account.seenIds.length,
    caught: account.codex.length,
    ribbons: account.ribbons.length,
    bestDaily,
    hasHistory: account.seenIds.length > 0 || account.codex.length > 0 || bestDaily > 0
  });
}
var SLOT_COUNT = 5;
function selectSlots(_account, saved) {
  const bySlot = new Map(saved.map((row) => [row.slot, row]));
  const slots = Array.from({ length: SLOT_COUNT }, (_, index) => {
    const row = bySlot.get(index);
    return {
      slot: index,
      occupied: Boolean(row),
      wave: row ? row.wave : null,
      mode: row ? row.mode : null
    };
  });
  return freeze({ slots, isEmpty: saved.length === 0 });
}
function selectGlossary() {
  return freeze({
    terms: GLOSSARY.map((row) => ({ term: row.term, explain: row.body }))
  });
}
var DEFAULT_STARTERS = ["zao_li", "jing_zhu", "tao_geng"];
function selectStarter(account, seed) {
  const ids = account.unlockedStarters.length > 0 ? Array.from(account.unlockedStarters) : Array.from(DEFAULT_STARTERS);
  const candidates = ids.map((id) => {
    const row = getSpirit(id);
    return {
      id,
      name: row.name,
      cost: currentCost(id, account),
      affinities: Array.from(row.affinities),
      lockedReason: null
    };
  });
  const relics = offerRelics(account, seed).map((row) => ({
    id: row.id,
    name: row.name,
    kind: String(row.kind)
  }));
  return freeze({
    candidates,
    relics,
    chosenRelicId: pickStartRelic(account, "", seed)
  });
}
function nameplate(entity) {
  return {
    id: entity.id,
    name: entity.name,
    level: entity.level,
    hp: entity.hp,
    maxHp: entity.maxHp,
    down: entity.hp <= 0,
    ailment: entity.ailment ? String(entity.ailment) : null
  };
}
function selectBattle(battle, run, log = "") {
  const aliveParty = battle.party.filter((member) => member.hp > 0).length;
  const commands = [
    {
      id: "art",
      label: "\u672F",
      lockedReason: battle.active.artIds.length > 0 ? null : "\u6CA1\u6709\u53EF\u7528\u7684\u672F"
    },
    {
      id: "party",
      label: "\u961F\u4F0D",
      lockedReason: aliveParty > 1 ? null : "\u6CA1\u6709\u53EF\u6362\u7684\u4F19\u4F34"
    },
    {
      id: "bag",
      label: "\u56CA",
      lockedReason: battle.potions > 0 ? null : "\u56CA\u91CC\u6CA1\u6709\u4E1C\u897F"
    },
    { id: "flee", label: "\u8D70", lockedReason: null }
  ];
  return freeze({
    wave: run.wave,
    gold: run.gold,
    realmId: run.realmId,
    ally: nameplate(battle.active),
    foe: nameplate(battle.foe),
    partySize: aliveParty,
    commands,
    log
  });
}
var SEAL_NAMES = ["\u51E1\u5370", "\u4E0A\u5370", "\u7279\u5370", "\u91D1\u5370", "\u7384\u5370"];
function selectBattleOverlays(source) {
  const arts = (source.active.artIds ?? []).map((artId) => {
    const left = source.active.focusLeft?.[artId];
    const exhausted = typeof left === "number" && left <= 0;
    return {
      id: artId,
      label: artId,
      detail: typeof left === "number" ? `\u4F59 ${left}` : "",
      lockedReason: exhausted ? "\u8FD9\u4E00\u5F0F\u5DF2\u7ECF\u7528\u5C3D" : null
    };
  });
  const switchTargets = source.party.map((member, index) => ({ member, index })).filter(({ index }) => index !== source.activeIndex).map(({ member, index }) => ({
    id: member.instanceId ?? `${member.id}-${index}`,
    label: member.name,
    detail: `Lv ${member.level} ${member.hp}/${member.maxHp}`,
    lockedReason: member.hp <= 0 ? "\u5DF2\u7ECF\u5012\u4E0B" : null
  }));
  const party = source.party.map((member, index) => ({
    id: member.instanceId ?? `${member.id}-${index}`,
    label: member.name,
    detail: `Lv ${member.level} ${member.hp}/${member.maxHp}`,
    lockedReason: member.hp <= 0 ? "\u5DF2\u7ECF\u5012\u4E0B" : null
  }));
  const bag = [
    {
      id: "potion",
      label: "\u7075\u9732",
      detail: `x${source.potions}`,
      lockedReason: source.potions > 0 ? null : "\u56CA\u91CC\u6CA1\u6709\u7075\u9732"
    }
  ];
  const targets = source.foes.map((foe, index) => ({
    id: foe.instanceId ?? `${foe.id}-${index}`,
    label: foe.name,
    detail: `Lv ${foe.level} ${foe.hp}/${foe.maxHp}`,
    lockedReason: foe.hp <= 0 ? "\u5DF2\u7ECF\u5012\u4E0B\uFF0C\u4E0D\u662F\u5408\u6CD5\u76EE\u6807" : null
  }));
  const seals = source.seals.map((count, tier) => ({
    id: `seal-${tier}`,
    label: SEAL_NAMES[tier] ?? `\u5370${tier}`,
    detail: `x${count}`,
    lockedReason: count > 0 ? null : "\u6CA1\u6709\u8FD9\u79CD\u9547\u7269"
  }));
  return freeze({ arts, switchTargets, party, bag, targets, seals });
}
function selectRunProgress(source) {
  const shop = (source.shop ?? []).map((entry) => {
    const short = entry.cost - source.gold;
    const reason = entry.soldOut ? "\u5DF2\u7ECF\u5356\u5149" : short > 0 ? `\u8FD8\u5DEE ${short} \u94B1` : null;
    return {
      id: entry.id,
      label: entry.name,
      detail: `${entry.cost} \u94B1`,
      lockedReason: reason
    };
  });
  const omens = (source.omens ?? []).map((omen) => ({
    id: omen.id,
    label: omen.name,
    detail: omen.requirement ?? "",
    lockedReason: omen.available === false ? omen.requirement ?? "\u73B0\u5728\u9009\u4E0D\u4E86" : null
  }));
  const nodes = (source.nodes ?? []).map((node) => ({
    id: node.id,
    label: node.name,
    detail: node.cleared ? "\u5DF2\u8FC7" : "",
    lockedReason: node.reachable ? null : "\u4ECE\u8FD9\u91CC\u8D70\u4E0D\u8FC7\u53BB"
  }));
  return freeze({
    gold: source.gold,
    wave: source.wave,
    deltas: source.deltas ?? [],
    shop,
    omens,
    nodes
  });
}
function selectOutcome(source) {
  return freeze({
    won: source.won,
    wave: source.wave,
    gold: source.gold,
    details: source.details ?? [],
    committed: source.committed === true,
    hatched: source.hatched ?? [],
    art: source.art ?? "ready"
  });
}

// src/ui/theme.ts
var THEME = {
  paper: [232, 244, 252],
  panel: [255, 253, 248],
  ink: [61, 50, 40],
  accent: [255, 138, 74],
  edge: [91, 184, 232],
  field: [123, 198, 122],
  fieldDeep: [98, 176, 100],
  slip: [255, 236, 214],
  muted: [80, 70, 62],
  hpBack: [208, 192, 180],
  hpHigh: [88, 196, 92],
  hpMid: [220, 148, 28],
  hpLow: [220, 72, 64]
};

// src/ui/item-icon.ts
var RELIC = {
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
  sealPack: "seal-fan"
};
function sealIcon(tierId) {
  const known = SEAL_TIERS.find((row) => row.id === tierId);
  return known ? `seal-${known.id}` : "seal-fan";
}
function itemIcon(kind) {
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

// src/run/move-charm.ts
function moveCharm(run, from, to, charmId) {
  if (charmId === "bone_dose" || charmId.startsWith("bone_dose")) {
    throw new Error("bone dose cannot move");
  }
  const source = run.partyCharms[from];
  const target = run.partyCharms[to];
  if (!source || !target) {
    throw new Error("invalid party index");
  }
  const index = source.indexOf(charmId);
  if (index < 0) {
    throw new Error("charm not on source");
  }
  source.splice(index, 1);
  target.push(charmId);
}

// src/sim/bench.ts
function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}
function benchSims(opts) {
  const tiers = opts.tier === "all" ? ["low", "mid", "high"] : [opts.tier];
  const prefix = opts.prefix ?? "bench";
  return tiers.map((tier) => {
    const results = [];
    for (let i = 0; i < opts.seeds; i++) {
      results.push(
        runSim({
          seed: `${prefix}-${i}`,
          tier,
          maxWaves: opts.maxWaves ?? 200
        })
      );
    }
    const waves = results.map((row) => row.wave);
    return {
      tier,
      seeds: opts.seeds,
      meanWave: mean(waves),
      clearRate: results.filter((row) => row.reason === "victory").length / Math.max(1, results.length),
      results
    };
  });
}
function formatBench(rows) {
  return rows.map((row) => {
    const reasons = row.results.reduce((acc, item) => {
      acc[item.reason] = (acc[item.reason] ?? 0) + 1;
      return acc;
    }, {});
    const why = Object.entries(reasons).map(([key, count]) => `${key}:${count}`).join(",");
    return `${row.tier}  n=${row.seeds}  \u5747\u6CE2 ${row.meanWave.toFixed(1)}  \u901A\u5173 ${(row.clearRate * 100).toFixed(0)}%  ${why}`;
  }).join("\n");
}

// src/run/run-controller.ts
var RunController = class {
  slice = null;
  battle = null;
  log = "";
  committed = false;
  commits = 0;
  forcedWin = null;
  store;
  constructor(store) {
    this.store = store ?? null;
  }
  // --- 生命周期 ---
  startRun(opts) {
    this.slice = new ClassicSlice({
      seed: opts.seed,
      starterId: opts.starterId,
      mode: opts.mode ?? "classic",
      account: opts.account ?? emptyAccount(),
      relicId: opts.relicId,
      sprint: opts.sprint
    });
    this.slice.beginWave();
    this.battle = openBattle(this.slice);
    this.log = "\u906D\u9047\u5F00\u59CB\u3002";
    this.committed = false;
    this.commits = 0;
    this.forcedWin = null;
  }
  phase() {
    return this.forcedWin !== null ? this.forcedWin ? "victory" : "defeat" : this.slice?.phase ?? "none";
  }
  account() {
    return this.requireSlice().account;
  }
  commitCount() {
    return this.commits;
  }
  // --- 壳层唯一入口 ---
  /** 把命令名 + payload 落到真实状态。未知命令忽略（不崩）。 */
  execute(command, payload = {}) {
    switch (command) {
      case "battle.art":
      case "arts.confirm":
        this.useArt(payload.id ?? this.firstArtId());
        return;
      case "arts.pick":
        this.pendingArtId = payload.id ?? null;
        return;
      case "battle.flee":
        this.flee();
        return;
      case "switch.pick":
      case "switch.confirm":
        this.switchTo(payload.id ?? this.pendingSwitchId ?? "");
        return;
      case "bag.use":
      case "bag.confirm":
        this.useItem();
        return;
      case "target.pick":
        this.pendingTargetId = payload.id ?? null;
        return;
      case "target.confirm":
        if (this.pendingArtId) {
          this.useArt(this.pendingArtId, this.pendingTargetId ?? void 0);
        }
        return;
      case "catch.throw":
      case "catch.confirm":
        this.attemptCatch();
        return;
      case "summary.continue":
      case "shop.leave":
        this.continueAfterReward();
        return;
      case "shop.buy":
        this.buy(payload.id ?? "");
        return;
      case "omen.pick":
        this.pickOmen(payload.id ?? "");
        return;
      case "omen.skip":
        this.skipOmen();
        return;
      case "map.enter":
        this.enterNode(payload.id ?? "");
        return;
      case "map.rest":
        return;
      // 原地歇脚：不推进，保持安全继续路径
      case "outcome.commit":
        this.commitOutcome();
        return;
      case "outcome.lobby":
        this.toLobby();
        return;
      default:
        return;
    }
  }
  // --- 战斗命令 ---
  pendingArtId = null;
  pendingTargetId = null;
  pendingSwitchId = null;
  firstArtId() {
    return this.battle?.active.artIds[0] ?? "";
  }
  useArt(artId, targetId) {
    const battle = this.battle;
    if (!battle || battle.waitingFor === "over") {
      return;
    }
    if (!battle.active.artIds.includes(artId)) {
      throw new Error(`unknown art: ${artId}`);
    }
    this.applyBattle({ type: "art", artId, ...targetId ? { targetId } : {} });
    this.log = "\u51FA\u672F\u3002";
  }
  switchTo(id) {
    const battle = this.battle;
    if (!battle) {
      return;
    }
    const index = battle.party.findIndex((m, i) => (m.instanceId ?? `${m.id}-${i}`) === id);
    if (index < 0) {
      throw new Error(`unknown party member: ${id}`);
    }
    this.applyBattle({ type: "switch", partyIndex: index });
    this.log = "\u6362\u4F4D\u3002";
  }
  useItem() {
    const battle = this.battle;
    if (!battle || battle.potions <= 0) {
      return;
    }
    this.applyBattle({ type: "bag" });
    this.log = "\u7528\u4E86\u7075\u9732\u3002";
  }
  flee() {
    if (!this.battle) {
      return;
    }
    this.applyBattle({ type: "run" });
    this.log = "\u8BD5\u56FE\u79BB\u5F00\u3002";
  }
  attemptCatch() {
    const slice = this.slice;
    if (!slice || slice.phase !== "catch") {
      return;
    }
    slice.attemptCatch(0);
    this.syncPhase();
  }
  applyBattle(command) {
    const slice = this.requireSlice();
    const battle = this.battle;
    if (!battle) {
      return;
    }
    battle.choose(command);
    if (battle.result) {
      applyBattleEnd(slice, battle);
      this.battle = null;
      this.syncPhase();
    }
  }
  // --- 推进 ---
  continueAfterReward() {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    if (slice.phase === "boon" && slice.boonChoices[0]) {
      slice.takeBoon(slice.boonChoices[0].id);
    }
    this.afterAdvance();
  }
  buy(id) {
    const slice = this.slice;
    if (!slice || slice.phase !== "boon" || !id) {
      return;
    }
    slice.buyStock(id);
  }
  pickOmen(id) {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    const index = Number.parseInt(id, 10);
    if (Number.isFinite(index)) {
      slice.pickOmen(index);
      this.afterAdvance();
    }
  }
  skipOmen() {
    const slice = this.slice;
    if (slice && slice.phase === "omen") {
      slice.pickOmen(0);
      this.afterAdvance();
    }
  }
  enterNode(id) {
    const slice = this.slice;
    if (!slice || slice.phase !== "map" || !id) {
      return;
    }
    slice.pickRealm(id);
    this.afterAdvance();
  }
  /** 奖励/机缘结束后，若回到 battle 相位就开下一场。 */
  afterAdvance() {
    const slice = this.requireSlice();
    if (slice.phase === "battle") {
      slice.beginWave();
      this.battle = openBattle(slice);
      this.log = "\u65B0\u7684\u4E00\u6CE2\u3002";
    }
    this.syncPhase();
  }
  syncPhase() {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    if (slice.phase === "victory") {
      this.log = "\u8D62\u4E0B\u4E86\u8FD9\u4E00\u5C40\u3002";
    } else if (slice.phase === "defeat") {
      this.log = "\u8FD9\u4E00\u5C40\u5230\u6B64\u4E3A\u6B62\u3002";
    }
  }
  // --- 结局与存档 ---
  commitOutcome() {
    const slice = this.requireSlice();
    if (this.committed) {
      return slice.account.revision;
    }
    slice.account.revision += 1;
    this.committed = true;
    this.commits += 1;
    return slice.account.revision;
  }
  toLobby() {
    this.battle = null;
    this.forcedWin = null;
  }
  /** 纯字符串序列化（无 IO），供测试与内存快照。 */
  serialize() {
    const slice = this.requireSlice();
    return JSON.stringify({ run: encodeRun(slice.run), account: encodeAccount(slice.account) });
  }
  deserialize(blob) {
    const parsed = JSON.parse(blob);
    this.slice = ClassicSlice.fromState(decodeRun(parsed.run), decodeAccount(parsed.account));
    this.battle = this.slice.phase === "battle" ? openBattle(this.slice) : null;
    this.committed = false;
    this.commits = 0;
    this.forcedWin = null;
  }
  /** 真实存档：run 写入指定槽，account 单独落库（走 core 的 local-store）。 */
  async save(slot) {
    const store = this.requireStore();
    const slice = this.requireSlice();
    await saveRunLocal(store, slot, slice.run);
    await saveAccountLocal(store, slice.account);
  }
  async load(slot) {
    const store = this.requireStore();
    const run = await loadRunLocal(store, slot);
    if (!run) {
      throw new Error(`no save in slot ${slot}`);
    }
    const account = await loadAccountLocal(store) ?? emptyAccount();
    this.slice = ClassicSlice.fromState(run, account);
    this.battle = this.slice.phase === "battle" ? openBattle(this.slice) : null;
    this.committed = false;
    this.commits = 0;
    this.forcedWin = null;
  }
  /** 读取 5 个槽，供 slots 页真实数据（替代宿主注入）。 */
  async listSlots() {
    const store = this.requireStore();
    const out = [];
    for (let slot = 0; slot < 5; slot += 1) {
      const run = await loadRunLocal(store, slot);
      out.push({
        slot,
        isEmpty: run === null,
        wave: run?.wave ?? 0,
        mode: run?.mode ?? ""
      });
    }
    return out;
  }
  requireStore() {
    if (!this.store) {
      throw new Error("no KvStore injected: construct RunController(store) to use save/load");
    }
    return this.store;
  }
  snapshot() {
    const slice = this.requireSlice();
    return { run: slice.run, account: slice.account };
  }
  // --- 只读投影（复用既有 selector） ---
  battleView() {
    if (!this.battle) {
      return null;
    }
    return selectBattle(
      {
        active: this.battle.active,
        foe: this.battle.foe,
        party: this.battle.party,
        potions: this.battle.potions
      },
      this.requireSlice().run,
      this.log
    );
  }
  overlaysView() {
    const battle = this.battle;
    if (!battle) {
      return selectBattleOverlays({
        active: { id: "", name: "", level: 0, hp: 0, maxHp: 0, artIds: [], focusLeft: {} },
        party: [],
        foes: [],
        potions: 0,
        seals: [],
        activeIndex: 0
      });
    }
    return selectBattleOverlays({
      active: battle.active,
      party: battle.party,
      foes: battle.foes,
      potions: battle.potions,
      seals: battle.seals,
      activeIndex: battle.activeIndex
    });
  }
  progressView(kind) {
    const slice = this.slice;
    if (!slice) {
      return selectRunProgress({ gold: 0, wave: 0 });
    }
    const stock = kind === "shop" ? stockForWave(slice.run.wave) : [];
    const shop = stock.map((item) => ({ id: item.id, name: item.name, cost: item.cost }));
    const nodes = slice.realmChoices.map((realmId) => ({ id: realmId, name: realmId, reachable: true }));
    return selectRunProgress({
      gold: slice.run.gold,
      wave: slice.run.wave,
      shop,
      nodes
    });
  }
  outcomeView(kind) {
    const slice = this.slice;
    const won = this.forcedWin ?? (slice ? slice.phase === "victory" : false);
    return selectOutcome({
      won: kind === "victory" ? true : kind === "defeat" ? false : won,
      wave: slice?.run.wave ?? 0,
      gold: slice?.run.gold ?? 0,
      details: slice ? [{ label: "\u6CE2", value: String(slice.run.wave) }] : [],
      committed: this.committed,
      hatched: kind === "hatch" ? [{ label: "\u5B75\u51FA", value: slice?.run.starterId ?? "" }] : [],
      art: "ready"
    });
  }
  requireSlice() {
    if (!this.slice) {
      throw new Error("run not started");
    }
    return this.slice;
  }
};

// src/run/product-start.ts
var RUN_MODES = /* @__PURE__ */ new Set(["classic", "daily", "endless", "spliced", "challenge"]);
function resolveProductStart(input) {
  const sprint = input.mode === "sprint";
  const mode = RUN_MODES.has(input.mode) ? input.mode : "classic";
  return {
    seed: input.seed,
    starterId: input.starterId || "zao_li",
    mode,
    account: input.account,
    sprint,
    relicId: sprint ? pickStartRelic(input.account, "", input.relicSeed) : void 0
  };
}
export {
  AFFINITY_CN,
  ART_SLIP,
  BATTLE,
  CARTOON_PORTRAIT_IDS,
  CATCH_FX,
  CODEX_PAGE_SIZE,
  ClassicSlice,
  FIRST_PORTRAITS,
  GLOSSARY,
  HIT_FX,
  HIT_MIN,
  HUD,
  LOBBY_SCREENS,
  PORTRAIT_BUNDLE,
  PORTRAIT_IDS,
  RUN_SCREENS,
  RunController,
  SEAL_TIERS,
  SECOND_PORTRAITS,
  SETTINGS_TABS,
  SLOT_COUNT,
  START_PATH,
  THEME,
  THIRD_PORTRAITS,
  VIEW,
  addCandy,
  affinityInk,
  artPowerMul,
  artSlipPos,
  beginUiRun,
  benchSims,
  bestDailyScore,
  bundleForRealm,
  cardCaptionSlots,
  catchBoonValue,
  catchFxDuration,
  catchFxPhase,
  catchModifier,
  codexCell,
  codexStatus,
  codexThumbCaption,
  commitParty,
  currentCost,
  dailyMiasma,
  dailySeed,
  defaultSettings,
  earlyAffinityClamp,
  emptyAccount,
  encounterLevel,
  foeEncounterLevel,
  formatArtHint,
  formatArtPlay,
  formatArtSlip,
  formatBattleNudge,
  formatBench,
  formatBoonHint,
  formatBoonTaken,
  formatCodexEntry,
  formatCodexLog,
  formatCodexSheet,
  formatHpText,
  formatMiss,
  formatNextHint,
  formatRunHarvest,
  formatRunSummary,
  formatSealResult,
  formatSpentArt,
  formatTopBar,
  fuse,
  getArt,
  getOmen,
  getRelic,
  getSpirit,
  grantAchievement,
  grantWaveExp,
  hasCartoonPortrait,
  hasPortrait,
  hatchEgg,
  hatchReady,
  hitFxDuration,
  itemIcon,
  levelCap,
  listAchievements,
  listCodexSpirits,
  listOmens,
  listRelics,
  loadAccountLocal,
  loadRunLocal,
  loadTables,
  moveCharm,
  nameplateSlots,
  offerRelics,
  partyBattleKind,
  partyLevelBonus,
  pickStartRelic,
  portraitFit,
  portraitPath,
  portraitTexturePath,
  recordDailyScore,
  recordSeen,
  redeemVoucher,
  remoteManifest,
  resolveProductStart,
  runSim,
  runUiSmoke,
  saveAccountLocal,
  saveRunLocal,
  screenLayout,
  sealIcon,
  selectAchievements,
  selectBattle,
  selectBattleOverlays,
  selectCodexEntry,
  selectCodexList,
  selectEggs,
  selectGlossary,
  selectOutcome,
  selectRunProgress,
  selectSettings,
  selectSlots,
  selectStarter,
  selectStats,
  skipEggSteps,
  speciesCatchRate,
  spendCandy,
  startDuel,
  startPartyBattle,
  starterRelicIds,
  statsLog,
  sumBoonStats,
  sumRunStats,
  trainerName,
  useEggMachine,
  utcDateStamp,
  walkPlayableUi,
  waveGoldReward
};
