"""Build and check the brush-font subset that the whole UI uses (Ma Shan Zheng, SIL OFL 1.1).

The subset holds every CJK character and CJK punctuation mark that can reach the screen:
strings in packages/core/src/tables/*.json plus string literals in non-test UI source.

Usage:
  # rebuild the subset after adding UI copy (needs the full font, see --source):
  uv run --project tools --extra font python tools/title_font.py --source /path/to/MaShanZheng-Regular.ttf
  # check only:
  uv run --project tools --extra font python tools/title_font.py --check
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "assets/ui-art/fonts/title.ttf"
PUNCT = "，。、：；！？「」『』（）《》…—•"
SOURCE_DIRS = (
    "packages/core/src/ui",
    "packages/core/src/run",
    "packages/presentation/src",
    "assets/scripts/app",
)
LITERAL = re.compile(r'"([^"\n]*)"|`([^`]*)`|\'([^\'\n]*)\'')


def _keep(ch: str) -> bool:
    return "一" <= ch <= "鿿" or ch in PUNCT


def _walk(value: object, out: set[str]) -> None:
    if isinstance(value, str):
        out.update(ch for ch in value if _keep(ch))
    elif isinstance(value, dict):
        for item in value.values():
            _walk(item, out)
    elif isinstance(value, list):
        for item in value:
            _walk(item, out)


def collect_ui_chars(root: Path) -> set[str]:
    chars: set[str] = set()
    tables = root / "packages/core/src/tables"
    if tables.is_dir():
        for path in sorted(tables.glob("*.json")):
            _walk(json.loads(path.read_text(encoding="utf-8")), chars)
    for rel in SOURCE_DIRS:
        base = root / rel
        if not base.is_dir():
            continue
        for path in sorted(base.rglob("*.ts")):
            if ".test." in path.name or "vendor" in path.parts:
                continue
            for match in LITERAL.finditer(path.read_text(encoding="utf-8")):
                text = next(group for group in match.groups() if group is not None)
                chars.update(ch for ch in text if _keep(ch))
    return chars


def missing_glyphs(font_path: Path, chars: set[str]) -> str:
    from fontTools.ttLib import TTFont

    cmap = TTFont(str(font_path)).getBestCmap()
    return "".join(sorted(ch for ch in chars if ord(ch) not in cmap))


def build_subset(source: Path, out: Path, chars: set[str]) -> int:
    from fontTools import subset
    from fontTools.ttLib import TTFont

    text = "".join(sorted(chars)) + "".join(chr(code) for code in range(0x20, 0x7F))
    font = TTFont(str(source))
    options = subset.Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    out.parent.mkdir(parents=True, exist_ok=True)
    font.save(str(out))
    return out.stat().st_size


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, help="full MaShanZheng-Regular.ttf to subset from")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args(argv)
    chars = collect_ui_chars(ROOT)
    if args.source:
        size = build_subset(args.source, FONT, chars)
        print(f"wrote {FONT.relative_to(ROOT)} ({size} B, {len(chars)} chars)")
    missing = missing_glyphs(FONT, chars)
    if missing:
        print(f"missing glyphs: {missing}", file=sys.stderr)
        return 1
    print(f"ok: {len(chars)} UI chars covered")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
