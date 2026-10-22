"""Refuse a main pack over 4MB or portraits shipped in the main pack."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIMIT = 4 * 1024 * 1024
SKIP_DIRS = {
    ".git",
    ".venv",
    "node_modules",
    "library",
    "temp",
    "dist",
    "remote",
    "subpackages",
    "__pycache__",
    ".pytest_cache",
}
PORTRAIT_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}
MAIN_ROOTS = ("assets", "game")
# 这些 assets 子目录是 Asset Bundle，构建后由 tools/pack_subpackages.py 变成小游戏分包，
# 所以不计入主包预算。必须真的带 isBundle 的 .meta，否则仍按主包资源处理。
SUBPACKAGE_BUNDLE_DIRS = ("portraits", "ui-art")


def _subpackage_dirs(root: Path) -> set[Path]:
    dirs: set[Path] = set()
    for name in SUBPACKAGE_BUNDLE_DIRS:
        folder = root / "assets" / name
        meta = root / "assets" / f"{name}.meta"
        if not folder.is_dir() or not meta.is_file():
            continue
        try:
            payload = json.loads(meta.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError):
            continue
        user_data = payload.get("userData") if isinstance(payload, dict) else None
        if isinstance(user_data, dict) and user_data.get("isBundle") is True:
            dirs.add(folder)
    return dirs


def _should_skip(path: Path, root: Path) -> bool:
    try:
        parts = set(path.relative_to(root).parts)
    except ValueError:
        parts = set(path.parts)
    return bool(parts & SKIP_DIRS)


def iter_main_files(root: Path) -> list[Path]:
    files: list[Path] = []
    skip_roots = _subpackage_dirs(root)
    for name in MAIN_ROOTS:
        base = root / name
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if not path.is_file():
                continue
            if _should_skip(path, root):
                continue
            if any(path.is_relative_to(folder) for folder in skip_roots):
                continue
            files.append(path)
    return files


def measure_main_pack(root: Path) -> int:
    return sum(path.stat().st_size for path in iter_main_files(root))


def check_tree(root: Path) -> int:
    files = iter_main_files(root)
    portraits = [path for path in files if path.suffix.lower() in PORTRAIT_SUFFIXES]
    if portraits:
        shown = portraits[0].relative_to(root)
        raise ValueError(f"portrait {shown} must stay on cdn, not in the main pack")
    total = sum(path.stat().st_size for path in files)
    if total > LIMIT:
        raise ValueError(f"main pack {total} bytes exceeds 4MB")
    return total


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    try:
        total = check_tree(args.root)
    except ValueError as exc:
        print(exc)
        return 1
    print(f"main pack {total} bytes (limit {LIMIT})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
