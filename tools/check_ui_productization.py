"""Audit UI screen, tour, and keyframe productization coverage."""

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import NamedTuple
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent.parent
REQUIRED_KEYFRAMES = ("title", "starter", "battle")
REQUIRED_MATRIX_FIELDS = {
    "id",
    "screen",
    "kind",
    "states",
    "primaryTask",
    "demo",
    "phase",
}

REQUIRED_STATES = {"normal", "loading", "empty", "error", "locked"}
EXPECTED_PHASES = {
    "title": "U3",
    "mode": "U3",
    "settings": "U4",
    "codex-list": "U4",
    "codex-entry": "U4",
    "eggs": "U4",
    "achievements": "U4",
    "stats": "U4",
    "slots": "U4",
    "glossary": "U4",
    "starter": "U5",
    "battle": "U6",
    "arts": "U7",
    "switch": "U7",
    "party": "U7",
    "bag": "U7",
    "target": "U7",
    "catch": "U7",
    "summary": "U8",
    "shop": "U8",
    "omen": "U8",
    "map": "U8",
    "defeat": "U9",
    "victory": "U9",
    "hatch": "U9",
}


@dataclass(frozen=True)
class ProductizationReport:
    missing_screens: list[str]
    missing_tour_stops: list[str]
    missing_keyframes: list[str]
    invalid_keyframes: list[str]
    invalid_matrix_entries: list[str]
    matrix_count: int
    keyframe_count: int


class _Token(NamedTuple):
    kind: str
    value: str


def _read_string(source: str, start: int) -> tuple[str, int]:
    quote = source[start]
    chars: list[str] = []
    index = start + 1
    escapes = {"n": "\n", "r": "\r", "t": "\t", "b": "\b", "f": "\f", "v": "\v"}
    while index < len(source):
        char = source[index]
        if char == quote:
            return "".join(chars), index + 1
        if char != "\\":
            chars.append(char)
            index += 1
            continue
        index += 1
        if index >= len(source):
            break
        escaped = source[index]
        if escaped in "\r\n":
            if escaped == "\r" and index + 1 < len(source) and source[index + 1] == "\n":
                index += 1
        elif escaped == "u" and index + 4 < len(source):
            digits = source[index + 1 : index + 5]
            try:
                chars.append(chr(int(digits, 16)))
                index += 4
            except ValueError:
                chars.extend(("u", digits))
                index += 4
        elif escaped == "x" and index + 2 < len(source):
            digits = source[index + 1 : index + 3]
            try:
                chars.append(chr(int(digits, 16)))
                index += 2
            except ValueError:
                chars.extend(("x", digits))
                index += 2
        else:
            chars.append(escapes.get(escaped, escaped))
        index += 1
    raise ValueError("unterminated TypeScript string literal")


def _tokenize_typescript(source: str) -> list[_Token]:
    """Tokenize enough TypeScript syntax to inspect declarations safely.

    Comments and template literals are ignored, so names mentioned in comments,
    function bodies, or display copy cannot be mistaken for matrix facts.
    """

    tokens: list[_Token] = []
    index = 0
    while index < len(source):
        char = source[index]
        if char.isspace():
            index += 1
            continue
        if source.startswith("//", index):
            newline = source.find("\n", index + 2)
            index = len(source) if newline < 0 else newline + 1
            continue
        if source.startswith("/*", index):
            end = source.find("*/", index + 2)
            if end < 0:
                raise ValueError("unterminated TypeScript block comment")
            index = end + 2
            continue
        if char in {'"', "'"}:
            value, index = _read_string(source, index)
            tokens.append(_Token("string", value))
            continue
        if char == "`":
            index += 1
            while index < len(source):
                if source[index] == "\\":
                    index += 2
                elif source[index] == "`":
                    index += 1
                    break
                else:
                    index += 1
            else:
                raise ValueError("unterminated TypeScript template literal")
            continue
        if char.isalpha() or char in "_$":
            end = index + 1
            while end < len(source) and (source[end].isalnum() or source[end] in "_$"):
                end += 1
            tokens.append(_Token("identifier", source[index:end]))
            index = end
            continue
        tokens.append(_Token("punctuation", char))
        index += 1
    return tokens


