"""Batch-generate UI/portrait art with gpt-image-1 (Azure OpenAI or OpenAI direct).

Reads a built-in asset table (mirrors docs/ui/design-mockups/generation-spec.md),
wraps each prompt with the shared STYLE prefix + clean-room NEGATIVE, calls the
Images API with transparent background, and writes PNGs into an incoming dir for
tools/ingest_art.py to normalize.

Credentials & endpoint from env (never hard-code / commit):
  AZURE (preferred here):
    AZURE_OPENAI_ENDPOINT   e.g. https://my-resource.openai.azure.com
    AZURE_OPENAI_API_KEY    the resource key
    AZURE_OPENAI_IMAGE_DEPLOYMENT   your gpt-image-1 *deployment* name (NOT the model id)
    AZURE_OPENAI_API_VERSION        optional, default "preview"
  OpenAI direct (fallback if no AZURE_* set):
    OPENAI_API_KEY

Usage:
  # list prompts, no API calls, no cost:
  uv run --project tools --extra art python tools/gen_art.py --list --group starters
  # generate the style anchor first (review it, then generate the rest):
  uv run --project tools --extra art python tools/gen_art.py --only zao_li
  # then the rest of the starters:
  uv run --project tools --extra art python tools/gen_art.py --group starters
  # everything:
  uv run --project tools --extra art python tools/gen_art.py --all

Then normalize:
  uv run --project tools --extra art python tools/ingest_art.py --incoming .artifacts/ui-art/incoming --kind portrait
"""

import argparse
import base64
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INCOMING = ROOT / ".artifacts/ui-art/incoming"


def load_dotenv() -> None:
    """Load repo-root .env into os.environ (no external dep). Existing env wins."""
    env_path = ROOT / ".env"
    if not env_path.is_file():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val

STYLE = (
    "Chinese folklore cartoon monster, unified art style: bright clean bold outlines, "
    "cel-shaded with a few large color blocks plus 2-3 shading steps and one glossy highlight "
    "(reads as round and thick, NOT a flat sticker), painterly game-art finish, full-body, "
    "front or three-quarter view, empty space under the feet, transparent background, "
    "no baked-in circular/oval pad under the character, no text no logo. "
    "Keep the RENDERING style consistent, but this creature must have its OWN distinct "
    "silhouette, eyes and expression as described (do NOT default to generic big round cute eyes). "
)
NEGATIVE = (
    " Do NOT imitate or recolor any existing commercial monster-collecting franchise mascot, "
    "no official dragon/rat/turtle/frog silhouettes, no Japanese pet-monster style, no dark "
    "stone-rubbing or new-year-painting mood, no fur strands, no wood-grain or stone texture, "
    "no calligraphy, no ropes or tassels, do not make every creature look the same. Original design only."
)

ICON_STYLE = (
    "Chunky cartoon game UI icon, single centered object, thick rounded outline, glossy top "
    "highlight and soft bottom shadow (puffy 3D jelly look), warm candy palette to match a "
    "sky-blue UI, transparent background, no text. "
)

BG_STYLE = (
    "Cartoon mobile-game background scene, soft painterly cel-shaded style matching a cute "
    "Chinese-folklore creature-collector game, bright cheerful palette, gentle depth, empty "
    "central area so UI panels and text can sit on top (uncluttered middle), vertical phone "
    "wallpaper composition, no characters, no text, no logo, no UI elements drawn in. "
)

