"""Draws the 16x16 flat heater-shield icon used by the KubeJS asset override.

Run from anywhere:  python make_icon.py [output.png]
Default output:     ./kubejs/assets/tetra/textures/item/modular_shield_flat.png
"""
import sys
import os
from PIL import Image, ImageDraw

SIZE = 16
OUTLINE = (61, 43, 22, 255)     # dark leather outline
STEEL_HI = (206, 212, 220, 255)
STEEL = (150, 157, 168, 255)
WOOD_HI = (186, 138, 82, 255)
WOOD = (154, 111, 63, 255)
WOOD_LO = (122, 85, 47, 255)
BOSS = (120, 128, 140, 255)


def main(path):
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # heater shield silhouette: square shoulders, tapering to a point
    body = [(2, 1), (13, 1), (13, 7), (12, 9), (10, 12), (8, 14), (7, 14), (5, 12), (3, 9), (2, 7)]
    d.polygon(body, fill=WOOD, outline=OUTLINE)

    # wood grain: two darker horizontal-ish bands
    d.line([(4, 4), (11, 4)], fill=WOOD_HI)
    d.line([(4, 7), (11, 7)], fill=WOOD_LO)
    d.line([(6, 10), (9, 10)], fill=WOOD_LO)

    # steel rim across the top and down the sides
    d.line([(3, 2), (12, 2)], fill=STEEL_HI)
    d.line([(3, 3), (12, 3)], fill=STEEL)
    d.line([(3, 2), (3, 8)], fill=STEEL)
    d.line([(12, 2), (12, 8)], fill=STEEL)

    # centre boss
    d.rectangle([7, 5, 8, 6], fill=BOSS)
    d.point((7, 5), fill=STEEL_HI)

    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    img.save(path)
    print('wrote', path, img.size)


if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'kubejs', 'assets', 'tetra', 'textures', 'item', 'modular_shield_flat.png')
    main(target)
