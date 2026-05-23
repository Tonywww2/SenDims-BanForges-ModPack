# -*- coding: utf-8 -*-
import os
import sys
import struct
import zlib
import io
import argparse

try:
    import nbtlib
except ImportError:
    print("错误: 未找到 nbtlib 库。")
    print("请先运行以下命令安装: pip install nbtlib")
    sys.exit(1)

def process_mca_file(input_path, output_path):
    """
    处理单个 .mca 文件，清空所有区块中的 block_entities 数据
    """
    if not os.path.exists(input_path):
        print(f"错误: 文件不存在 {input_path}")
        return False

    # 检查文件大小，如果小于 8192 字节，直接判定为损坏/空文件
    if os.path.getsize(input_path) < 8192:
        print(f"跳过: {input_path} 文件过小或已损坏 (Minecraft未完整生成该区域)。")
        return False

    with open(input_path, 'rb') as f:
        header_locations = f.read(4096)
        header_timestamps = f.read(4096)
        
        if len(header_locations) < 4096 or len(header_timestamps) < 4096:
            print(f"错误: {input_path} 不是有效的 Anvil 区域文件(文件头损坏)。已跳过。")
            return False

        out_chunks_data = bytearray()
        out_locations = bytearray(4096)
        
        current_sector = 2  # 前两个扇区(8192字节)留给文件头
        modified_chunks_count = 0
        
        for i in range(1024):
            loc_bytes = header_locations[i*4:(i+1)*4]
            offset = int.from_bytes(loc_bytes[:3], 'big')
            sector_count = loc_bytes[3]
            
            if offset == 0:
                continue
                
            f.seek(offset * 4096)
            length_bytes = f.read(4)
            if not length_bytes or len(length_bytes) < 4:
                continue
                
            length = struct.unpack('>I', length_bytes)[0]
            compression_type = f.read(1)[0]
            
            compressed_data = f.read(length - 1)
            
            try:
                # 解压 NBT 数据
                if compression_type == 2:
                    raw_nbt = zlib.decompress(compressed_data)
                elif compression_type == 1:
                    raw_nbt = zlib.decompress(compressed_data, 16 + zlib.MAX_WBITS)
                else:
                    raw_nbt = compressed_data
                
                buffer = io.BytesIO(raw_nbt)
                
                # 兼容性修复：使用多种方法尝试解析 NBT 字节流
                try:
                    nbt_file = nbtlib.File.parse(buffer, byteorder='big')
                except AttributeError:
                    try:
                        nbt_file = nbtlib.File.from_fileobj(buffer, byteorder='big')
                    except AttributeError:
                        buffer.seek(0)
                        nbt_file = nbtlib.load(buffer, gzipped=False, byteorder='big')
                
                chunk_modified = False
                
                if 'block_entities' in nbt_file:
                    nbt_file['block_entities'] = nbtlib.List([])
                    chunk_modified = True
                elif 'Level' in nbt_file:
                    level = nbt_file['Level']
                    if 'block_entities' in level:
                        level['block_entities'] = nbtlib.List([])
                        chunk_modified = True
                    elif 'TileEntities' in level:
                        level['TileEntities'] = nbtlib.List([])
                        chunk_modified = True
                
                if chunk_modified:
                    modified_chunks_count += 1
                
                # 将修改后的 NBT 重新序列化为字节流
                output_buffer = io.BytesIO()
                try:
                    nbt_file.write(output_buffer, byteorder='big')
                except AttributeError:
                    nbt_file.save(output_buffer, gzipped=False)
                
                new_raw_nbt = output_buffer.getvalue()
                
                # 重新压缩数据
                new_compressed = zlib.compress(new_raw_nbt)
                new_length = len(new_compressed) + 1
                
                chunk_bytes = struct.pack('>I', new_length) + bytes([compression_type]) + new_compressed
                
                padding_len = (4096 - (len(chunk_bytes) % 4096)) % 4096
                chunk_bytes += b'\x00' * padding_len
                
                sectors_used = len(chunk_bytes) // 4096
                
                out_locations[i*4:i*4+3] = current_sector.to_bytes(3, 'big')
                out_locations[i*4+3] = sectors_used
                
                out_chunks_data.extend(chunk_bytes)
                current_sector += sectors_used
                
            except Exception as e:
                # 打印详细错误以供调试，但保证该区块原样保留
                print(f"警告: 处理区块 idx {i} 时发生错误 ({type(e).__name__}: {e})。该区块将保持原样。")
                f.seek(offset * 4096)
                orig_chunk_bytes = f.read(sector_count * 4096)
                
                out_locations[i*4:i*4+3] = current_sector.to_bytes(3, 'big')
                out_locations[i*4+3] = sector_count
                out_chunks_data.extend(orig_chunk_bytes)
                current_sector += sector_count

    with open(output_path, 'wb') as out_f:
        out_f.write(out_locations)
        out_f.write(header_timestamps)
        out_f.write(out_chunks_data)
        
    print(f"成功处理: {os.path.basename(input_path)} | 清理了 {modified_chunks_count} 个区块的方块实体数据。")
    return True

def main():
    parser = argparse.ArgumentParser(description="Minecraft 1.20.1 区域文件(.mca)方块实体NBT清空工具")
    parser.add_argument("-i", "--input", required=True, help="输入的.mca文件路径 或 包含.mca文件的文件夹路径")
    parser.add_argument("-o", "--output", required=True, help="输出的保存路径（切勿直接覆盖原存档文件夹！）")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.output):
        os.makedirs(args.output)
        
    if os.path.isdir(args.input):
        print(f"开始批量处理目录下的所有区域文件: {args.input}")
        files = [f for f in os.listdir(args.input) if f.endswith('.mca')]
        if not files:
            print("未在输入目录中找到任何 .mca 文件。")
            return
        for file_name in files:
            in_file = os.path.join(args.input, file_name)
            out_file = os.path.join(args.output, file_name)
            process_mca_file(in_file, out_file)
    else:
        if args.input.endswith('.mca'):
            out_file = os.path.join(args.output, os.path.basename(args.input)) if os.path.isdir(args.output) else args.output
            process_mca_file(args.input, out_file)
        else:
            print("错误: 输入文件必须是以 .mca 结尾的区域文件。")

if __name__ == "__main__":
    main()