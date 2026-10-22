from __future__ import annotations

from pathlib import Path

import pytest

from check_forbidden import scan_text, scan_tree


def test_scan_text_flags_pokemon() -> None:
    hits = scan_text("hello pokemon world", Path("sample.ts"))
    assert any(h.term == "pokemon" for h in hits)


def test_scan_text_allows_scene_and_phase() -> None:
    hits = scan_text("FlowStep uses a phase queue in the scene.", Path("ok.ts"))
    assert hits == []


def test_scan_text_flags_poke_as_word() -> None:
    hits = scan_text("use a poke here", Path("sample.ts"))
    assert any(h.term == "poke" for h in hits)


def test_scan_text_does_not_flag_spoken() -> None:
    hits = scan_text("the spoken line is fine", Path("ok.ts"))
    assert hits == []


def test_scan_tree_skips_docs_and_fixtures(tmp_path: Path) -> None:
    (tmp_path / "docs").mkdir()
    (tmp_path / "docs" / "note.md").write_text("pokemon", encoding="utf-8")
    pkg = tmp_path / "packages" / "core"
    pkg.mkdir(parents=True)
    (pkg / "ok.ts").write_text("export const name = 'zao_li'\n", encoding="utf-8")
    (pkg / "bad.fixture.ts").write_text("pokemon\n", encoding="utf-8")
    hits = scan_tree(tmp_path)
    assert hits == []


def test_scan_tree_finds_source_hit(tmp_path: Path) -> None:
    pkg = tmp_path / "packages" / "core"
    pkg.mkdir(parents=True)
    (pkg / "bad.ts").write_text("export class BattleScene {}\n", encoding="utf-8")
    hits = scan_tree(tmp_path)
    assert any(h.term == "battlescene" for h in hits)


def test_current_repo_is_clean() -> None:
    from check_forbidden import ROOT

    assert scan_tree(ROOT) == []
