"""Reject catalog rows that miss fields or point at unknown ids."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TABLES = ROOT / "packages/core/src/tables"

SPIRIT_FIELDS = {
    "id",
    "name",
    "affinities",
    "baseHp",
    "baseAtk",
    "baseDef",
    "baseSpd",
    "artIds",
    "pactId",
    "starter",
    "realm",
}
ART_FIELDS = {"id", "name", "affinity", "power", "focus", "effects"}
PACT_FIELDS = {"id", "name", "description"}
BOON_FIELDS = {"id", "name", "kind", "value", "weight"}
REALM_FIELDS = {"id", "name", "spiritIds"}


def _load(tables: Path, name: str) -> list:
    return json.loads((tables / name).read_text(encoding="utf-8"))


def _require(row: dict, fields: set[str], kind: str) -> None:
    missing = fields - set(row)
    if missing:
        raise ValueError(f"missing {kind} fields {sorted(missing)} on {row.get('id')}")


def validate_tables(tables: Path) -> None:
    arts = _load(tables, "arts.json")
    pacts = _load(tables, "pacts.json")
    boons = _load(tables, "boons.json")
    realms = _load(tables, "realms.json")
    spirits = _load(tables, "spirits.json")
    art_ids = {row["id"] for row in arts}
    pact_ids = {row["id"] for row in pacts}
    realm_ids = {row["id"] for row in realms}
    for row in arts:
        _require(row, ART_FIELDS, "art")
    for row in pacts:
        _require(row, PACT_FIELDS, "pact")
    for row in boons:
        _require(row, BOON_FIELDS, "boon")
    for row in realms:
        _require(row, REALM_FIELDS, "realm")
    for row in spirits:
        _require(row, SPIRIT_FIELDS, "spirit")
        for art_id in row["artIds"]:
            if art_id not in art_ids:
                raise ValueError(f"unknown art {art_id} on {row['id']}")
        if row["pactId"] not in pact_ids:
            raise ValueError(f"unknown pact {row['pactId']} on {row['id']}")
        if row["realm"] not in realm_ids:
            raise ValueError(f"unknown realm {row['realm']} on {row['id']}")


def main() -> int:
    try:
        validate_tables(TABLES)
    except ValueError as exc:
        print(f"catalog invalid: {exc}")
        return 1
    print("catalog valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
