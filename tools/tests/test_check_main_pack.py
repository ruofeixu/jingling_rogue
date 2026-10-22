from __future__ import annotations

from pathlib import Path

import pytest

from check_main_pack import LIMIT, check_tree, measure_main_pack


def test_rejects_tree_over_4mb(tmp_path: Path) -> None:
    fat = tmp_path / "assets"
    fat.mkdir()
    (fat / "blob.bin").write_bytes(b"x" * (LIMIT + 1))
    with pytest.raises(ValueError, match="4MB"):
        check_tree(tmp_path)


def test_rejects_portrait_png_in_main(tmp_path: Path) -> None:
    portraits = tmp_path / "assets" / "spirits"
    portraits.mkdir(parents=True)
    (portraits / "zao_li.png").write_bytes(b"\x89PNG")
    with pytest.raises(ValueError, match="cdn"):
        check_tree(tmp_path)


def test_excludes_bundles_shipped_as_subpackages(tmp_path: Path) -> None:
    bundle = tmp_path / "assets" / "portraits" / "spirits"
    bundle.mkdir(parents=True)
    (bundle / "zao_li.png").write_bytes(b"\x89PNG" + b"x" * (LIMIT + 1))
    (tmp_path / "assets" / "portraits.meta").write_text(
        '{"userData":{"isBundle":true,"bundleName":"portraits"}}'
    )

    total = check_tree(tmp_path)

    assert total < LIMIT
    assert total < 1024


def test_still_rejects_portraits_outside_a_subpackage_bundle(tmp_path: Path) -> None:
    stray = tmp_path / "assets" / "portraits" / "spirits"
    stray.mkdir(parents=True)
    (stray / "zao_li.png").write_bytes(b"\x89PNG")

    with pytest.raises(ValueError, match="cdn"):
        check_tree(tmp_path)


def test_repo_main_pack_under_limit() -> None:
    root = Path(__file__).resolve().parent.parent.parent
    total = measure_main_pack(root)
    assert total <= LIMIT


def test_excludes_ui_art_bundle_shipped_as_subpackage(tmp_path: Path) -> None:
    bundle = tmp_path / "assets" / "ui-art"
    bundle.mkdir(parents=True)
    (bundle / "bg_lobby.png").write_bytes(b"x" * (LIMIT + 1))
    (tmp_path / "assets" / "ui-art.meta").write_text(
        '{"userData":{"isBundle":true,"bundleName":"ui-art"}}'
    )

    assert check_tree(tmp_path) < LIMIT
