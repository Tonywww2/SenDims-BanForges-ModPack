"""Hand-draw the shared certificate directly on a native 16x16 pixel grid."""
from pathlib import Path

from PIL import Image


PALETTE = {
    '.': (0, 0, 0, 0),
    'o': (74, 46, 34, 255),
    's': (135, 87, 39, 255),
    'g': (201, 153, 65, 255),
    'h': (247, 214, 132, 255),
    'p': (230, 207, 157, 255),
    'w': (255, 240, 201, 255),
    'c': (190, 162, 112, 255),
    'i': (101, 100, 69, 255),
    'v': (45, 115, 85, 255),
    't': (250, 249, 228, 255),
    'b': (199, 207, 182, 255),
    'r': (132, 35, 46, 255),
    'R': (209, 65, 72, 255),
}

# One symbol is one final pixel: gold scroll, blank mahjong tile and a red seal.
PIXELS = """
. . . . . . . . . . . . . . . .
. . . o s g g g g g g s o . . .
. . o g h h h h h h h g s o . .
. . o s p w w w w w w p s o . .
. . . o w t t t v w w w o . . .
. . . o w t t t v i i w o . . .
. . . o w t t t v w w w o . . .
. . . o w t t t v i i w o . . .
. . . o w b b b v w w w o . . .
. . . o w w w w w w w w o . . .
. . . o w i i i w r R r o . . .
. . . o w w w w w R h R o . . .
. . . o c p p p p r R r o . . .
. . o g h h h h g r R r s o . .
. . . o s g g g s r . r o . . .
. . . . . . . . . . . . . . . .
"""


def main():
    rows = [row.split() for row in PIXELS.strip().splitlines()]
    if len(rows) != 16 or any(len(row) != 16 for row in rows):
        raise ValueError('Pixel drawing must contain exactly 16 rows of 16 pixels')
    image = Image.new('RGBA', (16, 16))
    image.putdata([PALETTE[pixel] for row in rows for pixel in row])
    target = Path(__file__).resolve().parents[1] / 'assets/kubejs/textures/item/yakuman_certificate.png'
    image.save(target, optimize=True)
    print('Wrote native 16x16 RGBA texture:', target)


if __name__ == '__main__':
    main()
