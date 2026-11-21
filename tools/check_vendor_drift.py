"""Rebuild the Cocos vendor bundles and fail if they differ from the committed files."""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PNPM = shutil.which("pnpm") or "pnpm"
VENDOR = ROOT / "assets" / "scripts" / "vendor"
HOOKS = ("forceOutcomeForTest", "openShopForTest")
CORE_BANNER = "/* generated from packages/core — do not edit */"
PRESENTATION_BANNER = "/* generated from packages/presentation — do not edit */"


def bundles_match(committed: Path, rebuilt: Path) -> None:
    if committed.read_bytes() != rebuilt.read_bytes():
        raise SystemExit(f"vendor drift: {committed.name} does not match a fresh build; run pnpm sync:core and pnpm sync:presentation")


def assert_no_test_hooks(text: str) -> None:
    for name in HOOKS:
        if name in text:
            raise SystemExit(f"shipping bundle contains test hook {name}")


def _build(package: str, entry: str, outfile: Path, banner: str) -> None:
    subprocess.run(
        [
            PNPM,
            "--filter",
            package,
            "exec",
            "esbuild",
            entry,
            "--bundle",
            "--format=esm",
            "--platform=neutral",
            f"--outfile={outfile}",
            f"--banner:js={banner}",
        ],
        cwd=ROOT,
        check=True,
    )


def build_core(outfile: Path) -> Path:
    """把 @jingling/core 打成一个 bundle。走 argv 列表，不经过 shell，Windows 上行为一致。"""
    _build("@jingling/core", "src/creator-entry.ts", outfile, CORE_BANNER)
    return outfile


def build_presentation(outfile: Path) -> Path:
    """把 @jingling/presentation 打成一个 bundle。同上。"""
    _build("@jingling/presentation", "src/index.ts", outfile, PRESENTATION_BANNER)
    return outfile


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        core_out = build_core(tmp_path / "jinglingCore.ts")
        presentation_out = build_presentation(tmp_path / "jinglingPresentation.ts")
        assert_no_test_hooks(core_out.read_text(encoding="utf-8"))
        bundles_match(VENDOR / "jinglingCore.ts", core_out)
        bundles_match(VENDOR / "jinglingPresentation.ts", presentation_out)
    print("vendor bundles match")


if __name__ == "__main__":
    main()
