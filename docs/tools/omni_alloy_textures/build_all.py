"""单独重绘万象合金专用材料贴图。

用法（在整合包根目录）：
    python -X utf8 docs/tools/omni_alloy_textures/build_all.py [输出目录]
不给输出目录时直接写入 kubejs/assets/kubejs/textures；给出目录时只输出到该目录，便于预览对比。
完整流程（同时刷新模型、所有权清单和总览图）请运行 docs/tools/draw_omni_alloy_textures.py。需要 Pillow。
"""
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))

from omni_alloy_sources import read_catalog  # noqa: E402
from build import draw_textures  # noqa: E402

ROOT = HERE.parents[2]


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "kubejs" / "assets" / "kubejs" / "textures"
    written = draw_textures(read_catalog()["registrations"], out)
    pngs = sum(1 for p in written if p.suffix == ".png")
    print(f"已写出 {pngs} 张贴图和 {len(written) - pngs} 个动画元数据到 {out}")


if __name__ == "__main__":
    main()
