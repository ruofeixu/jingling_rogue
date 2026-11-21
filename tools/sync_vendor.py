"""把 packages/ 重新打成 assets/scripts/vendor/*.ts（Cocos 侧引用的两个 bundle）。

为什么不用 `esbuild --banner:js='...'` 直接写在 package.json 里：Windows 上 pnpm 通过
`cmd.exe` 起进程，单引号不是引号，banner 里的空格和 `—` 会把一个参数拆成多个输入文件，
esbuild 报 `Must use "outdir" when there are multiple input files`。这里复用
`check_vendor_drift.py` 的 esbuild 调用（argv 列表，不经过 shell），两个平台行为一致。

用法：
    pnpm sync:core            # 只同步 jinglingCore.ts
    pnpm sync:presentation    # 只同步 jinglingPresentation.ts
    pnpm sync:vendor          # 两个都同步
"""

from __future__ import annotations

import argparse
import shutil
import tempfile
from collections.abc import Callable, Sequence
from pathlib import Path

from check_vendor_drift import (
    VENDOR,
    assert_no_test_hooks,
    build_core,
    build_presentation,
)

Builder = Callable[[Path], Path]

# 顺序即产物顺序：core 在前，presentation 在它之后（presentation 依赖 core 的类型）。
TARGETS: dict[str, Builder] = {
    "core": build_core,
    "presentation": build_presentation,
}
FILENAMES: dict[str, str] = {
    "core": "jinglingCore.ts",
    "presentation": "jinglingPresentation.ts",
}


def selected_targets(names: Sequence[str]) -> list[str]:
    """空参数表示两个都同步；显式给名字时按 TARGETS 的固定顺序，不按命令行顺序。"""
    unknown = [name for name in names if name not in TARGETS]
    if unknown:
        raise SystemExit(
            f"unknown target: {', '.join(unknown)}; choose from {', '.join(TARGETS)}"
        )
    if not names:
        return list(TARGETS)
    return [name for name in TARGETS if name in names]


def sync(
    names: Sequence[str],
    *,
    builders: dict[str, Builder] = TARGETS,
    vendor_dir: Path = VENDOR,
) -> list[Path]:
    """逐个重建并落盘。先构建到临时文件、校验通过后再覆盖，失败不会留下半截 bundle。"""
    written: list[Path] = []
    vendor_dir.mkdir(parents=True, exist_ok=True)
    for name in selected_targets(names):
        with tempfile.TemporaryDirectory() as tmp:
            built = builders[name](Path(tmp) / FILENAMES[name])
            # 发货 bundle 里不能留测试钩子（见 check_vendor_drift.HOOKS）。
            assert_no_test_hooks(built.read_text(encoding="utf-8"))
            target = vendor_dir / FILENAMES[name]
            shutil.copyfile(built, target)
            written.append(target)
            print(f"wrote {target}")
    return written


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Rebuild assets/scripts/vendor/*.ts from packages/ (Windows-safe)."
    )
    parser.add_argument(
        "target",
        nargs="*",
        choices=list(TARGETS),
        metavar="{" + ",".join(TARGETS) + "}",
        help="留空则两个都同步",
    )
    sync(parser.parse_args(argv).target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
