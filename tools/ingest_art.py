"""Normalize generated UI/portrait art into engine-ready assets.

Model-agnostic: drop raw generated PNGs into an incoming dir, this normalizes them
to the project's conventions and places them where Cocos loads them.

Conventions (verified against the repo):
- Spirit portraits: assets/portraits/spirits/<id>.png, 512x512 RGBA, no baked pad.
- UI art frames:     assets/ui-art/<name>.png (kept as-is size; icons squared).

Usage:
  # portraits: file named portrait_<id>.png in incoming -> spirits/<id>.png @512
  uv run --project tools python tools/ingest_art.py --incoming .artifacts/ui-art/incoming --kind portrait
  # ui frames/icons: file named <name>.png -> assets/ui-art/<name>.png
  uv run --project tools python tools/ingest_art.py --incoming .artifacts/ui-art/incoming --kind ui

Requires Pillow (add to tools dev deps).
"""

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORTRAIT_DIR = ROOT / "assets/portraits/spirits"
UI_DIR = ROOT / "assets/ui-art"

PORTRAIT_SIZE = 512


def _require_pillow():
    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        print("Pillow required: add pillow to tools deps and re-run.", file=sys.stderr)
        raise SystemExit(2)


def has_transparency(img) -> bool:
    if img.mode != "RGBA":
        return False
    alpha = img.getchannel("A")
    return alpha.getextrema()[0] < 255


def trim_and_square(img, size: int):
    """Trim transparent margins, then paste centered onto a transparent square."""
    from PIL import Image

    rgba = img.convert("RGBA")
    bbox = rgba.getchannel("A").getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    w, h = rgba.size
    scale = min(size / w, size / h)
    new = (max(1, round(w * scale)), max(1, round(h * scale)))
    rgba = rgba.resize(new, Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(rgba, ((size - new[0]) // 2, (size - new[1]) // 2), rgba)
    return canvas


def ingest_portrait(src: Path, report: list[str]) -> None:
    from PIL import Image

    name = src.stem
    spirit_id = name[len("portrait_"):] if name.startswith("portrait_") else name
    img = Image.open(src)
    if not has_transparency(img):
        report.append(f"WARN {src.name}: no transparency (background not removed?)")
    out = trim_and_square(img, PORTRAIT_SIZE)
    PORTRAIT_DIR.mkdir(parents=True, exist_ok=True)
    dst = PORTRAIT_DIR / f"{spirit_id}.png"
    out.save(dst)
    report.append(f"OK   portrait {spirit_id} -> {dst.relative_to(ROOT)} ({PORTRAIT_SIZE}x{PORTRAIT_SIZE})")


def ingest_ui(src: Path, report: list[str]) -> None:
    from PIL import Image

    img = Image.open(src).convert("RGBA")
    name = src.stem
    # 控制体积：图标缩到 256、背景缩到 750 宽（竖屏量级）。等比缩 + PNG 优化。
    if name.startswith("bg_"):
        target_w = 750
        if img.width > target_w:
            h = round(img.height * target_w / img.width)
            img = img.resize((target_w, h), Image.LANCZOS)
    elif name.startswith("icon_"):
        cap = 256
        if max(img.size) > cap:
            scale = cap / max(img.size)
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    else:
        if not has_transparency(img):
            report.append(f"WARN {src.name}: no transparency")
    UI_DIR.mkdir(parents=True, exist_ok=True)
    dst = UI_DIR / f"{name}.png"
    img.save(dst, format="PNG", optimize=True)
    report.append(f"OK   ui {name} -> {dst.relative_to(ROOT)} ({img.width}x{img.height})")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--incoming", type=Path, required=True)
    parser.add_argument("--kind", choices=["portrait", "ui"], required=True)
    args = parser.parse_args(argv)

    _require_pillow()
    incoming = args.incoming if args.incoming.is_absolute() else ROOT / args.incoming
    if not incoming.is_dir():
        print(f"incoming dir not found: {incoming}", file=sys.stderr)
        return 2

    files = sorted(p for p in incoming.glob("*.png") if not p.name.endswith(".meta"))
    if not files:
        print(f"no PNGs in {incoming}")
        return 0

    report: list[str] = []
    for f in files:
        if args.kind == "portrait":
            ingest_portrait(f, report)
        else:
            ingest_ui(f, report)

    for line in report:
        print(line)
    warns = [r for r in report if r.startswith("WARN")]
    print(f"\n{len(files)} processed, {len(warns)} warnings.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
