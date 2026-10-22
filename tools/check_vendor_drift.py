"""Rebuild the Cocos vendor bundles and fail if they differ from the committed files."""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VENDOR = ROOT / "assets" / "scripts" / "vendor"
HOOKS = ("forceOutcomeForTest", "openShopForTest")


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
            "pnpm",
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


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        core_out = tmp_path / "jinglingCore.ts"
        presentation_out = tmp_path / "jinglingPresentation.ts"
        _build(
            "@jingling/core",
            "src/creator-entry.ts",
            core_out,
            "/* generated from packages/core — do not edit */",
        )
        _build(
            "@jingling/presentation",
            "src/index.ts",
            presentation_out,
            "/* generated from packages/presentation — do not edit */",
        )
        assert_no_test_hooks(core_out.read_text(encoding="utf-8"))
        bundles_match(VENDOR / "jinglingCore.ts", core_out)
        bundles_match(VENDOR / "jinglingPresentation.ts", presentation_out)
    print("vendor bundles match")


if __name__ == "__main__":
    main()
