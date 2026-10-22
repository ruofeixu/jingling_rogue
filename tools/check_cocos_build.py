"""Inspect real WeChat and ByteDance Cocos build outputs."""

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

MAIN_LIMIT = 4 * 1024 * 1024
# 内测包体预算：单个 Asset Bundle 分包不超过 20MiB，全部本地分包合计不超过 40MiB。
SUBPACKAGE_LIMIT = 20 * 1024 * 1024
SUBPACKAGES_TOTAL_LIMIT = 40 * 1024 * 1024
PORTRAIT_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}
PLACEHOLDER_PATTERN = re.compile(
    rb"console\s*\.\s*log\s*\(\s*[\"']\[jingling\]\s+bundle-",
    re.IGNORECASE,
)
PORTRAIT_LOGICAL_PATTERN = re.compile(r"(?:^|/)(?:remote/)?spirits(?:-folk)?/", re.IGNORECASE)
ALLOWED_LIB_VERSION_ALIASES = frozenset({"latest", "trial", "widelyUsed"})
LIB_VERSION_NUMBER_PATTERN = re.compile(r"^\d+\.\d+\.\d+$")


@dataclass(frozen=True)
class BuildBaseline:
    platform: str
    root: Path
    main_bytes: int
    subpackage_bytes: dict[str, int]
    remote_bytes: int
    file_count: int


class BuildInspectionError(ValueError):
    """Raised when a build is not a valid shippable Cocos mini-game."""


def _regular_files(root: Path) -> list[Path]:
    return sorted(path for path in root.rglob("*") if path.is_file())


def _contains_placeholder(path: Path) -> bool:
    overlap = b""
    try:
        with path.open("rb") as stream:
            while chunk := stream.read(64 * 1024):
                sample = overlap + chunk
                if PLACEHOLDER_PATTERN.search(sample):
                    return True
                overlap = sample[-128:]
    except OSError as exc:
        raise BuildInspectionError(f"cannot read build file {path}: {exc}") from exc
    return False


def _is_main_portrait(relative: Path) -> bool:
    return (
        relative.suffix.lower() in PORTRAIT_SUFFIXES
        and any(part.lower() == "spirits" for part in relative.parts[:-1])
    )


def _config_maps_main_portrait(path: Path) -> bool:
    if path.name != "config.json":
        return False
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError):
        return False

    pending: list[object] = [payload]
    while pending:
        value = pending.pop()
        if isinstance(value, str):
            if PORTRAIT_LOGICAL_PATTERN.search(value.replace("\\", "/")):
                return True
        elif isinstance(value, dict):
            pending.extend(value.keys())
            pending.extend(value.values())
        elif isinstance(value, list):
            pending.extend(value)
    return False


def _read_json_object(path: Path, platform: str) -> dict[str, object]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise BuildInspectionError(f"{platform} cannot read {path.name}: {exc}") from exc
    if not isinstance(payload, dict):
        raise BuildInspectionError(f"{platform} {path.name} must be a JSON object")
    return payload


def _check_lib_version(root: Path, platform: str) -> None:
    """Reject base-library values the mini-game devtools refuse to compile."""

    config = root / "project.config.json"
    if not config.is_file():
        return
    payload = _read_json_object(config, platform)
    if "libVersion" not in payload:
        return
    value = payload["libVersion"]
    if not isinstance(value, str):
        raise BuildInspectionError(
            f"{platform} project.config.json libVersion must be a string, got {type(value).__name__}"
        )
    if value in ALLOWED_LIB_VERSION_ALIASES or LIB_VERSION_NUMBER_PATTERN.match(value):
        return
    raise BuildInspectionError(
        f"{platform} project.config.json libVersion {value!r} is not accepted by the devtools; "
        f"use one of {sorted(ALLOWED_LIB_VERSION_ALIASES)} or a x.y.z version"
    )


def _check_declared_subpackages(root: Path, platform: str) -> None:
    """Reject declarations that cannot be loaded by the mini-game runtime."""

    payload = _read_json_object(root / "game.json", platform)
    declared: list[object] = []
    for key in ("subpackages", "subPackages"):
        value = payload.get(key)
        if isinstance(value, list):
            declared.extend(value)
    if not declared:
        return

    names: set[str] = set()
    for entry in declared:
        if not isinstance(entry, dict):
            raise BuildInspectionError(f"{platform} game.json subpackage entry must be an object")
        name = entry.get("name")
        raw_root = entry.get("root")
        if not isinstance(name, str) or not name:
            raise BuildInspectionError(f"{platform} game.json subpackage is missing a name")
        if not isinstance(raw_root, str) or not raw_root:
            raise BuildInspectionError(
                f"{platform} game.json subpackage {name!r} is missing a root path"
            )
        target = root / raw_root.strip("/")
        if not target.is_dir():
            raise BuildInspectionError(
                f"{platform} game.json declares subpackage {name!r} at {raw_root!r} "
                "but the build produced no such directory"
            )
        for required in ("game.js", "config.json"):
            if not (target / required).is_file():
                raise BuildInspectionError(
                    f"{platform} subpackage {name!r} is missing required {required}"
                )
        names.add(name)

    settings = _read_json_object(root / "src" / "settings.json", platform)
    assets = settings.get("assets")
    listed = assets.get("subpackages") if isinstance(assets, dict) else None
    settings_names = {item for item in listed if isinstance(item, str)} if isinstance(listed, list) else set()
    if names != settings_names:
        raise BuildInspectionError(
            f"{platform} subpackage settings mismatch: game.json={sorted(names)}, "
            f"src/settings.json={sorted(settings_names)}"
        )


