from __future__ import annotations

import importlib.util
from pathlib import Path
from types import ModuleType

ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "tools" / "check_ui_productization.py"


def load_module() -> ModuleType:
    assert MODULE_PATH.exists(), "U0 productization auditor must exist"
    spec = importlib.util.spec_from_file_location("check_ui_productization", MODULE_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_repo_matrix_covers_core_screens_tour_and_keyframes() -> None:
    module = load_module()
    report = module.audit_productization(ROOT)

    assert report.missing_screens == []
    assert report.missing_tour_stops == []
    assert report.missing_keyframes == []
    assert report.invalid_keyframes == []
    assert report.invalid_matrix_entries == []
    assert report.matrix_count >= 24


def test_required_keyframes_are_original_portrait_svg_artifacts() -> None:
    module = load_module()
    report = module.audit_productization(ROOT)

    assert report.keyframe_count == 3
    assert report.invalid_keyframes == []
    for name in ("title", "starter", "battle"):
        body = (ROOT / "docs" / "ui" / "keyframes" / f"{name}.svg").read_text()
        assert 'viewBox="0 0 750 1334"' in body
        assert "<image" not in body
        assert 'href="http://' not in body
        assert 'href="https://' not in body


def test_screen_matrix_has_five_states_and_matches_roadmap_phases() -> None:
    import json

    entries = json.loads((ROOT / "docs" / "ui" / "screen-matrix.json").read_text())
    required_states = {"normal", "loading", "empty", "error", "locked"}
    expected_phases = {
        "title": "U3", "mode": "U3",
        "settings": "U4", "codex-list": "U4", "codex-entry": "U4",
        "eggs": "U4", "achievements": "U4", "stats": "U4",
        "slots": "U4", "glossary": "U4",
        "starter": "U5",
        "battle": "U6",
        "arts": "U7", "switch": "U7", "party": "U7", "bag": "U7",
        "target": "U7", "catch": "U7",
        "summary": "U8", "shop": "U8", "omen": "U8", "map": "U8",
        "defeat": "U9", "victory": "U9", "hatch": "U9",
    }

    assert len(entries) == len(expected_phases)
    for entry in entries:
        assert required_states <= set(entry["states"]), entry["id"]
        assert entry["phase"] == expected_phases[entry["id"]]
