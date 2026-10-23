"""Draw the item directly on a native 16x16 pixel grid; no source image or resampling."""
from pathlib import Path

from PIL import Image


PALETTE = {
    '.': (0, 0, 0, 0),
    'V': (64, 26, 91, 255),
    'P': (121, 47, 171, 255),
    'L': (181, 97, 231, 255),
    'H': (235, 177, 255, 255),
    'K': (76, 74, 83, 255),
    'S': (172, 170, 157, 255),
    'W': (253, 250, 235, 255),
    'C': (228, 226, 209, 255),
    'G': (49, 112, 92, 255),
    'g': (31, 70, 57, 255),
}

# Each symbol is one final texture pixel. The white face deliberately has no markings.
PIXELS = """
. . . . . . . . . . . . . . . .
. . . . P . . . . . P . . . . .
. . P . L P . . . P L . P . . .
. . P L H P . V P H L . P . . .
. V P L K S S S S S K g L P . .
. P L V S W W W W W C G P L . .
. V H L S W W W W W C G H P . .
. . V H S W W W W C C G L V P .
. P . P S W W W W C C G P H L .
. L P V S W W W W C C G H L P .
. P H L S W W W C C C G L P . .
. . L H K C C C C C S g P L . .
. P V L V K S S S S g V H P . .
. . P H L P V V P L H P V . . .
. . . P V L P . P H L V . . . .
. . . . . . . . . . . . . . . .
"""


def main():
    rows = [row.split() for row in PIXELS.strip().splitlines()]
    if len(rows) != 16 or any(len(row) != 16 for row in rows):
        raise ValueError('Pixel drawing must contain exactly 16 rows of 16 pixels')
    image = Image.new('RGBA', (16, 16))
    image.putdata([PALETTE[pixel] for row in rows for pixel in row])
    target = Path(__file__).resolve().parents[2] / 'kubejs/assets/kubejs/textures/item/yakuman_forging_soul.png'
    image.save(target, optimize=True)
    print('Wrote native 16x16 RGBA texture:', target)


if __name__ == '__main__':
    main()
