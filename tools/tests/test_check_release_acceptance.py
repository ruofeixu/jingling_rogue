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
    main,
    resolve_main_pack_bytes,
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
    acc = json.loads((ev / "u11-acceptance.json").read_text(encoding="utf-8"))
    del acc["journeys"]["portrait"]["steps"][0]["meta"]["dpr"]
    (ev / "u11-acceptance.json").write_text(json.dumps(acc))
    with pytest.raises(AcceptanceError, match="metadata"):
        check_acceptance(ev, wechat_bytes=1, bytedance_bytes=1, forbidden_hits=0)


def test_missing_screenshot_file_blocks(tmp_path):
    ev = _valid_acceptance(tmp_path)
    step = json.loads((ev / "u11-acceptance.json").read_text(encoding="utf-8"))["journeys"]["portrait"]["steps"][0]
    (ev / step["screenshot"]).unlink()
    with pytest.raises(AcceptanceError, match="screenshot"):
        check_acceptance(ev, wechat_bytes=1, bytedance_bytes=1, forbidden_hits=0)


def test_incomplete_reachability_blocks(tmp_path):
    ev = _valid_acceptance(tmp_path)
    acc = json.loads((ev / "u11-acceptance.json").read_text(encoding="utf-8"))
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
    acc = json.loads((ev / "u11-acceptance.json").read_text(encoding="utf-8"))
    acc["journeys"]["portrait"]["steps"][0]["hostCount"] = 2
    (ev / "u11-acceptance.json").write_text(json.dumps(acc))
    with pytest.raises(AcceptanceError, match="mount|host"):
        check_acceptance(ev, wechat_bytes=1, bytedance_bytes=1, forbidden_hits=0)


# --- 包体数字来源：pnpm check:release 不带 --*-bytes 时必须自己读基线 ---


def _baseline(tmp_path: Path, builds: list[dict]) -> Path:
    path = tmp_path / "baseline.json"
    path.write_text(json.dumps({"builds": builds}, ensure_ascii=False), encoding="utf-8")
    return path


def _build_entry(platform: str, main_bytes: int) -> dict:
    return {"platform": platform, "main_bytes": main_bytes}


def test_resolve_bytes_reads_baseline_when_not_given(tmp_path):
    path = _baseline(
        tmp_path,
        [_build_entry("wechatgame", 111), _build_entry("bytedance-mini-game", 222)],
    )

    assert resolve_main_pack_bytes("wechatgame", explicit=None, baseline=path) == 111
    assert resolve_main_pack_bytes("bytedance-mini-game", explicit=None, baseline=path) == 222


def test_resolve_bytes_prefers_explicit_flag(tmp_path):
    path = _baseline(tmp_path, [_build_entry("wechatgame", 111)])

    assert resolve_main_pack_bytes("wechatgame", explicit=999, baseline=path) == 999


def test_resolve_bytes_blocks_when_platform_missing(tmp_path):
    path = _baseline(tmp_path, [_build_entry("wechatgame", 111)])

    with pytest.raises(AcceptanceError, match="no bytedance"):
        resolve_main_pack_bytes("bytedance-mini-game", explicit=None, baseline=path)


def test_resolve_bytes_blocks_when_baseline_missing(tmp_path):
    with pytest.raises(AcceptanceError, match="cannot read"):
        resolve_main_pack_bytes("wechatgame", explicit=None, baseline=tmp_path / "nope.json")


def test_resolve_bytes_blocks_on_malformed_baseline_entry(tmp_path):
    path = _baseline(tmp_path, [{"platform": "wechatgame"}])

    with pytest.raises(AcceptanceError, match="platform/main_bytes"):
        resolve_main_pack_bytes("wechatgame", explicit=None, baseline=path)


def test_main_runs_without_pack_byte_flags(tmp_path):
    ev = _valid_acceptance(tmp_path)
    path = _baseline(
        tmp_path,
        [_build_entry("wechatgame", 1000), _build_entry("bytedance-mini-game", 1000)],
    )

    assert main(["--evidence", str(ev), "--baseline", str(path)]) == 0


def test_main_blocks_on_oversize_baseline(tmp_path, capsys):
    ev = _valid_acceptance(tmp_path)
    path = _baseline(
        tmp_path,
        [
            _build_entry("wechatgame", 4 * 1024 * 1024 + 1),
            _build_entry("bytedance-mini-game", 1000),
        ],
    )

    assert main(["--evidence", str(ev), "--baseline", str(path)]) == 1
    assert "BLOCKED" in capsys.readouterr().err