def _declared_array(tokens: list[_Token], name: str) -> list[_Token]:
    for index, token in enumerate(tokens):
        if token != _Token("identifier", "const"):
            continue
        if index + 1 >= len(tokens) or tokens[index + 1] != _Token("identifier", name):
            continue
        cursor = index + 2
        while cursor < len(tokens) and tokens[cursor].value not in {"=", ";"}:
            cursor += 1
        if cursor >= len(tokens) or tokens[cursor].value != "=":
            break
        cursor += 1
        while cursor < len(tokens) and tokens[cursor].value != "[":
            if tokens[cursor].value == ";":
                raise ValueError(f"{name} is not initialized with an array")
            cursor += 1
        if cursor >= len(tokens):
            raise ValueError(f"{name} array initializer is missing")
        depth = 1
        start = cursor + 1
        cursor += 1
        while cursor < len(tokens):
            if tokens[cursor].value == "[":
                depth += 1
            elif tokens[cursor].value == "]":
                depth -= 1
                if depth == 0:
                    return tokens[start:cursor]
            cursor += 1
        raise ValueError(f"{name} array initializer is unterminated")
    raise ValueError(f"TypeScript declaration {name} was not found")


def _parse_string_array(source: str, name: str) -> list[str]:
    body = _declared_array(_tokenize_typescript(source), name)
    values: list[str] = []
    square = curly = paren = 0
    for token in body:
        if token.kind == "string" and square == curly == paren == 0:
            values.append(token.value)
        elif token.value == "[":
            square += 1
        elif token.value == "]":
            square -= 1
        elif token.value == "{":
            curly += 1
        elif token.value == "}":
            curly -= 1
        elif token.value == "(":
            paren += 1
        elif token.value == ")":
            paren -= 1
    return values


def _top_level_objects(tokens: list[_Token]) -> list[list[_Token]]:
    objects: list[list[_Token]] = []
    start: int | None = None
    square = curly = paren = 0
    for index, token in enumerate(tokens):
        if token.value == "{" and square == curly == paren == 0:
            start = index
        if token.value == "[":
            square += 1
        elif token.value == "]":
            square -= 1
        elif token.value == "{":
            curly += 1
        elif token.value == "}":
            curly -= 1
            if curly == 0 and square == paren == 0 and start is not None:
                objects.append(tokens[start : index + 1])
                start = None
        elif token.value == "(":
            paren += 1
        elif token.value == ")":
            paren -= 1
    return objects


def _direct_string_properties(tokens: list[_Token]) -> dict[str, str]:
    properties: dict[str, str] = {}
    square = curly = paren = 0
    for index, token in enumerate(tokens):
        if (
            curly == 1
            and square == paren == 0
            and token.kind in {"identifier", "string"}
            and index + 2 < len(tokens)
            and tokens[index + 1].value == ":"
            and tokens[index + 2].kind == "string"
        ):
            properties[token.value] = tokens[index + 2].value
        if token.value == "[":
            square += 1
        elif token.value == "]":
            square -= 1
        elif token.value == "{":
            curly += 1
        elif token.value == "}":
            curly -= 1
        elif token.value == "(":
            paren += 1
        elif token.value == ")":
            paren -= 1
    return properties


def _parse_tour(source: str) -> list[tuple[str, str]]:
    body = _declared_array(_tokenize_typescript(source), "TOUR")
    stops: list[tuple[str, str]] = []
    for object_tokens in _top_level_objects(body):
        properties = _direct_string_properties(object_tokens)
        if "name" in properties and "screen" in properties:
            stops.append((properties["name"], properties["screen"]))
    return stops


