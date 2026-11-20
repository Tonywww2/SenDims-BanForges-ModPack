"""终焉城堡召唤材料的 16x16 贴图（占位，可之后替换为手绘）。

用法（整合包根目录）：python -X utf8 docs/tools/draw_final_castle_textures.py
输出到 kubejs/assets/kubejs/textures/item 与 textures/block。设计见
docs/development/终焉城堡内容设计-2026-11-18.md 第 5 节。
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ITEM = ROOT / 'kubejs/assets/kubejs/textures/item'
BLOCK = ROOT / 'kubejs/assets/kubejs/textures/block'


def shade(rgb, f):
    return tuple(max(0, min(255, int(c * f))) for c in rgb) + (255,)


def save(img, folder, name):
    folder.mkdir(parents=True, exist_ok=True)
    img.save(folder / f'{name}.png')
    print('wrote', folder / f'{name}.png')


# 碎片：斜放的三角晶片，描边 / 暗面 / 亮面 / 高光
SHARD = [
    '................',
    '..........O.....',
    '.........OHO....',
    '........OHLMO...',
    '.......OHLLMO...',
    '......OHLLMMDO..',
    '.....OHLLMMMDO..',
    '....OHLLMMMDDO..',
    '...OHLLMMMDDO...',
    '...OLLMMMDDO....',
    '..OLMMMMDDO.....',
    '..OMMMMDDO......',
    '..OMMDDDO.......',
    '...ODDOO........',
    '....OO..........',
    '................',
]
SHARD_COLORS = {
    'yellow': (242, 201, 76),
    'blue': (90, 170, 245),
    'pink': (230, 90, 200),
    'violet': (160, 100, 240),
}


def draw_shard(rgb):
    img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    pal = {'O': shade(rgb, 0.35), 'D': shade(rgb, 0.65), 'M': shade(rgb, 0.9), 'L': shade(rgb, 1.15), 'H': (255, 255, 240, 255)}
    for y, row in enumerate(SHARD):
        for x, ch in enumerate(row):
            if ch in pal:
                img.putpixel((x, y), pal[ch])
    return img


def draw_echo():
    # 城堡残响：淡紫色的环形余波，中间一点亮核
    img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    base = (150, 110, 230)
    for y in range(16):
        for x in range(16):
            d = ((x - 7.5) ** 2 + (y - 7.5) ** 2) ** 0.5
            if 5.0 <= d < 6.6:
                img.putpixel((x, y), shade(base, 0.6 + 0.08 * ((x + y) % 3)))
            elif 2.4 <= d < 3.6:
                img.putpixel((x, y), shade(base, 1.0))
            elif d < 1.6:
                img.putpixel((x, y), (235, 220, 255, 255))
    return img


def draw_sigil():
    # 终焉符印：金边圆章，紫色底，中间十字符纹
    img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    gold, violet = (230, 190, 90), (110, 60, 180)
    for y in range(16):
        for x in range(16):
            d = ((x - 7.5) ** 2 + (y - 7.5) ** 2) ** 0.5
            if d < 6.2:
                img.putpixel((x, y), shade(violet, 0.85 + 0.1 * (y < 8)))
            elif d < 7.4:
                img.putpixel((x, y), shade(gold, 0.75 + 0.3 * (x + y < 15)))
    for i in range(4, 12):
        img.putpixel((i, 7), (245, 225, 255, 255))
        img.putpixel((7, i), (245, 225, 255, 255))
    for p in [(5, 5), (9, 5), (5, 9), (9, 9)]:
        img.putpixel(p, (200, 160, 255, 255))
    return img


def draw_core():
    # 终焉符文核心：灰白城堡砖底，中间发光的紫色菱形符文
    img = Image.new('RGBA', (16, 16), (0, 0, 0, 255))
    stone = (178, 172, 165)
    for y in range(16):
        for x in range(16):
            mortar = y % 4 == 3 or (x + (4 if (y // 4) % 2 else 0)) % 8 == 7
            img.putpixel((x, y), shade(stone, 0.62 if mortar else 0.92 + 0.06 * ((x * 7 + y * 3) % 3 == 0)))
    glow = (190, 120, 255)
    for y in range(16):
        for x in range(16):
            d = abs(x - 7.5) + abs(y - 7.5)
            if d < 3.2:
                img.putpixel((x, y), (240, 220, 255, 255))
            elif d < 5.2:
                img.putpixel((x, y), shade(glow, 1.0))
            elif d < 6.2:
                img.putpixel((x, y), shade(glow, 0.55))
    return img


def main():
    for name, rgb in SHARD_COLORS.items():
        save(draw_shard(rgb), ITEM, f'castle_rune_shard_{name}')
    save(draw_echo(), ITEM, 'castle_echo')
    save(draw_sigil(), ITEM, 'finale_sigil')
    save(draw_core(), BLOCK, 'finale_rune_core')


if __name__ == '__main__':
    main()