# name -> (group, kind, body prompt). file written as <name>.png in incoming.
# 精怪形象依据 packages/core/src/tables/spirits.json 的名字+属性推导（原创，clean-room）。
# 技法统一由 STYLE 前缀锁定；每只用 EYES / TEMPERAMENT / palette 区分。
ASSETS: dict[str, tuple[str, str, str]] = {
    # ============ 炎 flame（灶狸线 + 窑鼠）============
    # 配色差异化：灵性靠特征与能量点缀体现，主体色各不相同，避免同属精怪通体同色。
    "portrait_zao_li": ("flame", "portrait",
        "灶狸 a chubby raccoon-cat fire spirit; EYES: big round mischievous eyes with a tiny flame "
        "flickering inside each pupil; a flame tuft as bangs, a dancing-flame tail tip, soot smudges "
        "on the cheeks; TEMPERAMENT: playful cheeky ugly-cute gremlin, toothy grin; "
        "COLOR: warm cream-and-tan fur body with orange flame accents and dark soot paws "
        "(not an all-red body)"),
    "portrait_dan_li": ("flame", "portrait",
        "丹狸 the evolved fire raccoon-cat, taller and leaner, twin flame tufts; EYES: sharp confident "
        "almond eyes glowing like coals; TEMPERAMENT: proud, spirited, mischievous adolescent; "
        "COLOR: deep cinnabar-red coat with black stripes and bright gold flame accents, white belly "
        "(bold red-black-gold contrast)"),
    "portrait_huo_de_li": ("flame", "portrait",
        "火德吏 the final form, a dignified upright fox-official fire spirit in a flame-robe silhouette "
        "(made of fire, not cloth), a small cap of flame; EYES: calm commanding narrow eyes with steady "
        "inner fire; TEMPERAMENT: solemn, authoritative fire magistrate; "
        "COLOR: regal indigo-and-white robe body with vivid orange-gold flames and vermilion trim "
        "(cool robe color contrasting hot flames, not all-red)"),
    "portrait_yao_shu": ("flame", "portrait",
        "窑鼠 a small kiln-rat spirit, little round ears; EYES: two beady bright eyes with a warm glow; "
        "TEMPERAMENT: busy, timid but hardworking, cute; "
        "COLOR: dusty clay-brown and ash-grey body with glowing ember-orange cracks like a kiln "
        "(earthy flame+stone, muted not bright red)"),

    # ============ 潮 tide（井蛛线）============
    "portrait_jing_zhu": ("tide", "portrait",
        "井蛛 a cute cartoon water-well spider spirit; round semi-translucent water-bead body, eight "
        "short stubby rounded legs; EYES: four to six friendly cartoon dot-eyes with glossy highlights "
        "in a gentle arc (hints 'spider' but soft, cute, NOT realistic NOT creepy); a well-ripple ring "
        "on the back; TEMPERAMENT: quiet gentle nimble water sprite; "
        "COLOR: pale glassy aqua body with darker teal legs and a soft blue sheen; cartoon not photorealistic"),
    "portrait_quan_ji": ("tide", "portrait",
        "泉姬 a graceful spring-maiden water spirit, a flowing body of clear spring water, water-lily "
        "accents; EYES: soft elegant almond eyes, serene; TEMPERAMENT: gentle, poised, kind; "
        "COLOR: white-and-jade body with pink lotus accents and translucent aqua trim (soft pastel, not all-blue)"),
    "portrait_he_bo_cong": ("tide", "portrait",
        "河伯从事 a stately river-lord attendant, a robust carp-headed official made of river water, "
        "small ripples as a mantle; EYES: broad calm confident eyes; TEMPERAMENT: reliable, composed, "
        "a river bureaucrat; COLOR: deep navy-and-bronze body with jade-green fins and gold trim "
        "(rich dark contrast, not pale blue)"),

    # ============ 木 wood（桃梗线）============
    "portrait_tao_geng": ("wood", "portrait",
        "桃梗 a little wooden puppet of peach-twig branches; head is half a peach, twig limbs, two "
        "fresh leaves on top; EYES: simple carved wooden eyes, two narrow squinting slits / dot eyes "
        "(sleepy woodcut, NOT big shiny eyes); TEMPERAMENT: dazed dopey stiff clumsy-cute; "
        "COLOR: light peachwood-tan body with pink peach top and bright green leaves (warm wood tones)"),
    "portrait_nuo_mian": ("wood", "portrait",
        "傩面 a folk-mask wood spirit, body of woven vines wearing a rounded painted ritual mask "
        "(friendly cartoon mask, NOT scary); EYES: the mask's two round painted eyeholes glowing softly; "
        "TEMPERAMENT: mysterious but playful, a dancing masked sprite; "
        "COLOR: green vine body with a vermilion-and-white painted mask and ochre accents (colorful mask contrast)"),
    "portrait_she_mu": ("wood", "portrait",
        "社木 a great shrine-tree wood spirit, a sturdy stylized little tree with a broad trunk body "
        "and leafy canopy crown, small roots as feet; EYES: kind deep-set elder eyes among the bark; "
        "TEMPERAMENT: gentle guardian, ancient and warm; "
        "COLOR: warm brown bark trunk with a lush deep-green canopy and a few red votive accents; cartoon"),

    # ============ 岩 stone ============
    "portrait_luan_shi": ("stone", "portrait",
        "卵石精 a round pebble spirit, a smooth speckled river-stone body with tiny stubby arms; "
        "EYES: two simple sleepy dot eyes close together; TEMPERAMENT: stubborn, sturdy, slow and "
        "cute; COLOR: soft grey-and-cream speckled stone with a warm sandy underside (light stone tones)"),
    "portrait_zhang_yan": ("stone", "portrait",
        "嶂岩 a craggy cliff-rock spirit, a chunky angular boulder body with mossy ledges and small "
        "arms; EYES: two firm square-ish eyes under heavy stone brows; TEMPERAMENT: tough, steady, "
        "immovable; COLOR: dark slate-blue rock with vivid green moss and amber mineral veins "
        "(cool rock + bright moss contrast)"),

    # ============ 霆 bolt ============
    "portrait_dian_zhu": ("bolt", "portrait",
        "电蛛 a cartoon lightning-spider spirit, small round body crackling with tiny sparks, short "
        "zigzag legs; EYES: a few bright cartoon dot-eyes sparking with static (cute, not creepy); "
        "TEMPERAMENT: hyper, jittery, quick; COLOR: deep indigo body with bright electric-yellow "
        "zigzag markings and white spark highlights (dark base, neon accents)"),
    "portrait_pi_li": ("bolt", "portrait",
        "霹雳蜈 a thunder-centipede spirit, a segmented body glowing with lightning veins, many "
        "little legs; EYES: two sharp energetic eyes flashing; TEMPERAMENT: fierce and fast, "
        "excitable; COLOR: charcoal-and-crimson segments with electric-cyan lightning veins "
        "(dark red body, cyan energy); cartoon, not scary"),

    # ============ 霜 frost ============
    "portrait_shuang_ming": ("frost", "portrait",
        "霜螟 a tiny frost-moth-larva spirit, a plump segmented body dusted with frost, icy fuzz; "
        "EYES: two big cool watery eyes; TEMPERAMENT: shy, cool, delicate; "
        "COLOR: soft mint-green and lavender body with white frost dusting (pastel, not plain white-blue)"),
    "portrait_bing_can": ("frost", "portrait",
        "冰蚕 a frost-silkworm spirit, a chubby translucent icy body like frozen silk, crystalline nubs; "
        "EYES: two calm crystal-blue eyes with a frosty gleam; TEMPERAMENT: serene, cold, gentle; "
        "COLOR: pearly white-and-pale-cyan body with subtle iridescent blue-pink sheen (icy pearl tones)"),

    # ============ 影 shade ============
    "portrait_mo_mao": ("shade", "portrait",
        "墨猫 an ink-black cat shade spirit, a sleek smoky body with drippy ink-tail, a moon-mark on "
        "the forehead; EYES: two glowing lantern-yellow slit eyes (cool and sly, not scary); "
        "TEMPERAMENT: aloof, mysterious, elegant; COLOR: deep ink-black-and-violet body with a "
        "pale silver-blue moon mark and glowing gold eyes (dark with luminous accents)"),
    "portrait_ye_ti": ("shade", "portrait",
        "夜啼 a night-crier shade spirit, a small round shadowy owl-like sprite wrapped in dusk mist; "
        "EYES: two big soft glowing eyes in the dark (gentle, melancholic, not scary); TEMPERAMENT: "
        "quiet, wistful, nocturnal; COLOR: dusky indigo body with muted plum mist and warm amber "
        "glowing eyes (twilight tones with a warm eye accent)"),

    # ============ 光 light（灯蛾线）============
    "portrait_deng_e": ("light", "portrait",
        "灯蛾 a lantern-moth spirit, wings glow warm like paper lanterns, feathery curly antennae; "
        "EYES: large softly glowing cartoon eyes with a hazy shimmer (not realistic compound eyes); "
        "TEMPERAMENT: dreamy, gentle, drawn to light; COLOR: soft cream-and-amber body with warm "
        "glowing golden wings and a hint of dusty rose (warm luminous, not plain yellow)"),
    "portrait_jin_hui": ("light", "portrait",
        "金辉雀 a golden-radiance sparrow spirit, a plump little bird wreathed in warm light, shining "
        "tail feathers; EYES: two bright cheerful round eyes; TEMPERAMENT: lively, warm, auspicious; "
        "COLOR: white-and-gold plumage with rosy-orange sunrise accents and radiant halo (bright but layered)"),

    # --- backgrounds (opaque full-scene) ---
    "bg_lobby": ("bg", "bg",
        "a bright sky over a cozy folk-village rooftops and distant misty hills at dawn, soft "
        "clouds, warm inviting title-screen mood; sky-blue and cream palette with warm accents"),
    "bg_battle": ("bg", "bg",
        "a grassy meadow battlefield with rolling green hills, a few soft clouds and distant "
        "mountains, gentle daylight; fresh green and sky-blue palette, open ground in the middle"),
    "bg_indoor": ("bg", "bg",
        "a warm cozy interior of a folk apothecary / market stall, soft wooden shelves and paper "
        "lanterns blurred in the background, gentle depth; warm amber and cream palette"),

    # --- battle command icons ---
    "icon_art": ("icons", "icon", "a glowing magic talisman spark"),
    "icon_party": ("icons", "icon", "two cute little creature heads side by side"),
    "icon_bag": ("icons", "icon", "a small drawstring pouch"),
    "icon_flee": ("icons", "icon", "two running paw prints"),
    # --- item / entry icons ---
    "icon_potion": ("icons", "icon", "a small dew vial with a glowing droplet"),
    "icon_seal": ("icons", "icon", "a red stamp seal"),
    "icon_scroll": ("icons", "icon", "a tattered scroll"),
    "icon_codex": ("icons", "icon", "an open book"),
    "icon_eggs": ("icons", "icon", "a speckled egg"),
    "icon_achievements": ("icons", "icon", "a golden trophy"),
    "icon_stats": ("icons", "icon", "a small bar chart"),
    "icon_settings": ("icons", "icon", "a gear cog"),
    "icon_slots": ("icons", "icon", "a save disk"),
}


