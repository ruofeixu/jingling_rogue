from pathlib import Path

from gen_art import INCOMING, ROOT


def test_generated_incoming_is_outside_cocos_assets() -> None:
    """原始生成图不能放进 Cocos assets，否则会被正式 bundle 打包。"""
    assert not INCOMING.is_relative_to(ROOT / "assets")
    assert INCOMING.is_relative_to(ROOT / ".artifacts")


def test_formal_ui_bundle_has_no_generation_staging_directory() -> None:
    assert not (ROOT / "assets" / "ui-art" / "incoming").exists()
