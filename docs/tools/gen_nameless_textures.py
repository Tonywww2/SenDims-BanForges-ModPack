# -*- coding: utf-8 -*-
"""
无名王者系列 (sdbf:nameless_*) 贴图生成器
=========================================

美术基准：《黑暗之魂3》无名王者 (Nameless King)
- 龙猎枪剑 (Swordspear) 轮廓
- 灰烬铁 / 暗青铜 / 雷蓝白 / 风化暗金 / 黑金 配色梯度

做法（与本包 / last_smith 官方 `murasama_kagura.png` 一致的技法）：
    取 `last_smith` 的大太刀基础贴图 odachi.png (256x512)，
    按 HSL 色相重映射 + 饱和度/明度调整，生成 5 张同 UV 布局的改色图。

用法：
    python docs/tools/gen_nameless_textures.py
"""

import colorsys
import glob
import io
import os
import struct
import zipfile

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    raise SystemExit("需要 Pillow：pip install pillow")

# ---------------------------------------------------------------------------
# 路径
# ---------------------------------------------------------------------------
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODS_DIR = os.path.join(ROOT, "mods")
OUT_DIR = os.path.join(ROOT, "kubejs", "assets", "sdbf", "model", "nameless")

SRC_JAR_GLOB = "last_smith-*.jar"
SRC_IN_JAR = "assets/last_smith/model/named/odachi/odachi.png"

# ---------------------------------------------------------------------------
# 五把刀的配色配方
#   hue    : 目标色相（度，None = 保持原色相）
#   hue_mix: 向目标色相混合的比例 0~1
#   sat    : 饱和度倍率
#   val    : 明度倍率
#   gamma  : 明度曲线 gamma（<1 提亮暗部，>1 压暗中间调）
#   tint   : 向该颜色整体混合（None = 不混），tint_amt 为比例
# ---------------------------------------------------------------------------
VARIANTS = [
    {
        "file": "nameless_faded.png",
        "cn": "无名「褪名」",
        "note": "灰烬铁 —— 被抹去的名字，冷灰的无铭之刃",
        "hue": 215, "hue_mix": 0.85,
        "sat": 0.10, "val": 0.96, "gamma": 1.00,
        "tint": (0x86, 0x8D, 0x93), "tint_amt": 0.18,
    },
    {
        "file": "nameless_lone.png",
        "cn": "无名「孤高」",
        "note": "暗青铜 + 铜绿 —— 古王的甲色，寂静的孤高",
        "hue": 34, "hue_mix": 0.80,
        "sat": 0.72, "val": 0.72, "gamma": 1.05,
        "tint": (0x6E, 0x8A, 0x6B), "tint_amt": 0.12,
    },
    {
        "file": "nameless_thunder.png",
        "cn": "无名「雷霆」",
        "note": "雷蓝白 —— 王者夺回的第一道权柄",
        "hue": 205, "hue_mix": 0.85,
        "sat": 0.62, "val": 1.05, "gamma": 0.88,
        "tint": (0xCF, 0xE8, 0xFF), "tint_amt": 0.14,
    },
    {
        "file": "nameless_judgement.png",
        "cn": "无名「天罚」",
        "note": "风化暗金 + 紫电 —— 审判之雷自云中落下",
        "hue": 42, "hue_mix": 0.90,
        "sat": 0.92, "val": 0.86, "gamma": 0.92,
        "tint": (0x5A, 0x3F, 0x8C), "tint_amt": 0.08,
    },
    {
        "file": "nameless_king.png",
        "cn": "无名王者「无冠」",
        "note": "黑金 + 龙王双翼 —— 加冕之时，龙王俯首",
        "hue": 45, "hue_mix": 0.92,
        "sat": 1.12, "val": 0.80, "gamma": 1.22,
        "tint": (0xF0, 0xD0, 0x71), "tint_amt": 0.16,
    },
]


def load_source() -> Image.Image:
    """从 last_smith 模组 jar 中读取基础贴图。"""
    jars = sorted(glob.glob(os.path.join(MODS_DIR, SRC_JAR_GLOB)))
    if not jars:
        raise SystemExit(f"未找到模组 jar：{os.path.join(MODS_DIR, SRC_JAR_GLOB)}")
    jar = jars[-1]
    with zipfile.ZipFile(jar) as z:
        data = z.read(SRC_IN_JAR)
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    print(f"基础贴图: {os.path.basename(jar)} :: {SRC_IN_JAR}  {im.size}")
    return im


def remap(im: Image.Image, cfg: dict) -> Image.Image:
    """色相重映射 + 饱和度/明度调整 + 整体染色。"""
    out = Image.new("RGBA", im.size)
    src = im.load()
    dst = out.load()
    w, h = im.size

    th = (cfg["hue"] / 360.0) if cfg["hue"] is not None else None
    hm = cfg["hue_mix"]
    sat_m = cfg["sat"]
    val_m = cfg["val"]
    gamma = cfg["gamma"]
    tr, tg, tb = cfg["tint"] if cfg["tint"] else (None, None, None)
    ta = cfg["tint_amt"]

    for y in range(h):
        for x in range(w):
            r, g, b, a = src[x, y]
            if a == 0:
                dst[x, y] = (r, g, b, a)
                continue

            hh, ss, vv = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)

            # --- 色相重映射（走环形最短路径） ---
            if th is not None and ss > 0.02:
                d = (th - hh) % 1.0
                if d > 0.5:
                    d -= 1.0
                hh = (hh + d * hm) % 1.0

            # --- 饱和度 / 明度 ---
            ss = min(1.0, max(0.0, ss * sat_m))
            vv = min(1.0, max(0.0, vv * val_m))
            vv = pow(vv, gamma)

            nr, ng, nb = colorsys.hsv_to_rgb(hh, ss, vv)

            # --- 整体染色（提升色调整体协调度） ---
            if tr is not None:
                nr = nr * (1 - ta) + (tr / 255.0) * ta
                ng = ng * (1 - ta) + (tg / 255.0) * ta
                nb = nb * (1 - ta) + (tb / 255.0) * ta

            dst[x, y] = (
                min(255, max(0, int(round(nr * 255)))),
                min(255, max(0, int(round(ng * 255)))),
                min(255, max(0, int(round(nb * 255)))),
                a,
            )
    return out


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    base = load_source()

    made = []
    for cfg in VARIANTS:
        img = remap(base, cfg)
        path = os.path.join(OUT_DIR, cfg["file"])
        img.save(path)
        made.append((cfg, img))
        print(f"  -> {cfg['file']}  {cfg['cn']}")

    # 拼接预览图（1 行 5 张，横向）
    w, h = base.size
    strip = Image.new("RGBA", (w * len(made), h), (24, 24, 28, 255))
    for i, (_, img) in enumerate(made):
        strip.alpha_composite(img, (i * w, 0))
    preview_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview")
    os.makedirs(preview_dir, exist_ok=True)
    preview = os.path.join(preview_dir, "nameless_preview.png")
    strip.save(preview)
    print(f"预览: {preview}")


if __name__ == "__main__":
    main()