def _load_matrix(path: Path) -> list[dict[str, object]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        entries = data
    elif isinstance(data, dict):
        entries = data.get("entries", data.get("screens"))
    else:
        entries = None
    if not isinstance(entries, list) or not all(isinstance(entry, dict) for entry in entries):
        raise ValueError("screen matrix must be a JSON list or an object containing an entries list")
    for index, entry in enumerate(entries):
        missing = sorted(REQUIRED_MATRIX_FIELDS - entry.keys())
        if missing:
            raise ValueError(f"screen matrix entry {index} is missing fields: {', '.join(missing)}")
        if not isinstance(entry["states"], list) or not entry["states"]:
            raise ValueError(f"screen matrix entry {index} states must be a non-empty list")
    return entries


def _valid_keyframe(path: Path) -> bool:
    try:
        body = path.read_text(encoding="utf-8")
        root = ElementTree.fromstring(body)
    except (OSError, UnicodeError, ElementTree.ParseError):
        return False
    if root.tag.rsplit("}", 1)[-1].lower() != "svg":
        return False
    if root.attrib.get("viewBox", "").split() != ["0", "0", "750", "1334"]:
        return False
    for element in root.iter():
        if element.tag.rsplit("}", 1)[-1].lower() == "image":
            return False
        for value in element.attrib.values():
            if value.strip().lower().startswith(("http://", "https://")):
                return False
    return True


def audit_productization(root: Path) -> ProductizationReport:
    root = Path(root)
    screens_source = (root / "packages/core/src/ui/screens.ts").read_text(encoding="utf-8")
    tour_source = (root / "packages/core/src/ui/tour.ts").read_text(encoding="utf-8")
    required_screens = set(_parse_string_array(screens_source, "LOBBY_SCREENS"))
    required_screens.update(_parse_string_array(screens_source, "RUN_SCREENS"))
    tour_stops = _parse_tour(tour_source)

    matrix_path = root / "docs/ui/screen-matrix.json"
    matrix = _load_matrix(matrix_path) if matrix_path.is_file() else []
    matrix_screens = {entry["screen"] for entry in matrix if isinstance(entry.get("screen"), str)}
    matrix_ids = {entry["id"] for entry in matrix if isinstance(entry.get("id"), str)}
    invalid_matrix_entries: list[str] = []
    for entry in matrix:
        entry_id = entry.get("id")
        states = entry.get("states")
        if not isinstance(entry_id, str) or not isinstance(states, list):
            continue
        if not REQUIRED_STATES.issubset(states) or entry.get("phase") != EXPECTED_PHASES.get(entry_id):
            invalid_matrix_entries.append(entry_id)

    keyframe_dir = root / "docs/ui/keyframes"
    missing_keyframes: list[str] = []
    invalid_keyframes: list[str] = []
    keyframe_count = 0
    for name in REQUIRED_KEYFRAMES:
        path = keyframe_dir / f"{name}.svg"
        if not path.is_file():
            missing_keyframes.append(name)
            continue
        keyframe_count += 1
        if not _valid_keyframe(path):
            invalid_keyframes.append(name)

    return ProductizationReport(
        missing_screens=sorted(required_screens - matrix_screens),
        missing_tour_stops=sorted(name for name, _screen in tour_stops if name not in matrix_ids),
        missing_keyframes=missing_keyframes,
        invalid_keyframes=invalid_keyframes,
        invalid_matrix_entries=sorted(invalid_matrix_entries),
        matrix_count=len(matrix),
        keyframe_count=keyframe_count,
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args(argv)
    try:
        report = audit_productization(args.root)
    except (OSError, UnicodeError, ValueError, json.JSONDecodeError) as exc:
        print(f"ui productization audit failed: {exc}", file=sys.stderr)
        return 1

    missing = report.missing_screens + report.missing_tour_stops + report.missing_keyframes
    print(
        "ui productization coverage: "
        f"{report.matrix_count} matrix entries, {report.keyframe_count} keyframes"
    )
    if report.missing_screens:
        print(f"missing screens: {', '.join(report.missing_screens)}")
    if report.missing_tour_stops:
        print(f"missing tour stops: {', '.join(report.missing_tour_stops)}")
    if report.missing_keyframes:
        print(f"missing keyframes: {', '.join(report.missing_keyframes)}")
    if report.invalid_keyframes:
        print(f"invalid keyframes: {', '.join(report.invalid_keyframes)}")
    if report.invalid_matrix_entries:
        print(f"invalid matrix entries: {', '.join(report.invalid_matrix_entries)}")
    return 1 if missing or report.invalid_keyframes or report.invalid_matrix_entries else 0


if __name__ == "__main__":
    sys.exit(main())
