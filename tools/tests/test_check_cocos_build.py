from __future__ import annotations

import importlib.util
from pathlib import Path
from types import ModuleType

import pytest

ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "tools" / "check_cocos_build.py"


def load_module() -> ModuleType:
    assert MODULE_PATH.exists(), "real Cocos build inspector must exist"
    spec = importlib.util.spec_from_file_location("check_cocos_build", MODULE_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def valid_shell(root: Path) -> None:
    root.mkdir(parents=True)
    (root / "game.js").write_text("console.log('real cocos entry');\n")
    (root / "game.json").write_text('{"deviceOrientation":"portrait"}\n')


def test_rejects_missing_real_cocos_entry(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    build.mkdir()

    with pytest.raises(module.BuildInspectionError, match="game.js"):
        module.inspect_build(build, "wechatgame")


def test_rejects_main_package_over_four_mib(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    (build / "too-large.bin").write_bytes(b"x" * (module.MAIN_LIMIT + 1))

    with pytest.raises(module.BuildInspectionError, match="4MiB"):
        module.inspect_build(build, "wechatgame")


def test_rejects_placeholder_preview_subpackages(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    bundle = build / "subpackages" / "bundle-battle"
    bundle.mkdir(parents=True)
    (bundle / "game.js").write_text('console.log("[jingling] bundle-battle");\n')

    with pytest.raises(module.BuildInspectionError, match="placeholder"):
        module.inspect_build(build, "wechatgame")


def test_rejects_portrait_images_in_main_package(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    portrait = build / "assets" / "spirits" / "zao_li.png"
    portrait.parent.mkdir(parents=True)
    portrait.write_bytes(b"portrait")

    with pytest.raises(module.BuildInspectionError, match="portrait"):
        module.inspect_build(build, "wechatgame")


def test_rejects_hashed_portraits_mapped_by_cocos_config(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    resources = build / "assets" / "resources"
    resources.mkdir(parents=True)
    (resources / "config.json").write_text(
        '{"paths":{"1":["remote/spirits/zao_li/texture",1,1]}}'
    )
    native = resources / "native" / "ab"
    native.mkdir(parents=True)
    (native / "hashed.png").write_bytes(b"portrait")

    with pytest.raises(module.BuildInspectionError, match="portrait"):
        module.inspect_build(build, "wechatgame")


def test_rejects_lib_version_devtools_will_not_accept(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    (build / "project.config.json").write_text(
        '{"compileType":"game","libVersion":"game"}\n'
    )

    with pytest.raises(module.BuildInspectionError, match="libVersion"):
        module.inspect_build(build, "wechatgame")


def test_accepts_official_lib_version_values(tmp_path: Path) -> None:
    module = load_module()
    for index, value in enumerate(["latest", "trial", "widelyUsed", "3.17.2"]):
        build = tmp_path / f"wechatgame-{index}"
        valid_shell(build)
        (build / "project.config.json").write_text(
            '{"compileType":"game","libVersion":"' + value + '"}\n'
        )

        report = module.inspect_build(build, "wechatgame")

        assert report.main_bytes > 0


def test_rejects_subpackage_declared_without_directory(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    (build / "game.json").write_text(
        '{"deviceOrientation":"portrait","subpackages":'
        '[{"name":"bundle-battle","root":"subpackages/bundle-battle/"}]}\n'
    )

    with pytest.raises(module.BuildInspectionError, match="bundle-battle"):
        module.inspect_build(build, "wechatgame")


def test_accepts_subpackage_declared_with_real_directory(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    bundle = declared_subpackage(build)
    (bundle / "game.js").write_text("registerBattleBundle();\n")
    (bundle / "index.js").write_text("registerBattleBundle();\n")

    report = module.inspect_build(build, "wechatgame")

    assert report.subpackage_bytes["bundle-battle"] > 0


def test_rejects_bundle_relative_portrait_paths_in_main_package(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    resources = build / "assets" / "resources"
    resources.mkdir(parents=True)
    (resources / "config.json").write_text(
        '{"paths":{"1":["spirits/zao_li/texture",1,1],"2":["spirits-folk/zao_li/texture",1,1]}}'
    )

    with pytest.raises(module.BuildInspectionError, match="portrait"):
        module.inspect_build(build, "wechatgame")


def test_reports_main_subpackage_and_remote_bytes(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "bytedance-mini-game"
    valid_shell(build)
    assets = build / "assets"
    assets.mkdir()
    (assets / "config.json").write_text("{}")
    bundle = build / "subpackages" / "bundle-battle"
    bundle.mkdir(parents=True)
    (bundle / "game.js").write_text("registerBattleBundle();\n")
    remote = build / "remote" / "spirits"
    remote.mkdir(parents=True)
    (remote / "zao_li.png").write_bytes(b"remote portrait")

    report = module.inspect_build(build, "bytedance-mini-game")

    assert report.platform == "bytedance-mini-game"
    assert report.main_bytes > 0
    assert report.main_bytes <= module.MAIN_LIMIT
    assert report.subpackage_bytes["bundle-battle"] > 0
    assert report.remote_bytes == len(b"remote portrait")
    assert report.file_count == 5


def declared_subpackage(build: Path, name: str = "bundle-battle") -> Path:
    (build / "game.json").write_text(
        '{"deviceOrientation":"portrait","subpackages":'
        f'[{{"name":"{name}","root":"subpackages/{name}/"}}]}}\n'
    )
    bundle = build / "subpackages" / name
    bundle.mkdir(parents=True)
    (bundle / "config.json").write_text("{}\n")
    src = build / "src"
    src.mkdir(exist_ok=True)
    (src / "settings.json").write_text(
        '{"assets":{"subpackages":["' + name + '"]}}\n'
    )
    return bundle


def test_rejects_declared_subpackage_without_game_js(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    bundle = declared_subpackage(build)
    (bundle / "index.js").write_text("registerBundle();\n")

    with pytest.raises(module.BuildInspectionError, match="game.js"):
        module.inspect_build(build, "wechatgame")


def test_rejects_subpackage_missing_from_settings(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    bundle = declared_subpackage(build)
    (bundle / "game.js").write_text("registerBundle();\n")
    (build / "src" / "settings.json").write_text(
        '{"assets":{"subpackages":[]}}\n'
    )

    with pytest.raises(module.BuildInspectionError, match="settings"):
        module.inspect_build(build, "wechatgame")


def test_rejects_single_subpackage_over_budget(tmp_path: Path) -> None:
    module = load_module()
    build = tmp_path / "wechatgame"
    valid_shell(build)
    bundle = declared_subpackage(build)
    (bundle / "game.js").write_text("registerBundle();\n")
    (bundle / "too-large.bin").write_bytes(b"x" * (module.SUBPACKAGE_LIMIT + 1))

    with pytest.raises(module.BuildInspectionError, match="subpackage.*limit"):
        module.inspect_build(build, "wechatgame")
