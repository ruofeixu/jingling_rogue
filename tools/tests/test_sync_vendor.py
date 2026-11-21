from pathlib import Path

import pytest

from sync_vendor import FILENAMES, sync, selected_targets


def test_selected_targets_defaults_to_both_in_order() -> None:
    assert selected_targets([]) == ["core", "presentation"]


def test_selected_targets_keeps_canonical_order() -> None:
    assert selected_targets(["presentation", "core"]) == ["core", "presentation"]
    assert selected_targets(["presentation"]) == ["presentation"]


def test_selected_targets_rejects_unknown() -> None:
    with pytest.raises(SystemExit):
        selected_targets(["assets"])


def _fake_build(payload: str = "// bundle\n"):
    def build(outfile: Path) -> Path:
        outfile.write_text(payload, encoding="utf-8")
        return outfile

    return build


def test_sync_writes_both_bundles(tmp_path: Path) -> None:
    vendor = tmp_path / "vendor"
    builder = _fake_build()

    written = sync(
        [],
        builders={"core": builder, "presentation": builder},
        vendor_dir=vendor,
    )

    assert written == [vendor / FILENAMES["core"], vendor / FILENAMES["presentation"]]
    assert (vendor / FILENAMES["core"]).read_text(encoding="utf-8") == "// bundle\n"
    assert (vendor / FILENAMES["presentation"]).read_text(encoding="utf-8") == "// bundle\n"


def test_sync_only_touches_requested_target(tmp_path: Path) -> None:
    vendor = tmp_path / "vendor"
    builder = _fake_build()

    sync(["presentation"], builders={"core": builder, "presentation": builder}, vendor_dir=vendor)

    assert not (vendor / FILENAMES["core"]).exists()
    assert (vendor / FILENAMES["presentation"]).exists()


def test_sync_refuses_bundles_with_test_hooks(tmp_path: Path) -> None:
    vendor = tmp_path / "vendor"
    builder = _fake_build("function forceOutcomeForTest() {}\n")

    with pytest.raises(SystemExit):
        sync(["core"], builders={"core": builder, "presentation": builder}, vendor_dir=vendor)

    # 构建失败时不能覆盖已提交的 bundle。
    assert not (vendor / FILENAMES["core"]).exists()