def inspect_build(root: Path, platform: str) -> BuildBaseline:
    root = Path(root)
    if not root.is_dir():
        raise BuildInspectionError(f"{platform} build path is not a directory: {root}")

    missing_entries = [name for name in ("game.js", "game.json") if not (root / name).is_file()]
    if missing_entries:
        raise BuildInspectionError(
            f"{platform} build is missing required Cocos entry: {', '.join(missing_entries)}"
        )

    _check_lib_version(root, platform)
    _check_declared_subpackages(root, platform)

    files = _regular_files(root)
    main_files: list[Path] = []
    subpackage_bytes: dict[str, int] = {}
    remote_bytes = 0

    for path in files:
        relative = path.relative_to(root)
        top_level = relative.parts[0].lower()
        size = path.stat().st_size
        if top_level == "subpackages":
            package = relative.parts[1] if len(relative.parts) > 2 else "__root__"
            subpackage_bytes[package] = subpackage_bytes.get(package, 0) + size
            if _contains_placeholder(path):
                raise BuildInspectionError(
                    f"placeholder preview subpackage found in {relative.as_posix()}"
                )
        elif top_level == "remote":
            remote_bytes += size
        else:
            main_files.append(path)
            if _is_main_portrait(relative) or _config_maps_main_portrait(path):
                raise BuildInspectionError(
                    f"portrait image must not be shipped in the main package: {relative.as_posix()}"
                )

    for name, size in subpackage_bytes.items():
        if size > SUBPACKAGE_LIMIT:
            raise BuildInspectionError(
                f"subpackage {name!r} is {size} bytes and exceeds the per-subpackage limit "
                f"({SUBPACKAGE_LIMIT} bytes)"
            )
    subpackage_total = sum(subpackage_bytes.values())
    if subpackage_total > SUBPACKAGES_TOTAL_LIMIT:
        raise BuildInspectionError(
            f"all subpackages total {subpackage_total} bytes and exceed the internal limit "
            f"({SUBPACKAGES_TOTAL_LIMIT} bytes)"
        )

    main_bytes = sum(path.stat().st_size for path in main_files)
    if main_bytes > MAIN_LIMIT:
        raise BuildInspectionError(
            f"main package is {main_bytes} bytes and exceeds the 4MiB limit ({MAIN_LIMIT} bytes)"
        )

    return BuildBaseline(
        platform=platform,
        root=root,
        main_bytes=main_bytes,
        subpackage_bytes=dict(sorted(subpackage_bytes.items())),
        remote_bytes=remote_bytes,
        file_count=len(files),
    )


def _as_json(baseline: BuildBaseline) -> dict[str, object]:
    return {
        "platform": baseline.platform,
        "root": str(baseline.root),
        "main_bytes": baseline.main_bytes,
        "subpackage_bytes": baseline.subpackage_bytes,
        "remote_bytes": baseline.remote_bytes,
        "file_count": baseline.file_count,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--wechat", type=Path, metavar="PATH")
    parser.add_argument("--bytedance", type=Path, metavar="PATH")
    parser.add_argument("--json-out", type=Path, metavar="PATH")
    args = parser.parse_args(argv)
    if args.wechat is None and args.bytedance is None:
        parser.error("at least one build path is required: --wechat PATH or --bytedance PATH")

    requested = [
        ("wechatgame", args.wechat),
        ("bytedance-mini-game", args.bytedance),
    ]
    baselines: list[BuildBaseline] = []
    try:
        for platform, path in requested:
            if path is not None:
                baselines.append(inspect_build(path, platform))
    except BuildInspectionError as exc:
        print(f"cocos build inspection failed: {exc}", file=sys.stderr)
        return 1

    payload = {"builds": [_as_json(baseline) for baseline in baselines]}
    if args.json_out is not None:
        try:
            args.json_out.parent.mkdir(parents=True, exist_ok=True)
            args.json_out.write_text(
                json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
        except OSError as exc:
            print(f"cannot write JSON baseline {args.json_out}: {exc}", file=sys.stderr)
            return 1

    for baseline in baselines:
        print(
            f"{baseline.platform}: main={baseline.main_bytes} bytes, "
            f"subpackages={sum(baseline.subpackage_bytes.values())} bytes, "
            f"remote={baseline.remote_bytes} bytes, files={baseline.file_count}"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
