from __future__ import annotations

import importlib.util
import json
from pathlib import Path
from types import ModuleType

import pytest

ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "tools" / "pack_subpackages.py"


def load_module() -> ModuleType:
    assert MODULE_PATH.exists(), "subpackage packer must exist"
    spec = importlib.util.spec_from_file_location("pack_subpackages", MODULE_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def fake_build(root: Path, bundle: str = "portraits") -> None:
    root.mkdir(parents=True)
    (root / "game.js").write_text("console.log('entry');\n")
    (root / "game.json").write_text('{"deviceOrientation":"portrait"}\n')
    src = root / "src"
    src.mkdir()
    (src / "settings.json").write_text(
        json.dumps(
            {
                "assets": {
                    "subpackages": [],
                    "remoteBundles": [],
                    "projectBundles": ["internal", "main", bundle],
                }
            }
        )
    )
    payload = root / "assets" / bundle
    (payload / "native" / "ab").mkdir(parents=True)
    (payload / "config.json").write_text('{"paths":{"1":["spirits/zao_li/texture",1,1]}}')
    (payload / "index.js").write_text("registerPortraits();\n")
    (payload / "native" / "ab" / "zao_li.png").write_bytes(b"portrait bytes")


def test_moves_bundle_and_declares_subpackage(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    fake_build(build)

    report = module.pack_subpackages(build, ["portraits"])

    assert (build / "subpackages" / "portraits" / "config.json").is_file()
    assert (build / "subpackages" / "portraits" / "index.js").is_file()
    assert not (build / "assets" / "portraits").exists()
    settings = json.loads((build / "src" / "settings.json").read_text())
    assert settings["assets"]["subpackages"] == ["portraits"]
    game = json.loads((build / "game.json").read_text())
    assert game["subpackages"] == [{"name": "portraits", "root": "subpackages/portraits/"}]
    assert report["moved"]["portraits"] > 0


def test_is_idempotent(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    fake_build(build)

    module.pack_subpackages(build, ["portraits"])
    report = module.pack_subpackages(build, ["portraits"])

    settings = json.loads((build / "src" / "settings.json").read_text())
    assert settings["assets"]["subpackages"] == ["portraits"]
    game = json.loads((build / "game.json").read_text())
    assert game["subpackages"] == [{"name": "portraits", "root": "subpackages/portraits/"}]
    assert report["moved"]["portraits"] == 0


def test_writes_platform_entry_script_for_each_subpackage(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    fake_build(build)

    module.pack_subpackages(build, ["portraits"])

    entry = build / "subpackages" / "portraits" / "game.js"
    assert entry.is_file(), "mini-game platforms require game.js in every subpackage root"
    assert "index.js" in entry.read_text()


def test_keeps_existing_platform_entry_script(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    fake_build(build)
    (build / "assets" / "portraits" / "game.js").write_text("// creator provided\n")

    module.pack_subpackages(build, ["portraits"])

    entry = build / "subpackages" / "portraits" / "game.js"
    assert entry.read_text() == "// creator provided\n"


def test_rejects_missing_bundle(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    fake_build(build)

    with pytest.raises(module.SubpackageError, match="missing"):
        module.pack_subpackages(build, ["nope"])


def test_rejects_build_without_settings(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    fake_build(build)
    (build / "src" / "settings.json").unlink()

    with pytest.raises(module.SubpackageError, match="settings.json"):
        module.pack_subpackages(build, ["portraits"])


def test_default_bundles_include_portraits_and_ui_art() -> None:
    module = load_module()
    assert module.DEFAULT_BUNDLES == ["portraits", "ui-art"]


def test_preserves_existing_subpackage_declarations(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    fake_build(build)
    (build / "game.json").write_text(
        json.dumps(
            {
                "deviceOrientation": "portrait",
                "subpackages": [
                    {"name": "existing", "root": "subpackages/existing/"}
                ],
            }
        )
    )
    existing = build / "subpackages" / "existing"
    existing.mkdir(parents=True)
    (existing / "game.js").write_text("registerExisting();\n")

    module.pack_subpackages(build, ["portraits"])

    game = json.loads((build / "game.json").read_text())
    assert game["subpackages"] == [
        {"name": "existing", "root": "subpackages/existing/"},
        {"name": "portraits", "root": "subpackages/portraits/"},
    ]


def test_packs_portraits_and_ui_art_together(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    fake_build(build)
    ui = build / "assets" / "ui-art"
    ui.mkdir()
    (ui / "config.json").write_text('{"paths":{"1":["bg_lobby/texture",1,1]}}')
    (ui / "index.js").write_text("registerUiArt();\n")

    report = module.pack_subpackages(build, ["portraits", "ui-art"])

    assert report["bundles"] == ["portraits", "ui-art"]
    assert (build / "subpackages" / "ui-art" / "game.js").is_file()
    settings = json.loads((build / "src" / "settings.json").read_text())
    assert settings["assets"]["subpackages"] == ["portraits", "ui-art"]
