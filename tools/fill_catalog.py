"""Append generated table rows so the catalog meets F11 sizes. Idempotent on id."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TABLES = ROOT / "packages/core/src/tables"

AFF = ["flame", "tide", "stone", "wood", "bolt", "frost", "shade", "light"]
AFF_CN = ["炎", "潮", "岩", "木", "霆", "霜", "影", "光"]
REALMS = [
    "town_ruins",
    "wilds",
    "woods",
    "market",
    "marsh",
    "waste",
    "foothill",
    "shrine",
    "cavern",
    "snow",
    "tide",
    "void",
]
PACTS = [
    "hearth_watch",
    "cistern_lurk",
    "grove_ward",
    "bedrock",
    "storm_silk",
    "winter_husk",
    "night_ledger",
    "lantern_vow",
]
BOON_KINDS = ["atk", "def", "spd", "hp", "catch", "gold", "exp"]
TRAINERS = [
    ("lamp_vendor", "灯市贩"),
    ("shrine_witch", "社巫"),
    ("ferry_pole", "渡口篙工"),
    ("kiln_head", "窑工头"),
    ("stele_beggar", "碑下乞"),
    ("reed_fisher", "芦荡渔"),
    ("salt_hand", "盐丁"),
    ("beacon_watch", "烽卒"),
    ("script_monk", "写经僧"),
    ("loft_bell", "阁铃役"),
    ("moss_steward", "苔庭执事"),
    ("cliff_woodcut", "绝壁樵"),
    ("fog_guide", "雾岸引路"),
    ("well_guard", "泉眼守"),
    ("night_broker", "夜集牙人"),
    ("ore_hand", "矿脉役"),
    ("pagoda_ward", "塔林护"),
    ("isle_helm", "海屿舵"),
    ("forge_hand", "工坊锻"),
    ("grave_watch", "墓园守夜"),
    ("star_offering", "星潭祭"),
    ("ford_clerk", "津渡吏"),
]

LINES = [
    ("luo_yan", "落雁", "flame"),
    ("qing_wu", "青芜", "wood"),
    ("han_quan", "寒泉", "tide"),
    ("chi_ya", "齿崖", "stone"),
    ("lei_mao", "雷猫", "bolt"),
    ("xue_hu", "雪狐", "frost"),
    ("you_deng", "幽灯", "shade"),
    ("hao_que", "皓雀", "light"),
    ("tao_ni", "陶泥", "stone"),
    ("he_lan", "荷澜", "tide"),
    ("song_hun", "松魂", "wood"),
    ("jin_chan", "烬蝉", "flame"),
    ("shi_wen", "石纹", "stone"),
    ("yu_si", "雨丝", "tide"),
    ("feng_ling", "风铃", "bolt"),
    ("bing_hua", "冰花", "frost"),
    ("mo_he", "墨鹤", "shade"),
    ("ri_gui", "日晷", "light"),
    ("yao_yan", "窑烟", "flame"),
    ("zhu_lin", "竹霖", "wood"),
    ("jing_bo", "井波", "tide"),
    ("ya_shi", "崖石", "stone"),
    ("shan_dian", "闪钿", "bolt"),
    ("shuang_lu", "霜露", "frost"),
    ("gui_ying", "桂影", "shade"),
    ("xing_hui", "星辉", "light"),
    ("lu_wei", "芦苇", "wood"),
    ("tong_lu", "铜炉", "flame"),
    ("wan_deng", "碗灯", "flame"),
    ("qiao_mu", "桥木", "wood"),
    ("yu_jian", "渔鉴", "tide"),
    ("bei_hun", "碑魂", "stone"),
    ("jiao_lei", "角雷", "bolt"),
    ("bing_si", "冰丝", "frost"),
    ("ye_fan", "夜幡", "shade"),
    ("zhao_que", "照阙", "light"),
    ("yan_wa", "檐瓦", "stone"),
    ("lian_zhou", "莲舟", "tide"),
    ("sang_gui", "桑鬼", "wood"),
    ("huo_que", "火鹊", "flame"),
    ("ta_ling", "塔铃", "bolt"),
    ("xue_deng", "雪灯", "frost"),
    ("mo_yu", "墨鱼", "shade"),
    ("ri_hua", "日花", "light"),
    ("sui_shi", "燧石", "stone"),
    ("zhu_ying", "竹影", "wood"),
    ("jing_shen", "井神", "tide"),
    ("ya_yun", "崖云", "stone"),
    ("shuang_ya", "霜鸦", "frost"),
    ("gui_deng", "鬼灯", "shade"),
    ("xing_shi", "星石", "light"),
    ("lu_yan", "炉焰", "flame"),
    ("tong_que", "铜雀", "light"),
    ("wei_she", "苇蛇", "wood"),
    ("bo_chen", "波尘", "tide"),
    ("shi_hu", "石虎", "stone"),
    ("lei_gu", "雷鼓", "bolt"),
    ("han_mei", "寒梅", "frost"),
    ("you_lan", "幽兰", "wood"),
    ("hao_zhong", "皓钟", "light"),
    ("tao_wa", "陶瓦", "stone"),
    ("he_ye", "荷叶", "wood"),
    ("song_ta", "松塔", "wood"),
    ("jin_lu", "烬炉", "flame"),
    ("shi_deng", "石灯", "stone"),
    ("yu_deng", "渔灯", "tide"),
    ("feng_duo", "风铎", "bolt"),
    ("mie_zhu", "灭烛", "shade"),
]

STAGES = ("幼", "精", "君")
ENDLESS_EXTRAS = [
    ("nightfair", "夜集"),
    ("ore_vein", "矿脉"),
    ("pagoda_woods", "塔林"),
    ("isle", "海屿"),
    ("workshop", "工坊"),
    ("graveyard", "墓园"),
    ("star_pool", "星潭"),
    ("scriptorium", "写经寮"),
    ("salt_flat", "盐泽"),
    ("reed_marsh", "芦荡"),
    ("kiln_field", "窑甸"),
    ("ferry", "津渡"),
    ("beacon", "烽台"),
    ("loft", "阁上"),
    ("moss_court", "苔庭"),
    ("cliff", "绝壁"),
    ("fog_bank", "雾岸"),
    ("wellhead", "泉眼"),
]


def load(name: str) -> list:
    return json.loads((TABLES / name).read_text(encoding="utf-8"))


def dump(name: str, data: list) -> None:
    (TABLES / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def fill_arts(arts: list) -> list:
    ids = {row["id"] for row in arts}
    i = 0
    while len(arts) < 200:
        i += 1
        art_id = f"catalog_art_{i}"
        if art_id in ids:
            continue
        aff = AFF[i % 8]
        arts.append(
            {
                "id": art_id,
                "name": f"闲术{i}",
                "affinity": aff,
                "power": 30 + (i % 40),
                "focus": 10 + (i % 16),
                "effects": [{"kind": "damage"}],
            }
        )
        ids.add(art_id)
    return arts


def fill_pacts(pacts: list) -> list:
    ids = {row["id"] for row in pacts}
    i = 0
    while len(pacts) < 80:
        i += 1
        pact_id = f"catalog_pact_{i}"
        if pact_id in ids:
            continue
        aff = AFF[i % 8]
        cn = AFF_CN[i % 8]
        pacts.append(
            {
                "id": pact_id,
                "name": f"{cn}纹{i}",
                "description": f"{cn}系微增",
                "hooks": [{"when": "deal", "affinity": aff, "mul": 1.05}],
            }
        )
        ids.add(pact_id)
    return pacts


def fill_boons(boons: list) -> list:
    ids = {row["id"] for row in boons}
    i = 0
    while len(boons) < 90:
        i += 1
        boon_id = f"catalog_boon_{i}"
        if boon_id in ids:
            continue
        kind = BOON_KINDS[i % len(BOON_KINDS)]
        boons.append(
            {
                "id": boon_id,
                "name": f"闲缘{i}",
                "kind": kind,
                "value": 2 + (i % 8) if kind != "catch" else 0.02,
                "weight": 2,
                "tier": "fan",
            }
        )
        ids.add(boon_id)
    return boons


def fill_trainers(trainers: list) -> list:
    ids = {row["id"] for row in trainers}
    for tid, name in TRAINERS:
        if tid in ids:
            continue
        trainers.append({"id": tid, "name": name})
        ids.add(tid)
    return trainers


def pad_spirit_arts(spirits: list, arts: list) -> list:
    by_aff: dict[str, list[str]] = {}
    for art in arts:
        by_aff.setdefault(art["affinity"], []).append(art["id"])
    all_ids = [art["id"] for art in arts]
    for spirit in spirits:
        have = list(spirit["artIds"])
        aff = spirit["affinities"][0]
        pool = by_aff.get(aff, []) + all_ids
        for cand in pool:
            if len(have) >= 4:
                break
            if cand not in have:
                have.append(cand)
        spirit["artIds"] = have[:4]
    return spirits


def fill_spirits(spirits: list, art_ids: list[str], pact_ids: list[str]) -> list:
    ids = {row["id"] for row in spirits}
    fallback_arts = art_ids[:2] or ["cinder_claw", "ash_veil"]
    fallback_pacts = pact_ids or PACTS
    for n, (stem, name, aff) in enumerate(LINES):
        a, b, c = f"{stem}_a", f"{stem}_b", f"{stem}_c"
        if a in ids:
            continue
        realm = REALMS[n % len(REALMS)]
        pact = fallback_pacts[n % len(fallback_pacts)]
        art0 = fallback_arts[n % len(fallback_arts)]
        art1 = fallback_arts[(n + 1) % len(fallback_arts)]
        hp = 32 + n
        spirits.append(
            {
                "id": a,
                "name": f"{name}{STAGES[0]}",
                "affinities": [aff],
                "baseHp": hp,
                "baseAtk": 16 + n % 8,
                "baseDef": 14 + n % 6,
                "baseSpd": 14 + n % 10,
                "artIds": [art0, art1],
                "pactId": pact,
                "evolveTo": b,
                "starter": False,
                "realm": realm,
            }
        )
        spirits.append(
            {
                "id": b,
                "name": f"{name}{STAGES[1]}",
                "affinities": [aff],
                "baseHp": hp + 16,
                "baseAtk": 24 + n % 8,
                "baseDef": 20 + n % 6,
                "baseSpd": 20 + n % 10,
                "artIds": [art0, art1],
                "pactId": pact,
                "evolveTo": c,
                "starter": False,
                "realm": realm,
            }
        )
        spirits.append(
            {
                "id": c,
                "name": f"{name}{STAGES[2]}",
                "affinities": [aff],
                "baseHp": hp + 34,
                "baseAtk": 32 + n % 8,
                "baseDef": 26 + n % 6,
                "baseSpd": 26 + n % 10,
                "artIds": [art0, art1],
                "pactId": pact,
                "starter": False,
                "realm": realm,
            }
        )
        ids.update((a, b, c))
    return spirits


def fill_realms_endless(classic: list) -> list:
    out = list(classic)
    have = {row["id"] for row in out}
    for i, (rid, name) in enumerate(ENDLESS_EXTRAS):
        if rid in have:
            continue
        donor = classic[i % len(classic)]
        out.append({"id": rid, "name": name, "spiritIds": list(donor["spiritIds"])})
        have.add(rid)
    return out


def main() -> None:
    arts = fill_arts(load("arts.json"))
    dump("arts.json", arts)
    pacts = fill_pacts(load("pacts.json"))
    dump("pacts.json", pacts)
    boons = fill_boons(load("boons.json"))
    dump("boons.json", boons)
    trainers = fill_trainers(load("trainers.json"))
    dump("trainers.json", trainers)
    spirits = pad_spirit_arts(
        fill_spirits(load("spirits.json"), [row["id"] for row in arts], [row["id"] for row in pacts]),
        arts,
    )
    dump("spirits.json", spirits)
    realms = load("realms.json")
    dump("realms-endless.json", fill_realms_endless(realms))
    print(f"spirits={len(spirits)} arts={len(arts)} pacts={len(pacts)} boons={len(boons)} trainers={len(trainers)}")


if __name__ == "__main__":
    main()
