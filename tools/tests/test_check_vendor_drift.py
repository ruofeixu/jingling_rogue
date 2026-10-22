from pathlib import Path

import pytest

from check_vendor_drift import assert_no_test_hooks, bundles_match


def test_bundles_match_accepts_identical_files(tmp_path: Path) -> None:
    left = tmp_path / "a.js"
    right = tmp_path / "b.js"
    left.write_text("same\n", encoding="utf-8")
    right.write_text("same\n", encoding="utf-8")

    bundles_match(left, right)


def test_bundles_match_rejects_drift(tmp_path: Path) -> None:
    left = tmp_path / "a.js"
    right = tmp_path / "b.js"
    left.write_text("committed\n", encoding="utf-8")
    right.write_text("rebuilt\n", encoding="utf-8")

    with pytest.raises(SystemExit):
        bundles_match(left, right)


def test_assert_no_test_hooks_rejects_shipping_hooks() -> None:
    with pytest.raises(SystemExit):
        assert_no_test_hooks("function forceOutcomeForTest() {}")
