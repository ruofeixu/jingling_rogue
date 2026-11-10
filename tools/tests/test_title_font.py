from __future__ import annotations

from pathlib import Path

import pytest

from title_font import collect_ui_chars, missing_glyphs

pytest.importorskip("fontTools")

ROOT = Path(__file__).resolve().parents[2]
FONT = ROOT / "assets/ui-art/fonts/title.ttf"


def test_collects_cjk_from_tables_and_ui_source_but_not_tests(tmp_path: Path) -> None:
    (tmp_path / "packages/core/src/tables").mkdir(parents=True)
    (tmp_path / "packages/core/src/tables/a.json").write_text('{"name": "灶狸"}', encoding="utf-8")
    (tmp_path / "packages/presentation/src").mkdir(parents=True)
    (tmp_path / "packages/presentation/src/x.ts").write_text('const a = "出术";', encoding="utf-8")
    (tmp_path / "packages/presentation/src/x.test.ts").write_text('const b = "测试专用";', encoding="utf-8")

    chars = collect_ui_chars(tmp_path)

    assert {"灶", "狸", "出", "术"} <= chars
    assert "测" not in chars


def test_shipped_font_covers_every_ui_character() -> None:
    # 界面统一用书法字：任何界面文案用到子集外的字，就会在游戏里显示成系统字体。
    missing = missing_glyphs(FONT, collect_ui_chars(ROOT))
    assert missing == "", f"rerun: uv run --project tools --extra font python tools/title_font.py  (missing: {missing})"
