from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TERMS_PATH = Path(__file__).resolve().parent / "forbidden-terms.json"

SCAN_DIRS = ("packages", "game", "server", "tools")
SKIP_DIR_NAMES = {
    ".git",
    ".venv",
    "node_modules",
    "dist",
    "__pycache__",
    ".pytest_cache",
    "tests",
}
SKIP_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".wav", ".mp3", ".bin"}
TEXT_SUFFIXES = {
    ".ts",
    ".tsx",
    ".js",
    ".json",
    ".py",
    ".md",
    ".toml",
    ".yaml",
    ".yml",
    ".html",
    ".css",
    ".scene",
    ".plist",
}


@dataclass(frozen=True)
class Hit:
    term: str
    path: Path
    line: int


def load_terms() -> tuple[list[str], list[str]]:
    data = json.loads(TERMS_PATH.read_text(encoding="utf-8"))
    return list(data["terms"]), list(data.get("wordBoundaries", []))


def _normalize_line(line: str) -> str:
    return line.lower()


def scan_text(text: str, path: Path) -> list[Hit]:
    terms, word_terms = load_terms()
    hits: list[Hit] = []
    for i, raw in enumerate(text.splitlines(), start=1):
        line = _normalize_line(raw)
        collapsed = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "", line)
        for term in terms:
            needle = term.lower()
            if " " in needle:
                if needle in line:
                    hits.append(Hit(term=term, path=path, line=i))
            elif re.search(r"[\u4e00-\u9fff]", needle):
                if needle in line:
                    hits.append(Hit(term=needle, path=path, line=i))
            else:
                if needle in collapsed or re.search(rf"\b{re.escape(needle)}\b", line):
                    hits.append(Hit(term=needle, path=path, line=i))
        for term in word_terms:
            if re.search(rf"\b{re.escape(term.lower())}\b", line):
                hits.append(Hit(term=term, path=path, line=i))
    return hits


def _should_skip(path: Path, root: Path) -> bool:
    try:
        rel = path.relative_to(root)
    except ValueError:
        rel = path
    parts = set(rel.parts)
    if "docs" in rel.parts:
        return True
    if parts & SKIP_DIR_NAMES:
        return True
    if path.name == "forbidden-terms.json":
        return True
    if ".fixture." in path.name:
        return True
    if path.name.endswith(".test.ts") or path.name.startswith("test_"):
        return True
    return False


def iter_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for name in SCAN_DIRS:
        base = root / name
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if not path.is_file():
                continue
            if _should_skip(path, root):
                continue
            if path.suffix.lower() in SKIP_SUFFIXES:
                continue
            if path.suffix.lower() not in TEXT_SUFFIXES and path.suffix:
                continue
            files.append(path)
    return files


def scan_tree(root: Path) -> list[Hit]:
    hits: list[Hit] = []
    for path in iter_files(root):
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        hits.extend(scan_text(text, path))
    return hits


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    hits = scan_tree(args.root)
    if not hits:
        print("forbidden-term scan: clean")
        return 0
    for hit in hits:
        print(f"{hit.path}:{hit.line}: forbidden term `{hit.term}`")
    return 1


if __name__ == "__main__":
    sys.exit(main())
