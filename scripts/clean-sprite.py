"""Strip detached specks from a sprite and re-crop to the artwork.

    python scripts/clean-sprite.py buddy_talk [buddy_satisfied ...]

Some sprites carry a stray blob in a corner left over from the original export.
It inflates the alpha bounding box, so object-fit: contain shrinks the character
and pushes it off centre. Keeping only the largest connected blob fixes both.

Only run this on sprites whose leftover is genuinely junk. buddy_wave2 has two
DETACHED EAR TIPS above a 2px seam -- running it there would lop the ears off.
"""
import sys
from collections import deque
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "public" / "assets"
DENY = {"buddy_wave2"}  # its top blobs are ear tips, not junk


def clean(name: str) -> None:
    path = ASSETS / f"{name}.png"
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    a = im.getchannel("A").load()
    on = [[a[x, y] > 40 for y in range(h)] for x in range(w)]

    seen = [[False] * h for _ in range(w)]
    best: list[tuple[int, int]] = []
    others = 0
    for sx in range(w):
        for sy in range(h):
            if not on[sx][sy] or seen[sx][sy]:
                continue
            q, comp = deque([(sx, sy)]), []
            seen[sx][sy] = True
            while q:
                x, y = q.popleft()
                comp.append((x, y))
                for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                    if 0 <= nx < w and 0 <= ny < h and on[nx][ny] and not seen[nx][ny]:
                        seen[nx][ny] = True
                        q.append((nx, ny))
            if len(comp) > len(best):
                if best:
                    others += 1
                best = comp
            else:
                others += 1

    keep = set(best)
    px = im.load()
    removed = 0
    for x in range(w):
        for y in range(h):
            if on[x][y] and (x, y) not in keep:
                px[x, y] = (0, 0, 0, 0)
                removed += 1

    box = im.getchannel("A").getbbox()
    im = im.crop(box)
    im.save(path)
    print(f"{name}: dropped {others} blob(s) / {removed}px, cropped {w}x{h} -> {im.size[0]}x{im.size[1]}")


def main() -> int:
    names = sys.argv[1:]
    if not names:
        print(__doc__)
        return 2
    for n in names:
        if n in DENY:
            print(f"! refusing {n}: its stray blobs are ear tips")
            return 1
        clean(n)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
