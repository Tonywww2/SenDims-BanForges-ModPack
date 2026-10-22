"""Native-resolution pixel art for the four Zenith branches.

Colors and motifs are painted directly into the shared UV layout. No image
resizing, new geometry, transparent layers, or runtime effects are involved.
"""
from PIL import Image, ImageDraw


VARIANTS = {
    'black_crown': {
        'name': '黑冠', 'detail': '暗红黑刃 · 局部亮面 · 机械冠纹',
        'bands': [('#160e12',), ('#44202b', '#582631'),
                  ('#742935', '#873541'), ('#481722', '#571e2b'),
                  ('#1e131b', '#30181f'), ('#0d0c10', '#1f141c')],
        'metal': ('#111923', '#2c3b49', '#5b7080', '#b7c9ca'),
        'trim': ('#50262b', '#a34536', '#e3754d', '#ffc18c'),
        'gem': ('#541828', '#a72e37', '#ef654d', '#ffe0ac'),
        'grip': ('#13151e', '#262731', '#454951', '#7d838a'),
        'accent': '#e77960',
    },
    'divine_might': {
        'name': '神威', 'detail': '青蓝神金 · 五相宝印',
        'bands': [('#193e57',), ('#568ea9', '#75bad0'),
                  ('#c9f5eb', '#e2f7ff'), ('#3298ab', '#61c6c0'),
                  ('#225775', '#276f8e'), ('#163c60', '#286d82')],
        'metal': ('#124754', '#197f82', '#55c7b8', '#baf2df'),
        'trim': ('#6c6438', '#b5ad61', '#e2dc9a', '#fff6cb'),
        'gem': ('#19495a', '#44b5b9', '#a7f1dd', '#f2fff1'),
        'grip': ('#183346', '#284f60', '#4a8295', '#91c9cb'),
        'accent': '#87e7d3',
    },
    'kingship': {
        'name': '王权', 'detail': '象牙白刃 · 黄金雷冠 · 蓝宝石',
        'bands': [('#6c674b',), ('#c9b77a', '#dfce9c'),
                  ('#fff8d9', '#edf5f2'), ('#cfb866', '#e6d28d'),
                  ('#e0e2d5', '#f0edde'), ('#b4cbd4', '#dce8e4')],
        'metal': ('#67502b', '#b28a43', '#e2bf70', '#fff0b2'),
        'trim': ('#78602e', '#d0ac58', '#efd78e', '#fff8cc'),
        'gem': ('#163455', '#246c9b', '#70c8e3', '#d8fcff'),
        'grip': ('#152a48', '#264561', '#4a7088', '#91b4c7'),
        'accent': '#e9cd7d',
    },
    'dark_curse': {
        'name': '暗咒', 'detail': '暗紫咒刃 · 猩红咒印 · 黄焰裂纹',
        'bands': [('#221523',), ('#704960', '#856079'),
                  ('#c8a6b2', '#e4c8bb'), ('#7d2d4d', '#a4475c'),
                  ('#38233f', '#493054'), ('#21192e', '#3c2446')],
        'metal': ('#211729', '#432940', '#76506f', '#b38d98'),
        'trim': ('#644039', '#aa7550', '#d7a564', '#f9d99b'),
        'gem': ('#78242f', '#c75832', '#f7b74e', '#fff2ad'),
        'grip': ('#201422', '#492639', '#754056', '#b17c8c'),
        'accent': '#dc8b85',
    },
}


def paint_hilt(image, theme, tiles):
    palettes = {
        'jade': theme['metal'], 'gold': theme['trim'],
        'ruby': theme['gem'], 'grip': theme['grip'],
        'blue': theme['metal'], 'silver': theme['trim'],
        'broken': theme['metal'], 'wrap': theme['grip'],
    }
    for material, (ox, oy) in tiles.items():
        colors = palettes[material]
        # Painting each tile independently prevents grip bands bleeding into UV neighbours.
        tile = Image.new('RGBA', (32, 32), colors[1])
        d = ImageDraw.Draw(tile)
        d.rectangle((2, 2, 29, 6), fill=colors[2])
        d.rectangle((2, 2, 5, 29), fill=colors[2])
        d.rectangle((25, 7, 29, 29), fill=colors[0])
        d.rectangle((6, 26, 29, 29), fill=colors[0])
        d.line((6, 7, 21, 7), fill=colors[3], width=2)
        if material in ('grip', 'wrap'):
            for y in range(-20, 50, 7):
                d.line((3, y, 28, y + 13), fill=colors[2], width=2)
        elif material == 'ruby':
            d.polygon([(7, 7), (20, 7), (7, 20)], fill=colors[3])
            d.line((20, 11, 20, 21), fill=colors[0], width=2)
        elif material == 'jade':
            d.line([(11, 12), (20, 12), (20, 21)], fill=colors[2], width=2)
            d.point((12, 13), fill=colors[3])
        image.paste(tile, (ox, oy))


def crown(draw, y, line, light):
    draw.line([(21, y), (21, y + 7), (26, y + 3), (32, y + 11),
               (37, y + 3), (42, y + 7), (42, y), (21, y)], fill=line, width=2)
    draw.line((25, y - 3, 38, y - 3), fill=light, width=2)


