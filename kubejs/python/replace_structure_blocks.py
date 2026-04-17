import os
try:
    import nbtlib
except ImportError:
    print("请先通过终端安装 nbtlib: pip install nbtlib")
    exit(1)

# 目标文件夹路径
TARGET_DIR = r"c:\Users\Tony\AppData\Roaming\PrismLauncher\instances\SenDimsBanForges\minecraft\kubejs\data\dungeons_arise\structures\coliseum"

# 在这里填写你的替换字典
# 格式: "旧方块ID": "新方块ID"
REPLACEMENTS = {
    "minecraft:sandstone": "ad_astra:polished_conglomerate",
    "minecraft:smooth_stone_slab": "ad_astra:ostrum_plating_slab",
    "minecraft:stone_bricks": "ad_astra:mars_stone_bricks",
    "minecraft:stone_brick_stairs": "ad_astra:mars_stone_brick_stairs",
    "minecraft:cobblestone_wall": "ad_astra:mars_stone_brick_wall",
    "minecraft:andesite": "ad_astra:mars_cobblestone",
    "minecraft:chiseled_stone_bricks": "ad_astra:chiseled_mars_stone_bricks",
    "minecraft:stone": "ad_astra:mars_stone",
    "minecraft:oak_leaves": "ad_astra:conglomerate",
    "minecraft:cut_sandstone": "ad_astra:ostrum_pillar",
    "minecraft:sandstone_stairs": "ad_astra:ostrum_plating_stairs",
    "minecraft:polished_andesite": "ad_astra:polished_mars_stone",
    "minecraft:chiseled_sandstone": "ad_astra:ostrum_plating",
    "minecraft:cracked_stone_bricks": "ad_astra:cracked_mars_stone_bricks",
    "minecraft:cobblestone": "ad_astra:mars_cobblestone",
    "minecraft:stone_button": "ad_astra:ostrum_plating_button",
}

def process_palette(palette):
    """
    处理传入的调色板（方块状态表），查找并替换方块。
    """
    changed = False
    for state in palette:
        name = str(state["Name"])
        if name in REPLACEMENTS:
            new_name = REPLACEMENTS[name]
            # 更新方块ID
            state["Name"] = nbtlib.String(new_name)
            
            # 保留同类型方块的 blockstate（如楼梯的朝向、台阶的状态等）
            # 否则删除旧方块的属性以防崩溃（例如树叶变成普通方块会因为附带 distance 属性报错）
            if "Properties" in state:
                if "stairs" in name or "slab" in name or "wall" in name or "button" in name:
                    pass  # 保留属性
                else:
                    del state["Properties"]
            
            changed = True
    return changed

def main():
    if not os.path.exists(TARGET_DIR):
        print(f"找不到目标文件夹: {TARGET_DIR}")
        return

    print("开始处理结构文件...")
    for filename in os.listdir(TARGET_DIR):
        if not filename.endswith(".nbt"):
            continue
        
        filepath = os.path.join(TARGET_DIR, filename)
        
        try:
            # 加载 NBT 结构文件（Minecraft结构通常是gzipped压缩的）
            nbt_file = nbtlib.load(filepath, gzipped=True)
            needs_saving = False
            
            # 结构格式中，方块定义储存在 palette 或 palettes 中
            if "palette" in nbt_file:
                if process_palette(nbt_file["palette"]):
                    needs_saving = True
                    
            # 兼容包含随机化/多开调色板的结构文件
            if "palettes" in nbt_file:
                for palette in nbt_file["palettes"]:
                    if process_palette(palette):
                        needs_saving = True
            
            # 只有发生替换时才保存，以免造成不必要的修改
            if needs_saving:
                nbt_file.save(filepath, gzipped=True)
                print(f"[成功] 已更新 -> {filename}")
            else:
                print(f"[跳过] 无需替换 -> {filename}")
                
        except Exception as e:
            print(f"[错误] 处理 {filename} 时出错: {e}")

    print("处理完毕！")

if __name__ == "__main__":
    main()