def build_prompt(name: str) -> str:
    _group, kind, body = ASSETS[name]
    if kind == "icon":
        return ICON_STYLE + body + "." + NEGATIVE
    if kind == "bg":
        return BG_STYLE + body + "."
    return STYLE + body + "." + NEGATIVE


def select(args) -> list[str]:
    if args.only:
        key = args.only if args.only.startswith(("portrait_", "icon_", "bg_")) else f"portrait_{args.only}"
        if key not in ASSETS:
            print(f"unknown asset: {args.only}", file=sys.stderr)
            raise SystemExit(2)
        return [key]
    if args.group:
        names = [n for n, (g, _k, _b) in ASSETS.items() if g == args.group]
        if not names:
            print(f"unknown group: {args.group}", file=sys.stderr)
            raise SystemExit(2)
        return names
    if args.all:
        return list(ASSETS)
    return []


def build_client() -> tuple[object, str] | None:
    """Return (client, model_name). Azure if AZURE_* set, else OpenAI direct.

    On Azure, model_name = the deployment name; on OpenAI direct, "gpt-image-1".
    """
    try:
        from openai import AzureOpenAI, OpenAI
    except ImportError:
        print("openai SDK required: add 'openai' to tools [art] extra.", file=sys.stderr)
        return None

    az_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    az_key = os.environ.get("AZURE_OPENAI_API_KEY")
    az_deployment = os.environ.get("AZURE_OPENAI_IMAGE_DEPLOYMENT")
    if az_endpoint and az_key and az_deployment:
        api_version = os.environ.get("AZURE_OPENAI_API_VERSION", "2025-04-01-preview")
        client = AzureOpenAI(
            azure_endpoint=az_endpoint,
            api_key=az_key,
            api_version=api_version,
        )
        return client, az_deployment

    oa_key = os.environ.get("OPENAI_API_KEY")
    if oa_key:
        return OpenAI(api_key=oa_key), "gpt-image-1"

    print(
        "no credentials. Set AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_API_KEY + "
        "AZURE_OPENAI_IMAGE_DEPLOYMENT (Azure), or OPENAI_API_KEY (direct).",
        file=sys.stderr,
    )
    return None


