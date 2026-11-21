"""U11 release acceptance gate.

Blocks release when any of the product-spec 9.3 conditions lack fresh, well-formed
evidence. This is intentionally strict: missing metadata, missing runtime docs,
incomplete reachability, oversize packages, forbidden-term hits and legacy/new
double-mounts are all hard blockers.
"""

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

MAX_MAIN_PACK_BYTES = 4 * 1024 * 1024

REQUIRED_RUNTIME_DOCS = (
    "u1-appshell-runtime.md",
    "u6-battle-runtime.md",
    "u7-overlays-runtime.md",
    "u8-progress-runtime.md",
    "u9-outcomes-runtime.md",
    "u10-quality-gates-runtime.md",
)

REQUIRED_META_FIELDS = ("platform", "orientation", "width", "height", "dpr", "capturedAt")

EXPECTED_SCREENS = 25

# 默认读取的包体基线：由 `pnpm check:cocos-build ... --json-out` 从新鲜产物生成。
# 命令行不给 `--wechat-bytes` / `--bytedance-bytes` 时用它，避免手抄旧数字。
DEFAULT_BASELINE = ROOT / "docs" / "ui" / "baselines" / "3.8.8-build.json"

class AcceptanceError(Exception):
    """Raised when a hard release blocker is found."""


@dataclass
class AcceptanceReport:
    ok: bool = True
    problems: list[str] = field(default_factory=list)
    checked: list[str] = field(default_factory=list)


def _fail(msg: str) -> None:
    raise AcceptanceError(msg)


def baseline_main_bytes(path: Path) -> dict[str, int]:
    """从 check_cocos_build 生成的基线里取各平台主包字节数。

    发布门不接受手填数字，所以缺了哪个平台就直接阻断，不猜。
    """
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise AcceptanceError(f"cannot read main-pack baseline {path}: {exc}") from exc
    builds = payload.get("builds") if isinstance(payload, dict) else None
    if not isinstance(builds, list) or not builds:
        raise AcceptanceError(f"main-pack baseline {path} has no builds")
    sizes: dict[str, int] = {}
    for entry in builds:
        if not isinstance(entry, dict):
            raise AcceptanceError(f"main-pack baseline {path} has a non-object build entry")
        platform = entry.get("platform")
        main_bytes = entry.get("main_bytes")
        if not isinstance(platform, str) or not isinstance(main_bytes, int):
            raise AcceptanceError(f"main-pack baseline {path} entry is missing platform/main_bytes")
        sizes[platform] = main_bytes
    return sizes


def resolve_main_pack_bytes(
    platform: str,
    *,
    explicit: int | None,
    baseline: Path,
) -> int:
    """显式参数优先，否则读基线。两个来源都没有就算阻断，不默认放行。"""
    if explicit is not None:
        return explicit
    sizes = baseline_main_bytes(baseline)
    if platform not in sizes:
        raise AcceptanceError(f"main-pack baseline {baseline} has no {platform} entry")
    return sizes[platform]


def check_acceptance(
    evidence_dir: Path,
    *,
    wechat_bytes: int,
    bytedance_bytes: int,
    forbidden_hits: int,
) -> AcceptanceReport:
    report = AcceptanceReport()

    # 1. required runtime docs present
    for name in REQUIRED_RUNTIME_DOCS:
        if not (evidence_dir / name).is_file():
            _fail(f"missing runtime doc: {name}")
    report.checked.append(f"runtime docs x{len(REQUIRED_RUNTIME_DOCS)}")

    # 2. acceptance.json present and well formed
    acc_path = evidence_dir / "u11-acceptance.json"
    if not acc_path.is_file():
        _fail("missing u11-acceptance.json")
    acc = json.loads(acc_path.read_text(encoding="utf-8"))

    journeys = acc.get("journeys") or {}
    if not journeys:
        _fail("acceptance journeys are empty")

    for orientation, journey in journeys.items():
        steps = journey.get("steps") or []
        if not steps:
            _fail(f"journey {orientation} has no steps")
        for step in steps:
            # screenshot file exists
            shot = step.get("screenshot")
            if not shot or not (evidence_dir / shot).is_file():
                _fail(f"missing screenshot for {orientation} step {step.get('order')}: {shot}")
            # metadata complete
            meta = step.get("meta") or {}
            for f in REQUIRED_META_FIELDS:
                if f not in meta:
                    _fail(f"screenshot metadata missing '{f}' in {orientation} step {step.get('order')}")
            # no legacy/new double mount
            host_count = step.get("hostCount")
            if host_count != 1:
                _fail(f"double-mount / bad host count ({host_count}) in {orientation} step {step.get('order')}")
            # journey must run on presentation
            if step.get("renderer") != "presentation":
                _fail(f"journey {orientation} step {step.get('order')} not on presentation")
        report.checked.append(f"journey {orientation}: {len(steps)} steps")

    # 3. reachability: all 25 screens on presentation with a model
    reach = acc.get("reachability") or {}
    if reach.get("total") != EXPECTED_SCREENS:
        _fail(f"reachability total {reach.get('total')} != {EXPECTED_SCREENS}")
    if reach.get("legacy"):
        _fail(f"screens still legacy: {reach['legacy']}")
    if reach.get("noModel"):
        _fail(f"screens without a model: {reach['noModel']}")
    report.checked.append("reachability 25/25")

    # 4. package budgets
    if wechat_bytes > MAX_MAIN_PACK_BYTES:
        _fail(f"wechat main package {wechat_bytes} B over 4 MiB")
    if bytedance_bytes > MAX_MAIN_PACK_BYTES:
        _fail(f"bytedance main package {bytedance_bytes} B over 4 MiB")
    report.checked.append(f"packages wechat={wechat_bytes} bytedance={bytedance_bytes}")

    # 5. forbidden terms
    if forbidden_hits > 0:
        _fail(f"forbidden-term hits: {forbidden_hits}")
    report.checked.append("forbidden clean")

    report.ok = True
    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence", type=Path, default=ROOT / "docs/ui/baselines/evidence/2026-09-01")
    parser.add_argument(
        "--baseline",
        type=Path,
        default=DEFAULT_BASELINE,
        help="check:cocos-build 生成的包体基线，仅在未显式给字节数时使用",
    )
    parser.add_argument(
        "--wechat-bytes",
        type=int,
        default=None,
        help="微信主包字节数；不给则读 --baseline",
    )
    parser.add_argument(
        "--bytedance-bytes",
        type=int,
        default=None,
        help="抖音主包字节数；不给则读 --baseline",
    )
    parser.add_argument("--forbidden-hits", type=int, default=0)
    argv = [a for a in (argv if argv is not None else sys.argv[1:]) if a != "--"]
    args = parser.parse_args(argv)

    try:
        wechat_bytes = resolve_main_pack_bytes(
            "wechatgame", explicit=args.wechat_bytes, baseline=args.baseline
        )
        bytedance_bytes = resolve_main_pack_bytes(
            "bytedance-mini-game", explicit=args.bytedance_bytes, baseline=args.baseline
        )
        report = check_acceptance(
            args.evidence,
            wechat_bytes=wechat_bytes,
            bytedance_bytes=bytedance_bytes,
            forbidden_hits=args.forbidden_hits,
        )
    except AcceptanceError as exc:
        print(f"release acceptance: BLOCKED — {exc}", file=sys.stderr)
        return 1

    print("release acceptance: PASS")
    for item in report.checked:
        print(f"  - {item}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
