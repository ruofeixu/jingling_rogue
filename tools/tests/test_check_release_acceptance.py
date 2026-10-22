"""Failing-first tests for the U11 release acceptance gate.

These build deliberately broken fixtures and assert the checker blocks them,
then assert the real evidence tree passes. Not only happy-path.
"""

import json
from pathlib import Path

import pytest

from check_release_acceptance import (
    AcceptanceError,
    check_acceptance,
)

ROOT = Path(__file__).resolve().parent.parent.parent
EVIDENCE = ROOT / "docs/ui/baselines/evidence/2026-09-01"


def _valid_acceptance(tmp_path: Path) -> Path:
    """Write a minimally valid evidence tree into tmp_path and return it."""
    ev = tmp_path / "evidence"
    ev.mkdir()
    # required runtime docs
    for name in (
        "u1-appshell-runtime.md",
        "u6-battle-runtime.md",
        "u7-overlays-runtime.md",
        "u8-progress-runtime.md",
        "u9-outcomes-runtime.md",
        "u10-quality-gates-runtime.md",
    ):
        (ev / name).write_text("evidence", encoding="utf-8")
    steps = [
        {
            "order": i + 1,
            "route": r,
            "renderer": "presentation",
            "state": "normal",
            "hostCount": 1,
            "screenshot": f"u11-journey-portrait-{i + 1:02d}-{r}.png",
            "meta": {
                "platform": "web-mobile",
                "orientation": "portrait",
                "width": 750,
                "height": 1334,
                "dpr": 2,
                "capturedAt": "2026-09-01T00:00:00Z",
            },
        }
        for i, r in enumerate(
            ["title", "mode", "starter", "battle", "summary", "map", "victory", "title"]
        )
    ]
    for s in steps:
        (ev / s["screenshot"]).write_bytes(b"\x89PNG\r\n")
    acc = {
        "generatedAt": "2026-09-01T00:00:00Z",
        "journeys": {"portrait": {"orientation": "portrait", "steps": steps}},
        "reachability": {"total": 25, "legacy": [], "noModel": []},
    }
    (ev / "u11-acceptance.json").write_text(json.dumps(acc), encoding="utf-8")
    return ev


def test_valid_tree_passes(tmp_path):
    ev = _valid_acceptance(tmp_path)
    report = check_acceptance(ev, wechat_bytes=3_377_874, bytedance_bytes=3_490_075, forbidden_hits=0)
    assert report.ok, report.problems


def test_missing_runtime_doc_blocks(tmp_path):
    ev = _valid_acceptance(tmp_path)
    (ev / "u9-outcomes-runtime.md").unlink()
    with pytest.raises(AcceptanceError, match="u9-outcomes-runtime"):
        check_acceptance(ev, wechat_bytes=1, bytedance_bytes=1, forbidden_hits=0)


def test_missing_screenshot_metadata_blocks(tmp_path):
    ev = _valid_acceptance(tmp_path)
    acc = json.loads((ev / "u11-acceptance.json").read_text())
    del acc["journeys"]["portrait"]["steps"][0]["meta"]["dpr"]
    (ev / "u11-acceptance.json").write_text(json.dumps(acc))
    with pytest.raises(AcceptanceError, match="metadata"):
        check_acceptance(ev, wechat_bytes=1, bytedance_bytes=1, forbidden_hits=0)


def test_missing_screenshot_file_blocks(tmp_path):
    ev = _valid_acceptance(tmp_path)
    step = json.loads((ev / "u11-acceptance.json").read_text())["journeys"]["portrait"]["steps"][0]
    (ev / step["screenshot"]).unlink()
    with pytest.raises(AcceptanceError, match="screenshot"):
        check_acceptance(ev, wechat_bytes=1, bytedance_bytes=1, forbidden_hits=0)


def test_incomplete_reachability_blocks(tmp_path):
    ev = _valid_acceptance(tmp_path)
    acc = json.loads((ev / "u11-acceptance.json").read_text())
    acc["reachability"]["legacy"] = ["battle"]
    (ev / "u11-acceptance.json").write_text(json.dumps(acc))
    with pytest.raises(AcceptanceError, match="legacy|reachab"):
        check_acceptance(ev, wechat_bytes=1, bytedance_bytes=1, forbidden_hits=0)


def test_oversize_main_package_blocks(tmp_path):
    ev = _valid_acceptance(tmp_path)
    with pytest.raises(AcceptanceError, match="4 MiB|package"):
        check_acceptance(ev, wechat_bytes=4 * 1024 * 1024 + 1, bytedance_bytes=1, forbidden_hits=0)


def test_forbidden_term_hit_blocks(tmp_path):
    ev = _valid_acceptance(tmp_path)
    with pytest.raises(AcceptanceError, match="forbidden|禁用"):
        check_acceptance(ev, wechat_bytes=1, bytedance_bytes=1, forbidden_hits=3)


def test_double_mount_blocks(tmp_path):
    ev = _valid_acceptance(tmp_path)
    acc = json.loads((ev / "u11-acceptance.json").read_text())
    acc["journeys"]["portrait"]["steps"][0]["hostCount"] = 2
    (ev / "u11-acceptance.json").write_text(json.dumps(acc))
    with pytest.raises(AcceptanceError, match="mount|host"):
        check_acceptance(ev, wechat_bytes=1, bytedance_bytes=1, forbidden_hits=0)