def main(argv: list[str] | None = None) -> int:
    load_dotenv()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--list", action="store_true", help="print prompts, no API calls")
    parser.add_argument("--only", help="single asset id (e.g. zao_li or icon_art)")
    parser.add_argument("--group", help="starters | foes | icons")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--size", default="1024x1024", choices=["1024x1024", "1024x1536", "1536x1024"])
    parser.add_argument("--quality", default="high", choices=["low", "medium", "high"])
    args = parser.parse_args(argv)

    names = select(args)
    if not names and not args.list:
        parser.error("choose one of --only / --group / --all (or --list)")

    if args.list:
        for n in (names or list(ASSETS)):
            print(f"# {n}\n{build_prompt(n)}\n")
        return 0

    built = build_client()
    if built is None:
        return 2
    client, model = built

    INCOMING.mkdir(parents=True, exist_ok=True)

    ok, fail = 0, 0
    for name in names:
        prompt = build_prompt(name)
        kind = ASSETS[name][1]
        # 背景：不透明、竖屏；立绘/图标：透明、方形。
        size = "1024x1536" if kind == "bg" else args.size
        background = "opaque" if kind == "bg" else "transparent"
        try:
            res = client.images.generate(
                model=model,
                prompt=prompt,
                size=size,
                quality=args.quality,
                output_format="png",
                background=background,
                n=1,
            )
            data = base64.b64decode(res.data[0].b64_json)
            out = INCOMING / f"{name}.png"
            out.write_bytes(data)
            print(f"OK   {name} -> {out.relative_to(ROOT)} ({len(data)} B)")
            ok += 1
        except Exception as exc:  # noqa: BLE001 - report and continue batch
            print(f"FAIL {name}: {exc}", file=sys.stderr)
            fail += 1

    print(f"\n{ok} ok, {fail} failed. Next: ingest_art.py --incoming .artifacts/ui-art/incoming --kind portrait")
    return 1 if fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
