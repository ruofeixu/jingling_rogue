from __future__ import annotations

from pathlib import Path

import pytest

from validate_catalog import validate_tables


def test_missing_spirit_field_is_rejected(tmp_path: Path) -> None:
    tables = tmp_path / "tables"
    tables.mkdir()
    (tables / "spirits.json").write_text('[{"id": "x", "name": "缺"}]\n', encoding="utf-8")
    (tables / "arts.json").write_text("[]\n", encoding="utf-8")
    (tables / "pacts.json").write_text("[]\n", encoding="utf-8")
    (tables / "boons.json").write_text("[]\n", encoding="utf-8")
    (tables / "realms.json").write_text("[]\n", encoding="utf-8")
    with pytest.raises(ValueError, match="missing"):
        validate_tables(tables)


def test_repo_catalog_is_complete() -> None:
    root = Path(__file__).resolve().parent.parent.parent
    validate_tables(root / "packages/core/src/tables")
