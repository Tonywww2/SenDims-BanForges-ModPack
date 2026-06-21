#!/usr/bin/env python3
"""
Minecraft NBT 结构文件方块替换脚本

将 sandworm_nest.nbt 结构文件中的原版方块替换为自定义模组方块。

替换映射:
  minecraft:sand              → slashblade_sendims:saturn_sandstone
  minecraft:smooth_sandstone  → slashblade_sendims:saturn_stone
  minecraft:sandstone         → slashblade_sendims:saturn_cobblestone
  minecraft:sandstone_stairs  → slashblade_sendims:porous_saturn_stone

用法:
  pip install nbtlib
  python replace_nbt_blocks.py
"""

import shutil
from datetime import datetime
from pathlib import Path

try:
    import nbtlib
    from nbtlib.tag import String, Compound, List
except ImportError:
    print("错误: 请先安装 nbtlib 库")
    print("  pip install nbtlib")
    exit(1)


# ============================================================
# 配置区
# ============================================================

# 输入文件路径
INPUT_FILE = Path("kubejs") / "data" / "block_factorys_bosses" / "structures" / "sandworm_nest.nbt"

# 输出文件路径（None 表示覆盖原文件）
OUTPUT_FILE = None  # 设为 None 则覆盖原文件；设为 Path(...) 则输出到新文件

# 是否创建备份（仅当 OUTPUT_FILE 为 None 时生效）
CREATE_BACKUP = True

# 方块替换映射表
REPLACEMENTS = {
    "minecraft:sand":              "slashblade_sendims:saturn_sandstone",
    "minecraft:smooth_sandstone":  "slashblade_sendims:saturn_stone",
    "minecraft:sandstone":         "slashblade_sendims:saturn_cobblestone",
    "minecraft:sandstone_stairs":  "slashblade_sendims:porous_saturn_stone",
}


# ============================================================
# 主逻辑
# ============================================================

def replace_in_nbt(tag, replacements: dict, stats: dict):
    """
    递归遍历 NBT 标签树，替换字符串值。
    对于结构文件，主要修改 palette 列表中的 Name 字段。
    """
    if isinstance(tag, String):
        old_val = str(tag)
        if old_val in replacements:
            new_val = replacements[old_val]
            stats["replaced"] += 1
            stats["details"].append(f"  {old_val} → {new_val}")
            return String(new_val)

    elif isinstance(tag, Compound):
        for key in tag:
            tag[key] = replace_in_nbt(tag[key], replacements, stats)

    elif isinstance(tag, List):
        for i in range(len(tag)):
            tag[i] = replace_in_nbt(tag[i], replacements, stats)

    return tag


def main():
    # 切换到脚本所在目录，使相对路径生效
    script_dir = Path(__file__).parent.resolve()
    import os
    os.chdir(script_dir)

    input_path = Path(INPUT_FILE).resolve()
    if not input_path.exists():
        print(f"错误: 找不到文件 {input_path}")
        print(f"当前工作目录: {Path.cwd()}")
        exit(1)

    # 创建备份
    if CREATE_BACKUP and OUTPUT_FILE is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = input_path.with_suffix(f".nbt.{timestamp}.bak")
        shutil.copy2(input_path, backup_path)
        print(f"✓ 已创建备份: {backup_path.name}")

    # 加载 NBT（nbtlib.load 自动处理 gzip）
    print(f"加载文件: {input_path}")
    nbt_data = nbtlib.load(str(input_path), gzipped=True)
    print(f"  NBT 顶层键: {list(nbt_data.keys())}")

    # 替换方块 — File 本身就是根 Compound，直接递归遍历
    stats = {"replaced": 0, "details": []}
    replace_in_nbt(nbt_data, REPLACEMENTS, stats)

    # 保存结果（save 自动处理 gzip 压缩）
    output_path = OUTPUT_FILE if OUTPUT_FILE else input_path
    nbt_data.save(str(output_path), gzipped=True)

    # 输出统计
    print(f"\n替换完成! 共替换 {stats['replaced']} 个方块:")
    for detail in stats["details"]:
        print(detail)
    print(f"\n输出文件: {output_path}")


if __name__ == "__main__":
    main()
