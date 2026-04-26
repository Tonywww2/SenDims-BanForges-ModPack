import re
import os

def find_balanced_block(text, start_index):
    """
    从指定位置开始，找到第一个平衡的 { } 块的结束位置。
    Finds the end index of the balanced { } block starting from start_index.
    """
    brace_count = 0
    found_first = False
    for i in range(start_index, len(text)):
        if text[i] == '{':
            brace_count += 1
            found_first = True
        elif text[i] == '}':
            brace_count -= 1
        
        if found_first and brace_count == 0:
            return i + 1
    return -1

def process_snbt_content(content):
    """
    精确识别并转换拔刀剑任务。
    Precisely identifies and converts SlashBlade tasks.
    """
    # 1. 查找所有任务类型为 "item" 的位置 
    # Find all occurrences of type: "item"
    task_markers = list(re.finditer(r'type:\s*"item"', content))
    
    blocks_to_replace = []

    for marker in task_markers:
        # 2. 向上寻找包裹该 marker 的最小 { } 块（即 Task 块而非 Quest 块）
        # Search upwards for the smallest wrapping { } block (Task block)
        search_ptr = marker.start()
        block_start = -1
        block_end = -1
        
        while search_ptr >= 0:
            if content[search_ptr] == '{':
                end_ptr = find_balanced_block(content, search_ptr)
                # 检查这个块是否真的包裹了当前的 marker 
                if end_ptr > marker.end():
                    block_start = search_ptr
                    block_end = end_ptr
                    break
            search_ptr -= 1
            
        if block_start != -1:
            block_text = content[block_start:block_end]
            
            # 3. 提取必要信息并验证是否为需要转换的拔刀剑 
            # Extract info and verify if it's a SlashBlade task needing conversion
            tk_match = re.search(r'translationKey:\s*"([^"]+)"', block_text)
            id_match = re.search(r'id:\s*"([A-Z0-9]+)"', block_text)
            
            # 检查是否已经是 smart_filter，防止重复处理 
            is_already_filter = "ftbfiltersystem:smart_filter" in block_text
            
            if tk_match and id_match and not is_already_filter:
                blocks_to_replace.append({
                    'start': block_start,
                    'end': block_end,
                    'task_id': id_match.group(1),
                    'translation_key': tk_match.group(1)
                })

    # 4. 从后往前替换，避免破坏尚未处理的字符索引
    # Replace from back to front to maintain index integrity
    new_content = content
    for b in reversed(blocks_to_replace):
        new_task_block = f'''{{
				id: "{b['task_id']}"
				item: {{
					Count: 1
					id: "ftbfiltersystem:smart_filter"
					tag: {{
						display: {{
							Name: "{{\\"translate\\":\\"{b['translation_key']}\\"}}"
						}}
						"ftbfiltersystem:filter": "nbt(fuzzy:{{bladeState:{{translationKey:\\"{b['translation_key']}\\"}}}})"
					}}
				}}
				type: "item"
			}}'''
        new_content = new_content[:b['start']] + new_task_block + new_content[b['end']:]
        
    return new_content

def run_converter():
    directory = "."
    files_processed = 0

    for filename in os.listdir(directory):
        if filename.endswith(".snbt"):
            path = os.path.join(directory, filename)
            with open(path, 'r', encoding='utf-8') as f:
                original_content = f.read()

            modified_content = process_snbt_content(original_content)

            if modified_content != original_content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(modified_content)
                print(f"✅ 已安全更新 / Safely Updated: {filename}")
                files_processed += 1
            else:
                print(f"ℹ️ 未发现需转换项 / No changes needed: {filename}")

    print(f"\n处理完成！共处理了 {files_processed} 个文件。")

if __name__ == "__main__":
    run_converter()