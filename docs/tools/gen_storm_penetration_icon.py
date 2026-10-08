# -*- coding: utf-8 -*-
"""
生成「风暴穿透」药水效果图标 (18x18 PNG)
========================================
输出：SlashBlade-SenDims/src/main/resources/assets/slashblade_sendims/textures/mob_effect/storm_penetration.png

美术基准：黑暗之魂3 无名王者的白蓝雷electric。
"""

import os

from PIL import Image, ImageDraw

MOD_ROOT = r"C:\Users\Tony\Documents\EX\ForgeDev\SlashBlade-SenDims"
OUT_DIR = os.path.join(MOD_ROOT, "src", "main", "resources", "assets",
                       "slashblade_sendims", "textures", "mob_effect")
OUT_FILE = os.path.join(OUT_DIR, "storm_penetration.png")

SIZE = 18
SCALE = 8  # 超采样倍率，用于抗锯齿

OUTLINE = (10, 42, 82, 255)      # 深海蓝描边
CORE = (207, 232, 255, 255)      # 雷蓝白（高光）
GLOW = (79, 195, 255, 255)       # 电蓝

# 闪电多边形（18x18 坐标系）
BOLT = [
    (11.4, 0.4),
    (5.2, 9.6),
    (8.8, 9.6),
    (7.2, 17.6),
    (13.6, 7.4),
    (9.6, 7.4),
    (13.4, 0.4),
]


def scaled(points, factor, offset=0.0):
    return [(x * factor + offset, y * factor + offset) for x, y in points]


def expand(points, amount):
    """以几何中心为基准向外扩张，用作描边。"""
    cx = sum(p[0] for p in points) / len(points)
    cy = sum(p[1] for p in points) / len(points)
    out = []
    for x, y in points:
        dx, dy = x - cx, y - cy
        length = max((dx * dx + dy * dy) ** 0.5, 1e-6)
        out.append((x + dx / length * amount, y + dy / length * amount))
    return out


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    canvas = SIZE * SCALE
    img = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 描边层
    draw.polygon(scaled(expand(BOLT, 0.85), SCALE), fill=OUTLINE)
    # 主体层
    draw.polygon(scaled(BOLT, SCALE), fill=GLOW)
    # 高光芯（向右上偏移少量）
    draw.polygon(scaled(expand(BOLT, -0.9), SCALE, offset=-0.35 * SCALE), fill=CORE)

    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    img.save(OUT_FILE)
    print("saved:", OUT_FILE)


if __name__ == "__main__":
    main()
