"""Generate Cocos 3.8 texture-type .meta files for UI PNGs.

The Cocos editor normally creates these on import. Since we drop PNGs from the CLI,
we generate texture-importer metas (same shape as existing portrait metas) with
deterministic UUIDs so builds are reproducible. UiSkin loads these as Texture2D and
wraps them into SpriteFrame at runtime (same approach as assets/scripts/ui/portrait.ts).

Usage:
  uv run --project tools python tools/gen_meta.py assets/ui-art
"""

import json
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAMESPACE = uuid.UUID("8f1e0000-0000-4000-8000-000000000000")


def det_uuid(rel: str) -> str:
    return str(uuid.uuid5(NAMESPACE, rel))


def sub_id(u: str) -> str:
    # Cocos uses a short hex sub-id; derive deterministically from the uuid.
    return u.replace("-", "")[:5]


def make_meta(rel: str, display: str, has_alpha: bool) -> dict:
    u = det_uuid(rel)
    sid = sub_id(u)
    return {
        "ver": "1.0.26",
        "importer": "image",
        "imported": True,
        "uuid": u,
        "files": [".json", ".png"],
        "subMetas": {
            sid: {
                "importer": "texture",
                "uuid": f"{u}@{sid}",
                "displayName": display,
                "id": sid,
                "name": "texture",
                "userData": {
                    "wrapModeS": "clamp-to-edge",
                    "wrapModeT": "clamp-to-edge",
                    "minfilter": "linear",
                    "magfilter": "linear",
                    "mipfilter": "none",
                    "anisotropy": 0,
                    "isUuid": True,
                    "imageUuidOrDatabaseUri": u,
                    "visible": False,
                },
                "ver": "1.0.22",
                "imported": True,
                "files": [".json"],
                "subMetas": {},
            }
        },
        "userData": {
            "hasAlpha": has_alpha,
            "type": "texture",
            "fixAlphaTransparencyArtifacts": has_alpha,
            "redirect": f"{u}@{sid}",
        },
    }


def main(argv: list[str] | None = None) -> int:
    args = argv if argv is not None else sys.argv[1:]
    if not args:
        print("usage: gen_meta.py <dir-under-repo>", file=sys.stderr)
        return 2
    target = ROOT / args[0]
    if not target.is_dir():
        print(f"not a dir: {target}", file=sys.stderr)
        return 2

    try:
        from PIL import Image
    except ImportError:
        print("Pillow required (uv run --extra art).", file=sys.stderr)
        return 2

    made = 0
    for png in sorted(target.glob("*.png")):
        meta = png.with_suffix(".png.meta")
        rel = str(png.relative_to(ROOT))
        has_alpha = Image.open(png).convert("RGBA").getchannel("A").getextrema()[0] < 255
        meta.write_text(json.dumps(make_meta(rel, png.stem, has_alpha), indent=2) + "\n", encoding="utf-8")
        made += 1
        print(f"meta {png.name}")
    print(f"\n{made} metas written under {args[0]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
