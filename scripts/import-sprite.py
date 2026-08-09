"""Import a hand-supplied Buddy sprite (webp/png/jpg) into public/assets.

    python scripts/import-sprite.py <source> <buddy_idle|buddy_talk|...>

Converts to RGBA PNG, drops a flat white/near-white background if the source has
none of its own, trims fully transparent margins, and refuses to write a sprite
whose artwork is clipped at the top edge -- that clipping is the whole reason
these are being replaced.
"""
import sys
from pathlib import Path

from PIL import Image

VALID = {
    "buddy_idle", "buddy_talk", "buddy_happy", "buddy_satisfied",
    "buddy_worry", "buddy_glitch", "buddy_horror", "buddy_wave2",
}
WHITE_CUTOFF = 246  # channel value above which a pixel counts as background
# The stage draws Buddy 390px tall and the original sprite set is ~500px, so a
# 1500px source would be downsampled ~4x by the browser -- with
# image-rendering: pixelated that eats thin outlines. Match the existing set.
TARGET_H = 500


def load_rgba(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    alpha = im.getchannel("A")
    if alpha.getextrema()[0] < 250:
        return im  # already has real transparency

    # opaque source: key out the flat white surround
    px = im.load()
    w, h = im.size
    seen = set()
    stack = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    while stack:
        x, y = stack.pop()
        if not (0 <= x < w and 0 <= y < h) or (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, _ = px[x, y]
        if r < WHITE_CUTOFF or g < WHITE_CUTOFF or b < WHITE_CUTOFF:
            continue
        px[x, y] = (r, g, b, 0)
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return im


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    src, name = Path(sys.argv[1]), sys.argv[2]
    if name not in VALID:
        print(f"! unknown sprite '{name}'. one of: {', '.join(sorted(VALID))}")
        return 2

    im = load_rgba(src)
    box = im.getchannel("A").getbbox()
    if box is None:
        print("! image is fully transparent")
        return 1
    im = im.crop(box)
    w, h = im.size

    # the ear tips must taper; a wide run on the first row means it is cut off
    px = im.load()
    row0 = sum(1 for x in range(w) if px[x, 0][3] > 24)
    if row0 > w * 0.12:
        print(f"! top row is {row0}px wide of {w} -- artwork looks clipped, not importing")
        return 1

    if h > TARGET_H:
        im = im.resize((round(w * TARGET_H / h), TARGET_H), Image.LANCZOS)

    out = Path(__file__).resolve().parent.parent / "public" / "assets" / f"{name}.png"
    im.save(out)
    print(f"wrote {out.name} {im.size[0]}x{im.size[1]} (from {w}x{h}, top row {row0}px, alpha ok)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