def texture_variant(key, tiles):
    theme = VARIANTS[key]
    image = Image.new('RGBA', (128, 128), theme['bands'][0][0])
    d = ImageDraw.Draw(image)
    for y in range(128):
        for x in range(64):
            side = abs(x - 31.5)
            band = 0 if side > 28 else 1 if side > 24 else 2 if side > 19 else 3 if side > 13 else 4 if side > 6 else 5
            colors = theme['bands'][band]
            index = (y // 5 + x // 5) if band == 5 else (y // 12)
            d.point((x, y), fill=colors[index % len(colors)])

    if key == 'black_crown':
        # Angular channels and three crown stamps tie together machines and soul steel.
        # Short, asymmetric polished facets keep most of the blade dark red/black.
        # These are painted highlights, not another shader pass or emissive layer.
        for x, y, length in ((8, 14, 11), (55, 43, 9), (8, 81, 15), (55, 105, 10)):
            d.line((x, y, x, y + length), fill='#885c64', width=3)
            d.line((x, y + 2, x, y + length - 2), fill='#d3b6b1', width=1)
        for x, y in ((14, 28), (48, 64), (14, 103)):
            d.polygon([(x, y), (x + 3, y + 4), (x + 3, y + 13), (x, y + 8)],
                      fill='#b45a63')
        for x, sign in ((22, 1), (41, -1)):
            d.line([(x, 10), (x, 39), (x + sign * 4, 43),
                    (x + sign * 4, 65), (x, 70), (x, 117)], fill='#963b3b', width=2)
            for y in (18, 52, 88, 112):
                d.rectangle((x - 2, y, x + 2, y + 2), fill='#b94749')
                d.point((x, y + 1), fill='#edb3a5')
        for y in (24, 64, 101):
            crown(d, y, '#85434c', '#c96d64')
        for y in (9, 47, 85):
            d.line((28, y, 35, y), fill='#553039', width=2)
    elif key == 'divine_might':
        # Mirrored wave channels frame five small element seals; color remains mostly teal.
        for sign in (-1, 1):
            path = [(32 + sign * (12 if i % 2 else 8), 10 + i * 9) for i in range(13)]
            d.line(path, fill='#7ad5d6', width=2)
            d.line([(x + sign * 2, y) for x, y in path], fill='#30738c')
        for y, color, highlight in ((21, '#df694d', '#ffd9ae'),
                                    (41, '#469bd6', '#b5ecff'),
                                    (61, '#e6c15b', '#fff2ba'),
                                    (81, '#58b67d', '#c8f8b0'),
                                    (101, '#9970bd', '#ead4ff')):
            d.polygon([(32, y - 7), (39, y), (32, y + 7), (24, y)], fill='#c9d7a9')
            d.polygon([(32, y - 5), (36, y), (32, y + 5), (27, y)], fill=color)
            d.line([(28, y), (32, y + 4), (34, y + 2)], fill=highlight, width=2)
    elif key == 'kingship':
        # Bright enamel, gold lightning and two royal seals; blue is an accent.
        d.line((22, 9, 22, 116), fill='#a88644')
        d.line((41, 9, 41, 116), fill='#d4bd72')
        for y in (14, 52, 90):
            d.line([(32, y), (28, y + 8), (35, y + 8), (30, y + 17),
                    (34, y + 17), (31, y + 28)], fill='#b28a3c', width=3)
            d.line([(32, y), (30, y + 7), (36, y + 7)], fill='#fff4be', width=2)
        for y in (35, 75):
            crown(d, y, '#ad863e', '#fff7ce')
            d.rectangle((30, y + 2, 33, y + 5), fill='#387eac')
    elif key == 'dark_curse':
        # Broken scarlet seals, amber eye motifs and asymmetrical frenzy cracks.
        for x, y in ((21, 10), (39, 40), (21, 78)):
            sign = 1 if x < 32 else -1
            path = [(x, y), (x + sign * 4, y + 7), (x + sign * 2, y + 14),
                    (x + sign * 7, y + 23), (x + sign * 5, y + 30)]
            d.line(path, fill='#932e4b', width=4)
            d.line(path, fill='#e6a854', width=1)
        for y in (27, 62, 98):
            d.polygon([(23, y), (31, y + 4), (40, y), (32, y - 4)], fill='#be6b79')
            d.polygon([(26, y), (32, y + 2), (37, y), (32, y - 2)], fill='#f4d281')
            d.line((32, y - 2, 32, y + 2), fill='#2b192e', width=2)
            for side in (-1, 1):
                d.line([(32 + side * 5, y + 8), (32 + side * 10, y + 8),
                        (32 + side * 10, y + 12)], fill='#ae526c', width=2)
        for y in (46, 81, 115):
            d.line((20, y - 3, 41, y + 3), fill='#191627', width=3)
            d.line((23, y - 4, 39, y), fill='#d3a9b2')
    paint_hilt(image, theme, tiles)
    return image
