"""Turn built Cocos Asset Bundles into real mini-game subpackages.

Creator 3.8.2 在本项目里不接受 `.meta` 里的 `compressionType: subpackage`（实测两平台都仍把
bundle 放进 `assets/<name>`，`game.json` 也没有 subpackages 字段），所以分包在构建后一步完成。

引擎侧契约来自 Cocos 自己的适配层：

    cc.settings.querySettings("assets", "subpackages")
        .forEach((name) => (_[name] = "subpackages/" + name));

命中该表的 bundle 会从 `subpackages/<name>/config.json` 读取清单，并把 base 设为
`subpackages/<name>/`。因此这里做三件事，且必须同时成立，缺一runtime就会404：

1. 把 `assets/<name>` 整个目录移动到 `subpackages/<name>`
2. 把 `<name>` 写进 `src/settings.json` 的 `assets.subpackages`
3. 把 `{name, root}` 写进 `game.json` 的 `subpackages`
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

SUBPACKAGE_DIR = "subpackages"
DEFAULT_BUNDLES = ["portraits", "ui-art"]


class SubpackageError(ValueError):
    """Raised when a build cannot be repackaged into subpackages."""


def _load_json(path: Path) -> dict[str, object]:
    if not path.is_file():
        raise SubpackageError(f"build is missing {path.name}: {path}")
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise SubpackageError(f"cannot read {path.name}: {exc}") from exc
    if not isinstance(payload, dict):
        raise SubpackageError(f"{path.name} must be a JSON object")
    return payload


def _write_json(path: Path, payload: dict[str, object]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _dir_bytes(root: Path) -> int:
    return sum(path.stat().st_size for path in root.rglob("*") if path.is_file())


def pack_subpackages(build_root: Path, bundles: list[str]) -> dict[str, object]:
    build_root = Path(build_root)
    if not build_root.is_dir():
        raise SubpackageError(f"build path is not a directory: {build_root}")
    if not bundles:
        raise SubpackageError("at least one bundle name is required")

    game_json_path = build_root / "game.json"
    settings_path = build_root / "src" / "settings.json"
    game_json = _load_json(game_json_path)
    settings = _load_json(settings_path)

    assets = settings.get("assets")
    if not isinstance(assets, dict):
        raise SubpackageError("src/settings.json is missing the assets section")

    moved: dict[str, int] = {}
    for name in bundles:
        source = build_root / "assets" / name
        target = build_root / SUBPACKAGE_DIR / name
        if source.is_dir():
            if target.exists():
                shutil.rmtree(target)
            target.parent.mkdir(parents=True, exist_ok=True)
            moved[name] = _dir_bytes(source)
            shutil.move(str(source), str(target))
        elif target.is_dir():
            moved[name] = 0
        else:
            raise SubpackageError(
                f"bundle {name!r} is missing from the build: neither assets/{name} nor "
                f"{SUBPACKAGE_DIR}/{name} exists"
            )

    declared = assets.get("subpackages")
    current = [item for item in declared if isinstance(item, str)] if isinstance(declared, list) else []
    assets["subpackages"] = sorted({*current, *bundles})
    _write_json(settings_path, settings)

    # 小游戏平台要求每个分包根目录有 game.js 作为入口（抖音开发者工具会直接报
    # `'subpackages/<name>/' should have game.js` 并拒绝编译）。Creator 把 bundle 脚本
    # 输出成 index.js，所以这里补一个转发入口，不覆盖 Creator 已产出的 game.js。
    for name in sorted(set(bundles)):
        target = build_root / SUBPACKAGE_DIR / name
        entry = target / "game.js"
        if entry.exists():
            continue
        bundle_script = next((candidate for candidate in ("index.js", "main.js") if (target / candidate).is_file()), None)
        if bundle_script is None:
            raise SubpackageError(
                f"subpackage {name!r} has no bundle script (index.js/main.js); cannot write game.js entry"
            )
        entry.write_text(f'require("./{bundle_script}");\n', encoding="utf-8")

    existing_entries = game_json.get("subpackages")
    by_name: dict[str, dict[str, object]] = {}
    if isinstance(existing_entries, list):
        for entry in existing_entries:
            if not isinstance(entry, dict):
                continue
            name = entry.get("name")
            root = entry.get("root")
            if isinstance(name, str) and name and isinstance(root, str) and root:
                by_name[name] = dict(entry)
    for name in sorted(set(bundles)):
        by_name[name] = {"name": name, "root": f"{SUBPACKAGE_DIR}/{name}/"}
    game_json["subpackages"] = [by_name[name] for name in sorted(by_name)]
    _write_json(game_json_path, game_json)

    return {
        "root": str(build_root),
        "bundles": sorted(set(bundles)),
        "moved": moved,
        "main_bytes": sum(
            path.stat().st_size
            for path in build_root.rglob("*")
            if path.is_file() and path.relative_to(build_root).parts[0] != SUBPACKAGE_DIR
        ),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("build", type=Path, help="built mini-game directory")
    parser.add_argument(
        "--bundle",
        action="append",
        default=None,
        metavar="NAME",
        help="Asset Bundle name to ship as a subpackage (repeatable)",
    )
    args = parser.parse_args(argv)
    bundles = args.bundle or DEFAULT_BUNDLES
    try:
        report = pack_subpackages(args.build, bundles)
    except SubpackageError as exc:
        print(f"subpackage packing failed: {exc}", file=sys.stderr)
        return 1
    moved = ", ".join(f"{name}={size} bytes" for name, size in sorted(report["moved"].items()))
    print(f"packed subpackages [{moved}]; main package is {report['main_bytes']} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
